import { useEffect, useRef, useState } from "react";

import {
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

import { db } from "../../firebase";
import { getUser } from "../session";

export default function Chat() {

  const [msg, setMsg] = useState("");
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);

  const [recording, setRecording] = useState(null);

  const [playingId, setPlayingId] =
    useState(null);

  const soundRef = useRef(null);

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

    // CLEAN CHAT
    if (msg.trim().toLowerCase() === "/clean") {

      const snap = await getDocs(
        collection(db, "messages")
      );

      await Promise.all(
        snap.docs.map((d) =>
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

  // START AUDIO
  const startRecording = async () => {

    try {

      await Audio.requestPermissionsAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording } =
        await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

      setRecording(recording);

    } catch (err) {

      console.log(err);

    }

  };

  // STOP AUDIO
  const stopRecording = async () => {

    try {

      if (!recording) return;

      await recording.stopAndUnloadAsync();

      const status =
        await recording.getStatusAsync();

      const uri = recording.getURI();

      const duration =
        Math.floor(
          status.durationMillis / 1000
        ) || 0;

      setRecording(null);

      await addDoc(collection(db, "messages"), {
        audio: uri,
        duration,
        user,
        type: "audio",
        createdAt: serverTimestamp()
      });

    } catch (err) {

      console.log(err);

    }

  };

  // PLAYER AUDIO
  const playAudio = async (
    uri,
    id
  ) => {

    try {

      // STOP AUDIO SE GIÀ APERTO
      if (
        soundRef.current &&
        playingId === id
      ) {

        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();

        soundRef.current = null;
        setPlayingId(null);

        return;

      }

      // STOP ALTRO AUDIO
      if (soundRef.current) {

        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();

      }

      const { sound } =
        await Audio.Sound.createAsync({
          uri
        });

      soundRef.current = sound;

      setPlayingId(id);

      sound.setOnPlaybackStatusUpdate(
        (status) => {

          if (
            status.didJustFinish
          ) {

            setPlayingId(null);

          }

        }
      );

      await sound.playAsync();

    } catch (err) {

      console.log(err);

    }

  };

  // COLORI NOMI
  const getNameColor = (name) => {

    const blueTeam = [
      "drums",
      "chiara",
      "taddei",
      "licari"
    ];

    const purpleTeam = [
      "ludo",
      "mimmo",
      "eli",
      "draane"
    ];

    const n = name?.toLowerCase();

    if (blueTeam.includes(n)) {
      return "#00bfff";
    }

    if (purpleTeam.includes(n)) {
      return "#b266ff";
    }

    return "#ffd700";
  };

  // ORARIO
  const formatTime = (timestamp) => {

    if (!timestamp?.toDate) return "";

    const date = timestamp.toDate();

    const h = date.getHours();
    const m = date.getMinutes();

    return `${h}:${m < 10 ? "0" : ""}${m}`;

  };

  // DURATA AUDIO
  const formatDuration = (sec) => {

    const m = Math.floor(sec / 60);

    const s = sec % 60;

    return `${m}:${s < 10 ? "0" : ""}${s}`;

  };

  return (

    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Text style={styles.title}>
          LIVE CHAT
        </Text>

      </View>

      {/* CHAT */}
      <FlatList
        data={messages}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: 10
        }}
        style={{
          width: "100%"
        }}
        renderItem={({ item }) => {

          const isMine = item.user === user;

          return (

            <View
              style={[
                styles.messageRow,
                {
                  justifyContent: isMine
                    ? "flex-end"
                    : "flex-start"
                }
              ]}
            >

              <View
                style={[
                  styles.msgBox,
                  isMine
                    ? styles.myMessage
                    : styles.otherMessage
                ]}
              >

                <Text
                  style={[
                    styles.user,
                    {
                      color: getNameColor(item.user)
                    }
                  ]}
                >
                  {item.user}
                </Text>

                {item.type === "audio" ? (

                  <TouchableOpacity
                    style={styles.audioContainer}
                    onPress={() =>
                      playAudio(
                        item.audio,
                        item.id
                      )
                    }
                  >

                    {/* PLAY */}
                    <View
                      style={styles.playBtn}
                    >

                      <Text
                        style={
                          styles.playIcon
                        }
                      >
                        {playingId ===
                        item.id
                          ? "❚❚"
                          : "▶"}
                      </Text>

                    </View>

                    {/* ONDE */}
                    <View
                      style={styles.waveContainer}
                    >

                      <View
                        style={[
                          styles.wave,
                          {
                            height: 10
                          }
                        ]}
                      />

                      <View
                        style={[
                          styles.wave,
                          {
                            height: 18
                          }
                        ]}
                      />

                      <View
                        style={[
                          styles.wave,
                          {
                            height: 26
                          }
                        ]}
                      />

                      <View
                        style={[
                          styles.wave,
                          {
                            height: 14
                          }
                        ]}
                      />

                      <View
                        style={[
                          styles.wave,
                          {
                            height: 20
                          }
                        ]}
                      />

                      <View
                        style={[
                          styles.wave,
                          {
                            height: 30
                          }
                        ]}
                      />

                      <View
                        style={[
                          styles.wave,
                          {
                            height: 16
                          }
                        ]}
                      />

                    </View>

                    {/* DURATA */}
                    <Text
                      style={
                        styles.audioDuration
                      }
                    >
                      {formatDuration(
                        item.duration || 0
                      )}
                    </Text>

                  </TouchableOpacity>

                ) : (

                  <Text style={styles.text}>
                    {item.text}
                  </Text>

                )}

                <Text style={styles.time}>
                  {formatTime(item.createdAt)}
                </Text>

              </View>

            </View>

          );

        }}
      />

      {/* INPUT */}
      <View style={styles.inputWrapper}>

        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Scrivi un messaggio..."
          placeholderTextColor="#666"
          style={styles.input}
        />

        <TouchableOpacity
          onPress={send}
          style={styles.sendBtn}
        >

          <Text style={styles.sendIcon}>
            ➤
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          onPress={
            recording
              ? stopRecording
              : startRecording
          }
          style={[
            styles.micBtn,
            {
              backgroundColor:
                recording
                  ? "#ff2b2b"
                  : "#ffd700"
            }
          ]}
        >

          <Text style={styles.micIcon}>
            {recording
              ? "■"
              : "🎤"}
          </Text>

        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = {

  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 55
  },

  header: {
    paddingHorizontal: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#111"
  },

  title: {
    color: "#ffd700",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1
  },

  messageRow: {
    width: "100%",
    marginBottom: 12,
    paddingHorizontal: 14
  },

  msgBox: {
    maxWidth: "78%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18
  },

  myMessage: {
    backgroundColor: "#1c1c1c",
    borderBottomRightRadius: 5
  },

  otherMessage: {
    backgroundColor: "#111",
    borderBottomLeftRadius: 5
  },

  user: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 1
  },

  text: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22
  },

  time: {
    color: "#777",
    fontSize: 11,
    marginTop: 6,
    textAlign: "right"
  },

  // AUDIO
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginTop: 4
  },

  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 100,
    backgroundColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },

  playIcon: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold"
  },

  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },

  wave: {
    width: 4,
    borderRadius: 10,
    backgroundColor: "#888",
    marginHorizontal: 2
  },

  audioDuration: {
    color: "#ccc",
    fontSize: 12,
    marginLeft: 10,
    fontWeight: "bold"
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#111",
    backgroundColor: "#000"
  },

  input: {
    flex: 1,
    backgroundColor: "#111",
    color: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#1f1f1f"
  },

  sendBtn: {
    width: 55,
    height: 55,
    borderRadius: 100,
    backgroundColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },

  sendIcon: {
    color: "#000",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 2
  },

  micBtn: {
    width: 55,
    height: 55,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#ffd700",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5
  },

  micIcon: {
    fontSize: 22,
    color: "#000",
    fontWeight: "bold"
  }

};