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
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { db } from "../../firebase";
import { getUser } from "../session";

export default function Chat() {

  const [msg, setMsg] = useState("");
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [selected, setSelected] = useState(null);

  const flatRef = useRef();
  const anim = useRef({}).current;

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

      data.forEach(m => {
        if (!anim[m.id]) {
          anim[m.id] = new Animated.Value(0);

          Animated.spring(anim[m.id], {
            toValue: 1,
            useNativeDriver: true,
            friction: 7
          }).start();
        }
      });

      setMessages(data);

      setTimeout(() => {
        flatRef.current?.scrollToEnd({ animated: true });
      }, 100);

    });

    return unsub;

  }, []);

  // 🧹 CLEAN CHAT
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
      replyTo: replyTo || null,
      reactions: []
    });

    setMsg("");
    setReplyTo(null);
  };

  // 🗑 DELETE MESSAGE
  const deleteMessage = async (id, owner) => {

    if (owner !== user) return;

    await deleteDoc(doc(db, "messages", id));
  };

  // 😂 REACTION
  const react = async (id, emoji) => {

    const refMsg = doc(db, "messages", id);

    const m = messages.find(x => x.id === id);

    await updateDoc(refMsg, {
      reactions: [...(m.reactions || []), emoji]
    });

    setSelected(null);
  };

  const formatTime = (t) => {

    if (!t?.toDate) return "";

    const d = t.toDate();

    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatDate = (t) => {

    if (!t?.toDate) return "";

    return t.toDate().toDateString();
  };

  const renderItem = ({ item, index }) => {

    const isMine = item.user === user;

    const prev = messages[index - 1];

    const newDay =
      !prev ||
      formatDate(prev.createdAt) !== formatDate(item.createdAt);

    const animVal = anim[item.id] || new Animated.Value(1);

    return (

      <View>

        {/* DAY SEPARATOR */}
        {newDay && (
          <View style={styles.dayWrap}>
            <Text style={styles.dayText}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        )}

        {/* MESSAGE */}
        <Animated.View
          style={[
            styles.row,
            {
              opacity: animVal,
              transform: [{
                translateY: animVal.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }],
              alignSelf: isMine ? "flex-end" : "flex-start"
            }
          ]}
        >

          <TouchableOpacity
            onLongPress={() => setSelected(item.id)}
            onPress={() => setReplyTo(item)}
            style={[
              styles.bubble,
              isMine ? styles.me : styles.other
            ]}
          >

            {/* REPLY */}
            {item.replyTo && (
              <View style={styles.replyBox}>
                <Text style={styles.replyText}>
                  ↩ {item.replyTo.text}
                </Text>
              </View>
            )}

            <Text style={styles.user}>{item.user}</Text>

            <Text style={styles.text}>{item.text}</Text>

            {/* REACTIONS */}
            {item.reactions?.length > 0 && (
              <View style={styles.reactions}>
                {item.reactions.map((r, i) => (
                  <Text key={i} style={styles.react}>
                    {r}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.time}>
              {formatTime(item.createdAt)}
            </Text>

          </TouchableOpacity>

          {/* EMOJI BAR */}
          {selected === item.id && (
            <View style={styles.emojiBar}>

              {["🔥", "😂", "❤️", "👍", "😮"].map(e => (
                <TouchableOpacity
                  key={e}
                  onPress={() => react(item.id, e)}
                >
                  <Text style={styles.emoji}>{e}</Text>
                </TouchableOpacity>
              ))}

            </View>
          )}

          {/* DELETE BUTTON */}
          {item.user === user && selected === item.id && (
            <TouchableOpacity
              onPress={() => deleteMessage(item.id, item.user)}
              style={styles.deleteBtn}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>
                Cancella
              </Text>
            </TouchableOpacity>
          )}

        </Animated.View>

      </View>

    );
  };

  return (

    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>LIVE CHAT</Text>
      </View>

      {/* CHAT */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />

      {/* REPLY PREVIEW */}
      {replyTo && (
        <View style={styles.replyPreview}>
          <Text style={styles.replyPreviewText}>
            Rispondi a: {replyTo.text}
          </Text>
        </View>
      )}

      {/* INPUT */}
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

  header: {
    paddingTop: 60,
    paddingBottom: 10,
    alignItems: "center"
  },

  title: {
    color: "#4dd0ff",
    fontSize: 18,
    letterSpacing: 3
  },

  row: {
    marginVertical: 6
  },

  bubble: {
    padding: 12,
    borderRadius: 14,
    maxWidth: "78%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },

  me: {
    backgroundColor: "rgba(77,208,255,0.12)"
  },

  other: {
    backgroundColor: "rgba(255,255,255,0.05)"
  },

  user: {
    color: "#4dd0ff",
    fontSize: 12,
    marginBottom: 4
  },

  text: {
    color: "#fff",
    fontSize: 15
  },

  time: {
    fontSize: 10,
    color: "#777",
    marginTop: 6,
    textAlign: "right"
  },

  reactions: {
    flexDirection: "row",
    marginTop: 6
  },

  react: {
    marginRight: 4
  },

  emojiBar: {
    flexDirection: "row",
    marginLeft: 8
  },

  emoji: {
    fontSize: 18,
    marginHorizontal: 4
  },

  dayWrap: {
    alignItems: "center",
    marginVertical: 10
  },

  dayText: {
    color: "#555",
    fontSize: 12
  },

  replyBox: {
    borderLeftWidth: 2,
    borderLeftColor: "#4dd0ff",
    paddingLeft: 6,
    marginBottom: 4
  },

  replyText: {
    color: "#aaa",
    fontSize: 11
  },

  replyPreview: {
    paddingLeft: 10,
    paddingBottom: 5
  },

  replyPreviewText: {
    color: "#4dd0ff",
    fontSize: 12
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
  },

  deleteBtn: {
    marginTop: 6,
    padding: 6,
    backgroundColor: "#ff3b3b",
    borderRadius: 8,
    alignSelf: "flex-start"
  }

};