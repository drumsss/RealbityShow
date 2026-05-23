import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { router } from "expo-router";
import { db } from "../firebase";
import { getUser } from "./session";

import {
  doc,
  getDoc,
  increment,
  setDoc,
  updateDoc
} from "firebase/firestore";

export default function Admin() {

  const [playerName, setPlayerName] = useState("");
  const [points, setPoints] = useState("");

  const [day, setDay] = useState("");
  const [challenge, setChallenge] = useState("");

  const [minutes, setMinutes] = useState("");

  const challengeRef = doc(db, "challenge", "current");

  useEffect(() => {
    const check = async () => {
      const u = await getUser();
      if (u !== "drums") {
        router.replace("/(tabs)");
      }
    };

    check();
  }, []);

  const playerRef = (name) =>
    doc(db, "players", name.toLowerCase().trim());

  // ➕ AGGIUNGI PUNTI
  const addPoints = async () => {

    if (!playerName || !points) return;

    const pts = parseInt(points);
    if (isNaN(pts)) return;

    const ref = playerRef(playerName);

    const snap = await getDoc(ref);

    // crea player se non esiste
    if (!snap.exists()) {
      await setDoc(ref, {
        name: playerName.toLowerCase().trim(),
        team: "licatadrums",
        points: 0
      });
    }

    const data = (await getDoc(ref)).data();

    await updateDoc(ref, {
      points: increment(pts)
    });

    await updateDoc(doc(db, "teams", data.team), {
      totalPoints: increment(pts)
    });

    setPlayerName("");
    setPoints("");
  };

  // ➖ RIMUOVI PUNTI
  const removePoints = async () => {

    if (!playerName || !points) return;

    const pts = parseInt(points);
    if (isNaN(pts)) return;

    const ref = playerRef(playerName);

    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();

    await updateDoc(ref, {
      points: increment(-pts)
    });

    await updateDoc(doc(db, "teams", data.team), {
      totalPoints: increment(-pts)
    });

    setPlayerName("");
    setPoints("");
  };

  // 📅 SFIDE
  const updateChallenge = async () => {
    if (!day || !challenge) return;

    await setDoc(doc(db, "calendar", day.toLowerCase().trim()), {
      title: challenge
    });

    setDay("");
    setChallenge("");
  };

  // ⏱ TIMER
  const startTimer = async () => {
    const min = parseInt(minutes);
    if (!min) return;

    const end = Date.now() + min * 60 * 1000;

    await setDoc(challengeRef, {
      active: true,
      endTime: end,
      duration: min
    });
  };

  const stopTimer = async () => {
    await updateDoc(challengeRef, {
      active: false
    });
  };

  const resetTimer = async () => {
    await setDoc(challengeRef, {
      active: false,
      endTime: 0,
      duration: 0
    });
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>CONTROL ROOM</Text>

      <ScrollView>

        {/* PUNTI */}
        <View style={styles.card}>
          <Text style={styles.section}>PUNTI PLAYER</Text>

          <TextInput
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="giocatore"
            placeholderTextColor="#666"
            style={styles.input}
          />

          <TextInput
            value={points}
            onChangeText={setPoints}
            placeholder="punti"
            placeholderTextColor="#666"
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={addPoints} style={styles.greenBtn}>
              <Text style={styles.darkBtnText}>+ ADD</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={removePoints} style={styles.redBtn}>
              <Text style={styles.btnText}>- REMOVE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* resto invariato */}
      </ScrollView>
    </View>
  );
}