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

import { db } from "../../firebase";
import { getUser } from "../session";

export default function Chat() {

  const [msg, setMsg] = useState("");
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  const flatRef = useRef();

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

      setTimeout(() => {
        flatRef.current?.scrollToEnd({ animated: true });
      }, 100);

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

  const getInitial = (name) =>
    (name || "?").trim().charAt(0).toUpperCase();

  const getAvatarColor = (name) => {
    const colors = ["#4dd0ff", "#ff4d6d", "#ffd166", "#06d6a0", "#a78bfa"];
    let hash = 0;

    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const renderItem = ({ item }) => {

    const isMine = item.user === user;

    return (

      <View style={[
        styles.row,
        isMine ? styles.right : styles.left
      ]}>

        {!isMine && (
          <View style={[
            styles.avatar,
            { backgroundColor: getAvatarColor(item.user) }
          ]}>
            <Text style={styles.avatarText}>
              {getInitial(item.user)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setReplyTo(item)}
        >

          <View style={[
            styles.bubble,
            isMine ? styles.me : styles.other
          ]}>

            {!isMine && (
              <Text style={styles.user}>{item.user}</Text>
            )}

            {item.replyTo && (
              <Text style={styles.replyText}>
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

        {isMine && (
          <View style={[
            styles.avatar,
            { backgroundColor: getAvatarColor(item.user) }
          ]}>
            <Text style={styles.avatarText}>
              {getInitial(item.user)}
            </Text>
          </View>
        )}

      </View>
    );
  };

  return (

    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>LIVE CHAT</Text>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />

      {replyTo && (
        <View style={styles.replyPreview}>
          <Text style={styles.replyPreviewText}>
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
          multiline={false}
        />

        <TouchableOpacity onPress={send} style={styles.send}>
          <Text style={{ color: "#000" }}>➤</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = {

  container: { flex: 1, backgroundColor: "#05060a" },

  header: {
    paddingTop: 50,
    paddingBottom: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)"
  },

  title: {
    color: "#4dd0ff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 2
  },

  row: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-end"
  },

  left: { justifyContent: "flex-start" },
  right: { justifyContent: "flex-end", flexDirection: "row-reverse" },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6
  },

  avatarText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 12
  },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 14
  },

  me: { backgroundColor: "rgba(77,208,255,0.15)" },
  other: { backgroundColor: "rgba(255,255,255,0.06)" },

  user: { color: "#4dd0ff", fontSize: 11, marginBottom: 3 },

  text: {
    color: "#fff",
    fontSize: 15,
    flexWrap: "wrap"
  },

  time: {
    fontSize: 10,
    color: "#777",
    marginTop: 4,
    textAlign: "right"
  },

  replyText: {
    color: "#aaa",
    fontSize: 11,
    marginBottom: 4
  },

  replyPreview: {
    padding: 10
  },

  replyPreviewText: {
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