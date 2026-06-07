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
      setStatus("error");
      return;
    }

    const ref = collection(db, "players");

    const unsub = onSnapshot(
      ref,
      (snap) => {

        const raw = snap.docs.map(d => {
          const v = d.data();

          return {
            id: d.id,
            name: (v?.name || d.id || "").toLowerCase().trim(),
            points: Number(v?.points || 0)
          };
        });

        // merge duplicati per nome
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

        const cleaned = Array.from(map.values())
          .sort((a, b) => b.points - a.points);

        setPlayers(cleaned);
        setStatus("ok");
      },
      (err) => {
        console.log("FIRESTORE ERROR:", err);
        setStatus("error");
      }
    );

    return unsub;

  }, []);

  return (
    <LinearGradient
      colors={["#050505", "#090909", "#160022"]}
      style={styles.container}
    >

      <Text style={styles.title}>CLASSIFICA</Text>

      <Text style={styles.subtitle}>
        REALBITY SHOW
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

        {status === "error" && (
          <Text style={{ color: "red", marginTop: 30 }}>
            ERRORE FIRESTORE
          </Text>
        )}

        {players.map((p, i) => (
          <View key={p.id} style={styles.card}>

            <View style={styles.left}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <Text style={styles.name}>{p.name}</Text>
            </View>

            <Text style={styles.points}>{p.points}</Text>

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
    alignItems: "center",
    backgroundColor: "#000"
  },

  title: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "900"
  },

  subtitle: {
    color: "#888",
    fontSize: 12,
    marginBottom: 20
  },

  card: {
    width: width * 0.92,
    padding: 18,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  rank: {
    color: "#fff",
    fontWeight: "900",
    marginRight: 10
  },

  name: {
    color: "#fff",
    fontWeight: "700"
  },

  points: {
    color: "#00d4ff",
    fontWeight: "900",
    fontSize: 18
  }
};