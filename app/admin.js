import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
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

  // 🔥 animazioni ingresso
  const fade = useState(new Animated.Value(0))[0];
  const scale = useState(new Animated.Value(1.1))[0];
  const translateY = useState(new Animated.Value(20))[0];
  const glitch = useState(new Animated.Value(0))[0];

  useEffect(() => {

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true
      })
    ]).start();

    // glitch leggero random
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(glitch, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true
        }),
        Animated.timing(glitch, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true
        })
      ]).start();
    }, 3000);

    const check = async () => {
      const u = await getUser();

      if (u !== "drums") {
        router.replace("/(tabs)");
      }
    };

    check();

    return () => clearInterval(interval);

  }, []);

  const getTeam = (name) => {

    const n = name.toLowerCase().trim();

    const beauties = ["eli", "mimmo", "ludo", "draane"];
    const licata = ["chiara", "licari", "taddei", "drums"];

    if (beauties.includes(n)) return "beauties";
    if (licata.includes(n)) return "licatadrums";

    return "licatadrums";
  };

  const playerRef = (name) =>
    doc(db, "players", name.toLowerCase().trim());

  const addPoints = async () => {

    if (!playerName || !points) return;

    const pts = parseInt(points);
    const name = playerName.toLowerCase().trim();

    const ref = playerRef(name);
    const snap = await getDoc(ref);

    let team = getTeam(name);

    if (!snap.exists()) {
      await setDoc(ref, { name, team, points: 0 });
    }

    await updateDoc(ref, { points: increment(pts) });
    await updateDoc(doc(db, "teams", team), { totalPoints: increment(pts) });

    setPlayerName("");
    setPoints("");
  };

  const removePoints = async () => {

    if (!playerName || !points) return;

    const pts = parseInt(points);
    const name = playerName.toLowerCase().trim();

    const ref = playerRef(name);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const team = data.team || getTeam(name);

    await updateDoc(ref, { points: increment(-pts) });
    await updateDoc(doc(db, "teams", team), { totalPoints: increment(-pts) });

    setPlayerName("");
    setPoints("");
  };

  const updateChallenge = async () => {

    if (!day || !challenge) return;

    await setDoc(doc(db, "calendar", day.toLowerCase().trim()), {
      title: challenge
    });

    setDay("");
    setChallenge("");
  };

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
    await updateDoc(challengeRef, { active: false });
  };

  const resetTimer = async () => {
    await setDoc(challengeRef, {
      active: false,
      endTime: 0,
      duration: 0
    });
  };

  const glitchStyle = {
    transform: [
      {
        translateX: glitch.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2]
        })
      },
      {
        translateY: glitch.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -1]
        })
      }
    ]
  };

  return (

    <Animated.View
      style={[
        styles.container,
        {
          opacity: fade,
          transform: [
            { scale },
            { translateY }
          ]
        }
      ]}
    >

      {/* LOGO INTRO */}
      <Animated.View style={[styles.logoWrap, glitchStyle]}>
        <Image
          source={require("../assets/logo_bw.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
      >
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

            <TouchableOpacity
              onPress={addPoints}
              style={styles.greenBtn}
            >
              <Text style={styles.darkBtnText}>+ ADD</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={removePoints}
              style={styles.redBtn}
            >
              <Text style={styles.btnText}>- REMOVE</Text>
            </TouchableOpacity>

          </View>

        </View>

        {/* CALENDARIO */}
        <View style={styles.card}>

          <Text style={styles.section}>SFIDE SETTIMANA</Text>

          <TextInput
            value={day}
            onChangeText={setDay}
            placeholder="monday"
            placeholderTextColor="#666"
            style={styles.input}
          />

          <TextInput
            value={challenge}
            onChangeText={setChallenge}
            placeholder="sfida"
            placeholderTextColor="#666"
            style={styles.input}
          />

          <TouchableOpacity
            onPress={updateChallenge}
            style={styles.yellowBtn}
          >
            <Text style={styles.darkBtnText}>SALVA SFIDA</Text>
          </TouchableOpacity>

        </View>

        {/* TIMER */}
        <View style={styles.card}>

          <Text style={styles.section}>TIMER LIVE</Text>

          <TextInput
            value={minutes}
            onChangeText={setMinutes}
            placeholder="minuti"
            placeholderTextColor="#666"
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.timerRow}>

            <TouchableOpacity onPress={startTimer} style={styles.smallGreen}>
              <Text style={styles.btnText}>START</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={stopTimer} style={styles.smallRed}>
              <Text style={styles.btnText}>STOP</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={resetTimer} style={styles.smallOrange}>
              <Text style={styles.btnText}>RESET</Text>
            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

    </Animated.View>
  );
}

const styles = {

  container: {
    flex: 1,
    backgroundColor: "#000"
  },

  logoWrap: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 5
  },

  logo: {
    width: 75,
    height: 75,
    opacity: 0.95
  },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 15,
    zIndex: 10
  },

  backText: {
    color: "#fff",
    fontSize: 24
  },

  title: {
    color: "#ffd700",
    fontSize: 28,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "#0d0d0d",
    margin: 15,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222"
  },

  section: {
    color: "#fff",
    marginBottom: 10,
    fontWeight: "bold"
  },

  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#222"
  },

  greenBtn: {
    flex: 1,
    backgroundColor: "#00cc66",
    padding: 12,
    borderRadius: 10,
    marginRight: 5
  },

  redBtn: {
    flex: 1,
    backgroundColor: "#ff0033",
    padding: 12,
    borderRadius: 10
  },

  yellowBtn: {
    backgroundColor: "#ffd700",
    padding: 12,
    borderRadius: 10,
    marginTop: 10
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  },

  darkBtnText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold"
  },

  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },

  smallGreen: {
    flex: 1,
    backgroundColor: "#00cc66",
    padding: 10,
    borderRadius: 10,
    marginRight: 5
  },

  smallRed: {
    flex: 1,
    backgroundColor: "#ff0033",
    padding: 10,
    borderRadius: 10,
    marginRight: 5
  },

  smallOrange: {
    flex: 1,
    backgroundColor: "#ff8800",
    padding: 10,
    borderRadius: 10
  }

};