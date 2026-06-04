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

import { db } from "../../firebase";
import { getUser } from "../session";

export default function Chat() {
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState([]);

  const flatRef = useRef();

  // anim refs per messaggi
  const anims = useRef({}).current;

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

      // init anim per nuovi messaggi
      data.forEach(m => {
        if (!anims[m.id]) {
          anims[m.id] = {
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(10)
          };

          Animated.parallel([
            Animated.timing(anims[m.id].opacity, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true
            }),
            Animated.timing(anims[m.id].translateY, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true
            })
          ]).start();
        }
      });

      setMessages(data);

      setTimeout(() => {
        flatRef.current?.scrollToEnd({ animated: true });
      }, 120);
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
      createdAt: serverTimestamp()
    });

    setMsg("");
  };

  const formatTime = (t) => {
    if (!t?.toDate) return "";
    const d = t.toDate();
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  // 📅 SEPARATORI DATA
  const getDayLabel = (current, prev) => {
    if (!current?.createdAt) return null;

    const c = current.createdAt.toDate?.();
    const p = prev?.createdAt?.toDate?.();

    if (!c) return null;

    const isSameDay =
      p &&
      c.getDate() === p.getDate() &&
      c.getMonth() === p.getMonth() &&
      c.getFullYear() === p.getFullYear();

    if (isSameDay) return null;

    const today = new Date();

    const diff =
      today.getDate() === c.getDate() &&
      today.getMonth() === c.getMonth() &&
      today.getFullYear() === c.getFullYear();

    if (diff) return "OGGI";

    const y = new Date();
    y.setDate(y.getDate() - 1);

    const isYesterday =
      y.getDate() === c.getDate() &&
      y.getMonth() === c.getMonth() &&
      y.getFullYear() === c.getFullYear();

    if (isYesterday) return "IERI";

    return c.toLocaleDateString();
  };

  const renderItem = ({ item, index }) => {
    const isMine = item.user === user;

    const prev = messages[index - 1];
    const label = getDayLabel(item, prev);

    const anim = anims[item.id];

    return (
      <>
        {label && (
          <View style={styles.separator}>
            <Text style={styles.separatorText}>{label}</Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.row,
            isMine ? styles.right : styles.left,
            anim && {
              opacity: anim.opacity,
              transform: [{ translateY: anim.translateY }]
            }
          ]}
        >
          <View
            style={[
              styles.bubble,
              isMine ? styles.me : styles.other
            ]}
          >
            <Text style={styles.text}>{item.text}</Text>

            <Text style={styles.time}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </Animated.View>
      </>
    );
  };

  return (
    <View style={styles.container}>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
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

  row: {
    marginVertical: 4
  },

  left: { alignItems: "flex-start" },
  right: { alignItems: "flex-end" },

  bubble: {
    maxWidth: "78%",
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)"
  },

  me: {
    backgroundColor: "rgba(77,208,255,0.12)"
  },

  other: {
    backgroundColor: "rgba(255,255,255,0.05)"
  },

  text: {
    color: "#fff",
    fontSize: 15
  },

  time: {
    fontSize: 10,
    color: "#777",
    marginTop: 4,
    textAlign: "right"
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

  separator: {
    alignItems: "center",
    marginVertical: 10
  },

  separatorText: {
    color: "#888",
    fontSize: 12,
    backgroundColor: "#0b0f1a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  }
};