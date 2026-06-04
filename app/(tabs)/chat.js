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

import * as Haptics from "expo-haptics";

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

  const anim = useRef({}).current;
  const trans = useRef({}).current;

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
          anim[m.id] = new Animated.Value(1);
        }

        if (!trans[m.id]) {
          trans[m.id] = new Animated.Value(0);
        }
      });

      setMessages(data);

      setTimeout(() => {
        flatRef.current?.scrollToEnd({ animated: true });
      }, 120);

    });

    return unsub;

  }, []);

  // 📩 SEND
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

  // 🗑 DELETE CON ANIMAZIONE + VIBRAZIONE
  const deleteMessage = (id, owner) => {

    if (owner !== user) return;

    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );

    Animated.parallel([
      Animated.timing(anim[id], {
        toValue: 0,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.timing(trans[id], {
        toValue: -90,
        duration: 180,
        useNativeDriver: true
      })
    ]).start(() => {
      deleteDoc(doc(db, "messages", id));
    });
  };

  const formatTime = (t) => {
    if (!t?.toDate) return "";
    const d = t.toDate();
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  // 🎯 SWIPE GESTURE
  const createPan = (item) => {

    const panResponder = PanResponder.create({

      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10,

      onPanResponderMove: (_, g) => {
        trans[item.id].setValue(g.dx);
      },

      onPanResponderRelease: (_, g) => {

        // 👉 reply
        if (g.dx > 70) {
          setReplyTo(item);
        }

        // 👈 delete
        if (g.dx < -80) {
          deleteMessage(item.id, item.user);
        }

        Animated.spring(trans[item.id], {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }

    });

    return panResponder;
  };

  const renderItem = ({ item }) => {

    const isMine = item.user === user;

    const opacity = anim[item.id] || new Animated.Value(1);
    const translateX = trans[item.id] || new Animated.Value(0);

    const pan = createPan(item);

    return (

      <View style={[
        styles.row,
        isMine ? styles.right : styles.left
      ]}>

        <Animated.View
          {...pan.panHandlers}
          style={[
            styles.bubble,
            isMine ? styles.me : styles.other,
            {
              opacity,
              transform: [{ translateX }]
            }
          ]}
        >

          <Text style={styles.user}>
            {item.user}
          </Text>

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

        </Animated.View>

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
    marginVertical: 6
  },

  left: {
    alignItems: "flex-start"
  },

  right: {
    alignItems: "flex-end"
  },

  bubble: {
    maxWidth: "78%",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)"
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