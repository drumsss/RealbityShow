import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { db } from "../../firebase";

const { width } = Dimensions.get("window");

export default function Leaderboard() {

  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {

    if (!db) {
      console.log("❌ DB NON INIZIALIZZATO");
      return;
    }

    const ref = collection(db, "players");

    console.log("🔥 LISTENER START players");

    const unsub = onSnapshot(
      ref,
      (snap) => {

        console.log("🔥 SNAP OK SIZE:", snap.size);
        setStatus("ok");

        const list = [];

        snap.forEach((d) => {
          const v = d.data();

          list.push({
            id: d.id,
            name: (v?.name ?? d.id ?? "").toLowerCase().trim(),
            points: Number(v?.points ?? 0)
          });
        });

        // 🔥 merge duplicati (safe)
        const map = new Map();

        for (const p of list) {
          const key = p.name;

          if (!map.has(key)) {
            map.set(key, { ...p });
          } else {
            const old = map.get(key);

            map.set(key, {
              id: old.id,
              name: old.name,
              points: old.points + p.points
            });
          }
        }

        const cleaned = Array.from(map.values());

        cleaned.sort((a, b) => b.points - a.points);

        setPlayers(cleaned);
      },
      (err) => {
        console.log("❌ FIRESTORE ERROR:", err);
        setStatus("error");
      }
    );

    return unsub;

  }, []);

  const getNameColor = (name) => {

    const n = (name || "").toLowerCase();

    const blueTeam = ["drums", "chiara", "taddei", "licari"];
    const purpleTeam = ["ludo", "mimmo", "eli", "draane"];

    if (blueTeam.includes(n)) return "#00d4ff";
    if (purpleTeam.includes(n)) return "#c77dff";

    return "#fff";
  };

  const getGlowColor = (i) => {
    if (i === 0) return "#ffd700";
    if (i === 1) return "#c0c0c0";
    if (i === 2) return "#cd7f32";
    return "#00d4ff";
  };

  return (
    <LinearGradient
      colors={["#050505", "#090909", "#160022"]}
      style={styles.container}
    >

      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Text style={styles.title}>CLASSIFICA</Text>

      <Text style={styles.subtitle}>
        STATUS: {status}
      </Text>

      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{
          paddingBottom: 40,
          alignItems: "center"
        }}
        showsVerticalScrollIndicator={false}
      >

        {status === "loading" && (
          <Text style={{ color: "#777", marginTop: 30 }}>
            CARICAMENTO...
          </Text>
        )}

        {status === "ok" && players.length === 0 && (
          <Text style={{ color: "#777", marginTop: 30 }}>
            NESSUN GIOCATORE
          </Text>
        )}

        {players.map((p, i) => (

          <View
            key={p.id}
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
                <Text style={styles.rank}>#{i + 1}</Text>
              </View>

              <View>
                <Text style={[
                  styles.name,
                  { color: getNameColor(p.name) }
                ]}>
                  {p.name}
                </Text>

                <Text style={styles.playerLabel}>PLAYER</Text>
              </View>

            </View>

            <View style={styles.pointsBox}>
              <Text style={styles.points}>{p.points}</Text>
              <Text style={styles.pointsLabel}>PTS</Text>
            </View>

          </View>

        ))}

      </ScrollView>

    </LinearGradient>
  );
}

const styles = {

  container: {
    flex: 1,
    paddingTop: 70,
    alignItems: "center"
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

  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900"
  },

  subtitle: {
    color: "#888",
    fontSize: 12,
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
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
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
    fontWeight: "900"
  },

  playerLabel: {
    color: "#777",
    fontSize: 11,
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
    fontSize: 11
  }
};