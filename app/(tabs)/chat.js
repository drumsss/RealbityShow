import { useEffect, useRef, useState } from "react";

import {
  Animated,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";

import { Audio } from "expo-av";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "../../firebase";
import { getUser } from "../session";

export default function Chat() {

  const [msg, setMsg] = useState("");
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);

  const [recording, setRecording] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  const soundRef = useRef(null);

  // 🌊 ONDE
  const waves = useRef(
    [...Array(5)].map(() => new Animated.Value(10))
  ).current;

  const startWaveAnimation = () => {

    waves.forEach((w, i) => {

      Animated.loop(
        Animated.sequence([
          Animated.timing(w, {
            toValue: 30,
            duration: 300 + i * 80,
            useNativeDriver: false
          }),
          Animated.timing(w, {
            toValue: 10,
            duration: 300 + i * 80,
            useNativeDriver: false
          })
        ])
      ).start();

    });

  };

  const stopWaveAnimation = () => {

    waves.forEach(w => {
      w.stopAnimation(() => w.setValue(10));
    });

  };

  useEffect(() => {

    getUser().then(setUser);

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {

      setMessages(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );

    });

    return unsub;

  }, []);

  const send = async () => {

    if (!msg.trim()) return;

    if (msg.trim().toLowerCase() === "/clean") {

      const snap = await getDocs(collection(db, "messages"));

      await Promise.all(
        snap.docs.map(d =>
          deleteDoc(doc(db, "messages", d.id))
        )
      );

      setMsg("");
      return;
    }

    await addDoc(collection(db, "messages"), {
      text: msg,
      user,
      type: "text",
      createdAt: serverTimestamp()
    });

    setMsg("");
  };

  // 🎤 START RECORDING
  const startRecording = async () => {

    try {

      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const recording = new Audio.Recording();

      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      await recording.startAsync();

      setRecording(recording);
      startWaveAnimation();

    } catch (e) {
      console.log(e);
    }
  };

  // 🛑 STOP + UPLOAD
  const stopRecording = async () => {

    try {

      if (!recording) return;

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      const status = await recording.getStatusAsync();

      const duration =
        Math.floor(status.durationMillis / 1000) || 0;

      setRecording(null);
      stopWaveAnimation();

      // 🔥 CONVERT TO BLOB
      const blob = await fetch(uri).then(r => r.blob());

      const fileRef = ref(
        storage,
        `audio/${Date.now()}.m4a`
      );

      await uploadBytes(fileRef, blob);

      const downloadURL = await getDownloadURL(fileRef);

      await addDoc(collection(db, "messages"), {
        audio: downloadURL,
        duration,
        type: "audio",
        user,
        createdAt: serverTimestamp()
      });

    } catch (e) {
      console.log(e);
    }
  };

  // ▶ PLAY AUDIO
  const playAudio = async (uri, id) => {

    try {

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true
      });

      if (soundRef.current && playingId === id) {

        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();

        soundRef.current = null;
        setPlayingId(null);
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } =
        await Audio.Sound.createAsync({ uri });

      soundRef.current = sound;
      setPlayingId(id);

      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });

      await sound.playAsync();

    } catch (e) {
      console.log(e);
    }
  };

  const formatTime = (t) => {

    if (!t?.toDate) return "";

    const d = t.toDate();

    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatDuration = (s) => {

    const m = Math.floor(s / 60);
    const sec = s % 60;

    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const getNameColor = (name) => {

    const blue = ["drums", "chiara", "taddei", "licari"];
    const purple = ["ludo", "mimmo", "eli", "draane"];

    const n = name?.toLowerCase();

    if (blue.includes(n)) return "#00bfff";
    if (purple.includes(n)) return "#b266ff";

    return "#ffd700";
  };

  return (

    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>LIVE CHAT</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => {

          const isMine = item.user === user;

          return (

            <View style={[
              styles.row,
              { justifyContent: isMine ? "flex-end" : "flex-start" }
            ]}>

              <View style={[
                styles.bubble,
                isMine ? styles.me : styles.other
              ]}>

                <Text style={[styles.user, { color: getNameColor(item.user) }]}>
                  {item.user}
                </Text>

                {item.type === "audio" ? (

                  <TouchableOpacity
                    style={styles.audioBox}
                    onPress={() => playAudio(item.audio, item.id)}
                  >

                    <Text style={styles.play}>
                      {playingId === item.id ? "❚❚" : "▶"}
                    </Text>

                    <View style={styles.waveRow}>
                      {waves.map((w, i) => (
                        <Animated.View
                          key={i}
                          style={[styles.wave, { height: w }]}
                        />
                      ))}
                    </View>

                    <Text style={styles.duration}>
                      {formatDuration(item.duration || 0)}
                    </Text>

                  </TouchableOpacity>

                ) : (

                  <Text style={styles.text}>{item.text}</Text>

                )}

                <Text style={styles.time}>
                  {formatTime(item.createdAt)}
                </Text>

              </View>

            </View>

          );

        }}
      />

      <View style={styles.inputRow}>

        <TextInput
          value={msg}
          onChangeText={setMsg}
          style={styles.input}
          placeholder="Scrivi..."
          placeholderTextColor="#666"
        />

        <TouchableOpacity onPress={send} style={styles.send}>
          <Text>➤</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={[styles.mic, { backgroundColor: recording ? "#ff2b2b" : "#ffd700" }]}
        >
          <Text>{recording ? "■" : "🎤"}</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = {

  container: { flex: 1, backgroundColor: "#000", paddingTop: 50 },

  header: { padding: 10, borderBottomWidth: 1, borderColor: "#111" },

  title: { color: "#ffd700", textAlign: "center", fontSize: 22 },

  row: { marginVertical: 6, paddingHorizontal: 10 },

  bubble: { padding: 10, borderRadius: 15, maxWidth: "80%" },

  me: { backgroundColor: "#1c1c1c" },

  other: { backgroundColor: "#111" },

  user: { fontWeight: "bold", marginBottom: 5 },

  text: { color: "#fff" },

  time: { color: "#777", fontSize: 10, marginTop: 5, textAlign: "right" },

  audioBox: { flexDirection: "row", alignItems: "center" },

  play: { color: "#fff", marginRight: 10 },

  waveRow: { flexDirection: "row", flex: 1 },

  wave: { width: 4, backgroundColor: "#888", marginHorizontal: 2, borderRadius: 5 },

  duration: { color: "#ccc", marginLeft: 10, fontSize: 12 },

  inputRow: { flexDirection: "row", padding: 10 },

  input: { flex: 1, backgroundColor: "#111", color: "#fff", borderRadius: 20, padding: 10 },

  send: { width: 45, height: 45, backgroundColor: "#ffd700", justifyContent: "center", alignItems: "center", borderRadius: 100, marginLeft: 8 },

  mic: { width: 45, height: 45, justifyContent: "center", alignItems: "center", borderRadius: 100, marginLeft: 8 }

};