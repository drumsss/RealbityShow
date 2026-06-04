import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../firebase";

const { width } = Dimensions.get("window");

export default function Home() {
  const [beauties, setBeauties] = useState(0);
  const [licata, setLicata] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const [active, setActive] = useState(false);

  const anim1 = useState(new Animated.Value(1))[0];
  const anim2 = useState(new Animated.Value(1))[0];

  // 🎬 LOGO ANIMATION
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(-30)).current;

  const glowPulse = useRef(new Animated.Value(0)).current;

  const animate = (a) => {
    Animated.sequence([
      Animated.timing(a, {
        toValue: 1.07,
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

    const unsub1 = onSnapshot(doc(db, "teams", "beauties"), (snap) => {
      setBeauties(snap.data()?.totalPoints || 0);
      animate(anim1);
    });

    const unsub2 = onSnapshot(doc(db, "teams", "licatadrums"), (snap) => {
      setLicata(snap.data()?.totalPoints || 0);
      animate(anim2);
    });

    const unsub3 = onSnapshot(doc(db, "challenge", "current"), (snap) => {
      const d = snap.data();
      if (!d) return;

      setActive(!!d.active);

      const updateTimer = () => {
        const diff = (d.endTime || 0) - Date.now();
        setTimeLeft(diff > 0 ? diff : 0);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    });

    // 🚀 INTRO LOGO PIÙ DINAMICO
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true
        })
      ]),
      Animated.spring(logoScale, {
        toValue: 1.35,
        friction: 3,
        tension: 90,
        useNativeDriver: true
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true
      })
    ]).start();

    // 🌊 glow continuo
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false
        })
      ])
    ).start();

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

      {/* 🔥 LOGO PIÙ GRANDE + DINAMICO */}
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoOpacity,
            transform: [
              { translateY: logoY },
              { scale: logoScale }
            ]
          }
        ]}
      >
        <Image
          source={require("../../assets/logo_colori.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.subtitle}>LIVE SCOREBOARD</Text>

      {/* TIMER */}
      <LinearGradient colors={["#1a1a1a", "#111"]} style={styles.timerBox}>
        <Text style={styles.timerLabel}>CHALLENGE TIMER</Text>
        <Text style={styles.timer}>
          {active ? format(timeLeft) : "STOP"}
        </Text>
      </LinearGradient>

      {/* BOARD */}
      <View style={styles.board}>
        <Animated.View style={[styles.teamCard, styles.blueBorder, { transform: [{ scale: anim1 }] }]}>
          <View>
            <Text style={styles.teamLabel}>TEAM</Text>
            <Text style={styles.beautiesTeam}>BEAUTIES</Text>
          </View>
          <Text style={styles.beautiesPoints}>{beauties}</Text>
        </Animated.View>

        <Animated.View style={[styles.teamCard, styles.purpleBorder, { transform: [{ scale: anim2 }] }]}>
          <View>
            <Text style={styles.teamLabel}>TEAM</Text>
            <Text style={styles.licataTeam}>LICATADRUMS</Text>
          </View>
          <Text style={styles.licataPoints}>{licata}</Text>
        </Animated.View>
      </View>

      {/* ADMIN */}
      <TouchableOpacity
        style={styles.adminBtn}
        onPress={() => router.push("/admin")}
      >
        <LinearGradient
          colors={["#ffd700", "#ffb700"]}
          style={styles.adminGradient}
        >
          <Text style={styles.adminTxt}>ADMIN PANEL</Text>
        </LinearGradient>
      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 65,
    overflow: "hidden"
  },

  glow1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "#6a00ff",
    opacity: 0.18,
    top: -60,
    right: -90
  },

  glow2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "#00bfff",
    opacity: 0.15,
    bottom: 90,
    left: -80
  },

  logoWrap: {
    marginBottom: 10
  },

  logo: {
    width: 240,
    height: 240
  },

  subtitle: {
    color: "#888",
    marginTop: 4,
    fontSize: 13
  },

  timerBox: {
    marginTop: 24,
    paddingVertical: 20,
    borderRadius: 24,
    width: width * 0.88,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333"
  },

  timerLabel: { color: "#ffd700", fontSize: 12 },

  timer: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "900"
  },

  board: {
    width: width * 0.88,
    marginTop: 24
  },

  teamCard: {
    backgroundColor: "rgba(20,20,20,0.95)",
    padding: 20,
    borderRadius: 24,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2
  },

  blueBorder: { borderColor: "#00bfff" },
  purpleBorder: { borderColor: "#a020f0" },

  teamLabel: { color: "#666", fontSize: 12 },

  beautiesTeam: { color: "#00bfff", fontSize: 22, fontWeight: "900" },
  licataTeam: { color: "#c05cff", fontSize: 22, fontWeight: "900" },

  beautiesPoints: { color: "#00bfff", fontSize: 34, fontWeight: "900" },
  licataPoints: { color: "#c05cff", fontSize: 34, fontWeight: "900" },

  adminBtn: {
    width: width * 0.88,
    marginTop: 18
  },

  adminGradient: {
    paddingVertical: 15,
    borderRadius: 20
  },

  adminTxt: {
    color: "#000",
    textAlign: "center",
    fontWeight: "900"
  }
};