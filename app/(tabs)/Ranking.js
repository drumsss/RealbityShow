import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  Text,
  View
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const { width } = Dimensions.get("window");

export default function Leaderboard() {

  const [players, setPlayers] = useState([]);

  // 🎬 LOGO ANIM
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslate = useRef(new Animated.Value(-20)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;

  const glitchX = useRef(new Animated.Value(0)).current;
  const glitchOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "players"),
      (snap) => {

        const raw = snap.docs.map(d => {
          const v = d.data();

          return {
            id: d.id,
            name: (v.name || d.id || "").toLowerCase().trim(),
            points: Number(v.points || 0)
          };
        });

        const map = new Map();

        raw.forEach(p => {

          const key = p.name;

          if (!map.has(key)) {
            map.set(key, { ...p });
          } else {
            const old = map.get(key);

            map.set(key, {
              ...old,
              points: old.points + p.points
            });
          }
        });

        const cleaned = Array.from(map.values());
        cleaned.sort((a, b) => b.points - a.points);

        setPlayers(cleaned);
      }
    );

    // 🎬 INTRO LOGO
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

    // 📺 GLITCH LOOP
    const interval = setInterval(() => {

      if (Math.random() > 0.7) {

        const rx = (Math.random() - 0.5) * 5;

        Animated.sequence([
          Animated.timing(glitchX, {
            toValue: rx,
            duration: 60,
            useNativeDriver: true
          }),
          Animated.timing(glitchX, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true
          })
        ]).start();

      }

    }, 2500);

    return () => {
      unsub();
      clearInterval(interval);
    };

  }, []);

  const getNameColor = (name) => {

    const n = (name || "").toLowerCase();

    const blueTeam = ["drums", "chiara", "taddei", "licari"];
    const purpleTeam = ["ludo", "mimmo", "eli", "draane"];

    if (blueTeam.includes(n)) return "#00d4ff";
    if (purpleTeam.includes(n)) return "#c77dff";

    return "#ffffff";
  };

  const getCardGradient = () => ["#1a1a1a", "#0b0b0b"];

  const getGlowColor = (index) => {
    if (index === 0) return "#ffd700";
    if (index === 1) return "#c0c0c0";
    if (index === 2) return "#cd7f32";
    return "#00d4ff";
  };

  return (

    <LinearGradient
      colors={["#050505", "#090909", "#160022"]}
      style={styles.container}
    >

      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* 🎬 LOGO */}
      <Animated.View
        style={[
          styles.logoWrap,
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

      <Text style={styles.title}>CLASSIFICA</Text>
      <Text style={styles.subtitle}>REALBITY SHOW</Text>

      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{
          paddingBottom: 40,
          alignItems: "center"
        }}
        showsVerticalScrollIndicator={false}
      >

        {players.map((p, i) => (

          <LinearGradient
            key={p.name}
            colors={getCardGradient(i)}
            style={[
              styles.card,
              { borderColor: getGlowColor(i) }
            ]}
          >

            <View style={styles.left}>

              <View style={[
                styles.rankCircle,
                { borderColor: getGlowColor(i) }
              ]}>

                <Text style={styles.rank}>
                  #{i + 1}
                </Text>

              </View>

              <View>

                <Text
                  style={[
                    styles.name,
                    { color: getNameColor(p.name) }
                  ]}
                >
                  {p.name}
                </Text>

                <Text style={styles.playerLabel}>
                  PLAYER
                </Text>

              </View>

            </View>

            <View style={styles.pointsBox}>

              <Text style={styles.points}>
                {p.points}
              </Text>

              <Text style={styles.pointsLabel}>
                PTS
              </Text>

            </View>

          </LinearGradient>

        ))}

      </ScrollView>

    </LinearGradient>
  );
}

const styles = {

  container: {
    flex: 1,
    paddingTop: 70,
    alignItems: "center",
    overflow: "hidden"
  },

  glow1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: "#a020f0",
    opacity: 0.18,
    top: -90,
    right: -100
  },

  glow2: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "#00d4ff",
    opacity: 0.12,
    bottom: 20,
    left: -90
  },

  logoWrap: {
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#00d4ff",
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12
  },

  logo: {
    width: 70,
    height: 70
  },

  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 2
  },

  subtitle: {
    color: "#888",
    fontSize: 12,
    letterSpacing: 4,
    marginTop: 6,
    marginBottom: 30
  },

  card: {
    width: width * 0.92,
    minHeight: 100,
    borderRadius: 28,
    marginBottom: 14,
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 12
  },

  left: {
    flexDirection: "row",
    alignItems: "center"
  },

  rankCircle: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1
  },

  rank: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900"
  },

  name: {
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 1
  },

  playerLabel: {
    color: "#777",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 4
  },

  pointsBox: {
    alignItems: "center"
  },

  points: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900"
  },

  pointsLabel: {
    color: "#999",
    fontSize: 11,
    letterSpacing: 2
  }

};