import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const { width } = Dimensions.get("window");

export default function Home() {

  const [beauties, setBeauties] = useState(0);
  const [licata, setLicata] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const [active, setActive] = useState(false);

  const anim1 = useState(new Animated.Value(1))[0];
  const anim2 = useState(new Animated.Value(1))[0];

  const animate = (a) => {

    Animated.sequence([
      Animated.timing(a, {
        toValue: 1.08,
        duration: 120,
        useNativeDriver: true
      }),

      Animated.timing(a, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true
      })

    ]).start();
  };

  useEffect(() => {

    const unsub1 = onSnapshot(
      doc(db, "teams", "beauties"),
      (snap) => {

        setBeauties(snap.data()?.totalPoints || 0);
        animate(anim1);

      }
    );

    const unsub2 = onSnapshot(
      doc(db, "teams", "licatadrums"),
      (snap) => {

        setLicata(snap.data()?.totalPoints || 0);
        animate(anim2);

      }
    );

    const unsub3 = onSnapshot(
      doc(db, "challenge", "current"),
      (snap) => {

        const d = snap.data();

        if (!d) return;

        setActive(d.active);

        const updateTimer = () => {

          const diff = d.endTime - Date.now();

          setTimeLeft(diff > 0 ? diff : 0);

        };

        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);

      }
    );

    return () => {

      unsub1();
      unsub2();
      unsub3();

    };

  }, []);

  const format = (ms) => {

    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;

    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (

    <LinearGradient
      colors={["#050505", "#0f0f0f", "#1a001f"]}
      style={styles.container}
    >

      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Text style={styles.title}>
        REALBITY SHOW
      </Text>

      <Text style={styles.subtitle}>
        LIVE SCOREBOARD
      </Text>

      {/* TIMER */}
      <LinearGradient
        colors={["#1a1a1a", "#111"]}
        style={styles.timerBox}
      >

        <Text style={styles.timerLabel}>
          CHALLENGE TIMER
        </Text>

        <Text style={styles.timer}>
          {active ? format(timeLeft) : "STOP"}
        </Text>

      </LinearGradient>

      {/* CLASSIFICA */}
      <View style={styles.board}>

        {/* BEAUTIES */}
        <Animated.View
          style={[
            styles.teamCard,
            styles.blueBorder,
            { transform: [{ scale: anim1 }] }
          ]}
        >

          <View>
            <Text style={styles.teamLabel}>
              TEAM
            </Text>

            <Text style={styles.beautiesTeam}>
              BEAUTIES
            </Text>
          </View>

          <Text style={styles.beautiesPoints}>
            {beauties}
          </Text>

        </Animated.View>

        {/* LICATADRUMS */}
        <Animated.View
          style={[
            styles.teamCard,
            styles.purpleBorder,
            { transform: [{ scale: anim2 }] }
          ]}
        >

          <View>
            <Text style={styles.teamLabel}>
              TEAM
            </Text>

            <Text style={styles.licataTeam}>
              LICATADRUMS
            </Text>
          </View>

          <Text style={styles.licataPoints}>
            {licata}
          </Text>

        </Animated.View>

      </View>

      {/* ADMIN */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.adminBtn}
        onPress={() => router.push("/admin")}
      >

        <LinearGradient
          colors={["#ffd700", "#ffb700"]}
          style={styles.adminGradient}
        >

          <Text style={styles.adminTxt}>
            ADMIN PANEL
          </Text>

        </LinearGradient>

      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = {

  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 70,
    overflow: "hidden"
  },

  glow1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: "#6a00ff",
    opacity: 0.18,
    top: -50,
    right: -80
  },

  glow2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#00bfff",
    opacity: 0.15,
    bottom: 100,
    left: -70
  },

  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 2
  },

  subtitle: {
    color: "#888",
    marginTop: 5,
    fontSize: 13,
    letterSpacing: 3
  },

  timerBox: {
    marginTop: 30,
    paddingVertical: 22,
    borderRadius: 24,
    width: width * 0.88,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#ffd700",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },

  timerLabel: {
    color: "#ffd700",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2
  },

  timer: {
    color: "#fff",
    fontSize: 54,
    fontWeight: "900",
    marginTop: 5
  },

  board: {
    width: width * 0.88,
    marginTop: 30
  },

  teamCard: {
    backgroundColor: "rgba(20,20,20,0.95)",
    padding: 22,
    borderRadius: 24,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2
  },

  blueBorder: {
    borderColor: "#00bfff"
  },

  purpleBorder: {
    borderColor: "#a020f0"
  },

  teamLabel: {
    color: "#666",
    fontSize: 11,
    marginBottom: 4,
    letterSpacing: 2
  },

  beautiesTeam: {
    color: "#00bfff",
    fontSize: 24,
    fontWeight: "900"
  },

  beautiesPoints: {
    color: "#00bfff",
    fontSize: 38,
    fontWeight: "900"
  },

  licataTeam: {
    color: "#c05cff",
    fontSize: 24,
    fontWeight: "900"
  },

  licataPoints: {
    color: "#c05cff",
    fontSize: 38,
    fontWeight: "900"
  },

  adminBtn: {
    width: width * 0.88,
    marginTop: 20
  },

  adminGradient: {
    paddingVertical: 16,
    borderRadius: 20
  },

  adminTxt: {
    color: "#000",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1
  }

};