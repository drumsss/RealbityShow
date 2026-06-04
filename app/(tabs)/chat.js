import { useEffect, useRef, useState } from "react";

import {
  Animated,
  FlatList,
  Pressable,
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

  // 🎬 LOGO ANIMATION
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslate = useRef(new Animated.Value(-20)).current;

  // ✨ GLOW
  const logoGlow = useRef(new Animated.Value(0)).current;

  // 📺 GLITCH
  const glitchX = useRef(new Animated.Value(0)).current;
  const glitchY = useRef(new Animated.Value(0)).current;
  const glitchOpacity = useRef(new Animated.Value(1)).current;

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

    Animated.sequence([

      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(logoTranslate, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true
        })
      ]),

      Animated.timing(logoScale, {
        toValue: 1.15,
        duration: 350,
        useNativeDriver: true
      }),

      Animated.timing(logoScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      })

    ]).start(() => {

      Animated.loop(
        Animated.sequence([
          Animated.timing(logoGlow, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false
          }),
          Animated.timing(logoGlow, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false
          })
        ])
      ).start();

    });

    const interval = setInterval(() => {

      if (Math.random() > 0.65) {

        const rx = (Math.random() - 0.5) * 6;
        const ry = (Math.random() - 0.5) * 6;
        const flicker = Math.random() > 0.5 ? 0.6 : 1;

        Animated.sequence([

          Animated.parallel([
            Animated.timing(glitchX, {
              toValue: rx,
              duration: 60,
              useNativeDriver: true
            }),
            Animated.timing(glitchY, {
              toValue: ry,
              duration: 60,
              useNativeDriver: true
            }),
            Animated.timing(glitchOpacity, {
              toValue: flicker,
              duration: 60,
              useNativeDriver: true
            })
          ]),

          Animated.parallel([
            Animated.timing(glitchX, {
              toValue: 0,
              duration: 80,
              useNativeDriver: true
            }),
            Animated.timing(glitchY, {
              toValue: 0,
              duration: 80,
              useNativeDriver: true
            }),
            Animated.timing(glitchOpacity, {
              toValue: 1,
              duration: 80,
              useNativeDriver: true
            })
          ])

        ]).start();
      }

    }, 2500);

    return () => {
      clearInterval(interval);
      unsub();
    };

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
      setReplyTo(null);
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

  // 🗑 DELETE
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

  // 👆 CLICK TO REPLY (NUOVO)
  const onPressMessage = (item) => {
    setReplyTo(item);

    Haptics.selectionAsync();
  };

  const renderItem = ({ item }) => {

    const isMine = item.user === user;

    const opacity = anim[item.id] || new Animated.Value(1);
    const translateX = trans[item.id] || new Animated.Value(0);

    return (

      <View style={[
        styles.row,
        isMine ? styles.right : styles.left
      ]}>

        <Animated.View
          style={[
            styles.bubble,
            isMine ? styles.me : styles.other,
            {
              opacity,
              transform: [{ translateX }]
            }
          ]}
        >

          {/* 👆 TAP PER RISPONDERE */}
          <Pressable onPress={() => onPressMessage(item)}>

            <Text style={styles.user}>{item.user}</Text>

            {item.replyTo && (
              <Text style={styles.replyText}>
                ↩ {item.replyTo.text}
              </Text>
            )}

            <Text style={styles.text}>{item.text}</Text>

            <Text style={styles.time}>
              {formatTime(item.createdAt)}
            </Text>

          </Pressable>

        </Animated.View>

      </View>

    );
  };

  return (

    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [
                { translateY: logoTranslate },
                { scale: logoScale },
                { translateX: glitchX }
              ],
              shadowOpacity: logoGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.9]
              })
            }
          ]}
        >

          <Animated.Image
            source={require("../../assets/logo_bw.png")}
            style={[
              styles.logo,
              { opacity: glitchOpacity }
            ]}
            resizeMode="contain"
          />

        </Animated.View>

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

  container: { flex: 1, backgroundColor: "#05060a" },

  header: {
    paddingTop: 50,
    paddingBottom: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)"
  },

  logoWrapper: {
    marginBottom: 6,
    shadowColor: "#4dd0ff",
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12
  },

  logo: {
    width: 75,
    height: 75
  },

  title: {
    color: "#4dd0ff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 2
  },

  row: { marginVertical: 6 },

  left: { alignItems: "flex-start" },
  right: { alignItems: "flex-end" },

  bubble: {
    maxWidth: "78%",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)"
  },

  me: { backgroundColor: "rgba(77,208,255,0.12)" },
  other: { backgroundColor: "rgba(255,255,255,0.05)" },

  user: { color: "#4dd0ff", fontSize: 12, marginBottom: 4 },

  text: { color: "#fff", fontSize: 15 },

  time: { fontSize: 10, color: "#777", marginTop: 6, textAlign: "right" },

  replyText: { color: "#aaa", fontSize: 11, marginBottom: 4 },

  replyPreview: { padding: 10 },

  replyPreviewText: { color: "#4dd0ff" },

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