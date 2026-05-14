import { useEffect, useState } from "react";

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

    await addDoc(collection(db, "messages"), {
      text: msg,
      user,
      createdAt: serverTimestamp()
    });

    setMsg("");

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

                <Text style={styles.text}>
                  {item.text}
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
  }

};