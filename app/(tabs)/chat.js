import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
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

import { db } from "../../firebase";
import { getUser } from "../session";

export default function Chat() {

  const [msg, setMsg] = useState("");
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  const flatRef = useRef();

  // 🎬 LOGO ANIMAZIONE INGRESSO
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslate = useRef(new Animated.Value(-15)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {

    getUser().then(setUser);

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {

      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setMessages(data);

      setTimeout(() => {
        flatRef.current?.scrollToEnd({ animated: true });
      }, 80);

    });

    // 🎬 ANIMAZIONE LOGO
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true
      }),
      Animated.timing(logoTranslate, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true
      })
    ]).start();

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
      createdAt: serverTimestamp(),
      replyTo: replyTo || null
    });

    setMsg("");
    setReplyTo(null);
  };

  const formatTime = (t) => {
    if (!t?.toDate) return "";
    const d = t.toDate();
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const renderItem = ({ item }) => {

    const isMine = item.user === user;

    return (
      <View style={[
        styles.row,
        isMine ? styles.right : styles.left
      ]}>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setReplyTo(item)}
          style={styles.bubbleWrapper}
        >

          <View style={[
            styles.bubble,
            isMine ? styles.me : styles.other
          ]}>

            <Text style={styles.user}>
              {item.user}
            </Text>

            {item.replyTo && (
              <Text style={styles.reply}>
                ↩ {item.replyTo.text}
              </Text>
            )}

            <Text style={styles.text}>
              {item.text}
            </Text>

            <Text style={styles.time}>
              {formatTime(item.createdAt)}
            </Text>

          </View>

        </TouchableOpacity>

      </View>
    );
  };

  return (

    <View style={styles.container}>

      {/* HEADER LOGO */}
      <Animated.View
        style={[
          styles.logoBox,
          {
            opacity: logoOpacity,
            transform: [
              { translateY: logoTranslate },
              { scale: logoScale }
            ]
          }
        ]}
      >
        <Image
          source={require("../../assets/logo_bw.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.header}>
        <Text style={styles.title}>LIVE CHAT</Text>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 10,
          paddingBottom: 20
        }}
      />

      {replyTo && (
        <View style={styles.replyBox}>
          <Text style={styles.replyText}>
            Rispondi a: {replyTo.text}
          </Text>
        </View>
      )}

      <View style={styles.inputRow}>

        <TextInput
          value={msg}
          onChangeText={setMsg}
          style={styles.input}
          placeholder="Scrivi..."
          placeholderTextColor="#666"
        />

        <TouchableOpacity onPress={send} style={styles.send}>
          <Text style={{ color: "#000" }}>➤</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = {

  container: {
    flex: 1,
    backgroundColor: "#05060a"
  },

  logoBox: {
    alignItems: "center",
    marginTop: 35,
    marginBottom: 5
  },

  logo: {
    width: 55,
    height: 55
  },

  header: {
    alignItems: "center",
    marginBottom: 5
  },

  title: {
    color: "#4dd0ff",
    fontSize: 18,
    fontWeight: "700"
  },

  row: {
    width: "100%",
    flexDirection: "row",
    marginVertical: 3
  },

  left: {
    justifyContent: "flex-start"
  },

  right: {
    justifyContent: "flex-end"
  },

  bubbleWrapper: {
    maxWidth: "80%"
  },

  bubble: {
    padding: 10,
    borderRadius: 14,
    minWidth: 40
  },

  me: {
    backgroundColor: "rgba(77,208,255,0.18)",
    alignSelf: "flex-end"
  },

  other: {
    backgroundColor: "rgba(255,255,255,0.06)",
    alignSelf: "flex-start"
  },

  user: {
    color: "#4dd0ff",
    fontSize: 11,
    marginBottom: 3
  },

  text: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 20,
    flexShrink: 1,
    flexWrap: "wrap",
    includeFontPadding: false,
    textBreakStrategy: "simple"
  },

  time: {
    fontSize: 10,
    color: "#777",
    marginTop: 4,
    textAlign: "right"
  },

  reply: {
    color: "#aaa",
    fontSize: 11,
    marginBottom: 4
  },

  replyBox: {
    padding: 8,
    backgroundColor: "#0b0f1a"
  },

  replyText: {
    color: "#4dd0ff"
  },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#070a12"
  },

  input: {
    flex: 1,
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 12,
    padding: 12
  },

  send: {
    width: 44,
    height: 44,
    marginLeft: 10,
    backgroundColor: "#4dd0ff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10
  }
};