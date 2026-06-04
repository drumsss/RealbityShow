import { useEffect, useRef, useState } from "react";

import {
  Animated,
  FlatList,
  PanResponder,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../firebase";
import { getUser } from "../session";

export default function Chat() {

  const [msg, setMsg] = useState("");
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const flatRef = useRef();

  const animValues = useRef({}).current;

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
        if (!animValues[m.id]) {
          animValues[m.id] = new Animated.Value(0);

          Animated.spring(animValues[m.id], {
            toValue: 1,
            friction: 7,
            useNativeDriver: true
          }).start();
        }
      });

      setMessages(data);

      setTimeout(() => {
        flatRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // typing realtime
    const typingRef = collection(db, "typing");

    const unsubTyping = onSnapshot(typingRef, (snap) => {
      const usersTyping = snap.docs.map(d => d.data().user)
        .filter(u => u !== user);

      setTypingUsers(usersTyping);
    });

    return () => {
      unsub();
      unsubTyping();
    };

  }, [user]);

  // 📩 SEND
  const send = async () => {

    if (!msg.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: msg,
      user,
      replyTo: replyTo || null,
      status: "sent",
      createdAt: serverTimestamp(),
      reactions: []
    });

    setMsg("");
    setReplyTo(null);

    // typing stop
    await setDoc(doc(db, "typing", user), {
      user,
      typing: false
    });
  };

  // ✍️ typing update
  const handleTyping = async (text) => {

    setMsg(text);

    await setDoc(doc(db, "typing", user), {
      user,
      typing: text.length > 0
    });
  };

  // 😂 reaction
  const addReaction = async (id, emoji) => {

    const refMsg = doc(db, "messages", id);

    const snap = messages.find(m => m.id === id);

    await updateDoc(refMsg, {
      reactions: [...(snap.reactions || []), emoji]
    });
  };

  // 📩 swipe gesture (reply)
  const createPanResponder = (item) => {

    let dx = 0;

    return PanResponder.create({

      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,

      onPanResponderMove: (_, g) => {
        dx = g.dx;
      },

      onPanResponderRelease: () => {

        if (dx > 80) {
          setReplyTo(item);
        }

        dx = 0;
      }
    });
  };

  const formatTime = (t) => {

    if (!t?.toDate) return "";

    const d = t.toDate();

    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatDate = (t) => {

    if (!t?.toDate) return "";

    const d = t.toDate();

    return d.toDateString();
  };

  const renderItem = ({ item, index }) => {

    const isMine = item.user === user;

    const prev = messages[index - 1];

    const newDay =
      !prev ||
      formatDate(prev.createdAt) !== formatDate(item.createdAt);

    const anim = animValues[item.id] || new Animated.Value(1);

    const pan = createPanResponder(item);

    return (

      <View>

        {/* DAY */}
        {newDay && (
          <View style={styles.dayWrap}>
            <Text style={styles.day}>{formatDate(item.createdAt)}</Text>
          </View>
        )}

        <Animated.View
          {...pan.panHandlers}
          style={[
            styles.row,
            {
              opacity: anim,
              transform: [{
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
        >

          <TouchableOpacity
            onLongPress={() => addReaction(item.id, "🔥")}
            onPress={() => setReplyTo(item)}
            style={[
              styles.bubble,
              isMine ? styles.me : styles.other
            ]}
          >

            {/* reply preview */}
            {item.replyTo && (
              <View style={styles.replyBox}>
                <Text style={styles.replyText}>
                  ↩ {item.replyTo.text}
                </Text>
              </View>
            )}

            <Text style={styles.text}>
              {item.text}
            </Text>

            {/* reactions */}
            {item.reactions?.length > 0 && (
              <View style={styles.reactions}>
                {item.reactions.map((r, i) => (
                  <Text key={i}>{r}</Text>
                ))}
              </View>
            )}

            <Text style={styles.time}>
              {formatTime(item.createdAt)}
            </Text>

          </TouchableOpacity>

        </Animated.View>

      </View>

    );
  };

  return (

    <View style={styles.container}>

      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>LIVE CHAT</Text>
      </View>

      {/* typing */}
      {typingUsers.length > 0 && (
        <Text style={styles.typing}>
          {typingUsers.join(", ")} sta scrivendo...
        </Text>
      )}

      {/* chat */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />

      {/* reply preview */}
      {replyTo && (
        <View style={styles.replyPreview}>
          <Text style={{ color: "#4dd0ff" }}>
            Risposta a: {replyTo.text}
          </Text>
        </View>
      )}

      {/* input */}
      <View style={styles.inputWrap}>

        <TextInput
          value={msg}
          onChangeText={handleTyping}
          style={styles.input}
          placeholder="Messaggio..."
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

  container: { flex: 1, backgroundColor: "#05060a" },

  header: {
    paddingTop: 60,
    alignItems: "center",
    paddingBottom: 10
  },

  title: { color: "#4dd0ff", letterSpacing: 3 },

  typing: {
    color: "#888",
    paddingLeft: 10,
    fontSize: 12
  },

  row: { marginVertical: 6 },

  bubble: {
    maxWidth: "78%",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)"
  },

  me: { alignSelf: "flex-end" },
  other: { alignSelf: "flex-start" },

  text: { color: "#fff" },

  time: { fontSize: 10, color: "#777", marginTop: 6 },

  replyBox: {
    borderLeftWidth: 2,
    borderLeftColor: "#4dd0ff",
    paddingLeft: 6,
    marginBottom: 4
  },

  replyText: { color: "#aaa", fontSize: 11 },

  reactions: { flexDirection: "row", marginTop: 4 },

  dayWrap: { alignItems: "center", marginVertical: 10 },

  day: { color: "#555", fontSize: 12 },

  inputWrap: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#070a12"
  },

  input: {
    flex: 1,
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 14,
    padding: 12
  },

  send: {
    width: 44,
    height: 44,
    marginLeft: 10,
    backgroundColor: "#4dd0ff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12
  },

  replyPreview: {
    paddingLeft: 10,
    paddingBottom: 5
  }

};