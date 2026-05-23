import { useEffect, useState } from "react";
import {
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

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "players"),
      (snap) => {

        const data = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        // RIMUOVE DUPLICATI DI TADDEI
        const filteredData = [];
        let taddeiFound = false;

        data.forEach(player => {

          if (player.name?.toUpperCase() === "TADDEI") {

            if (!taddeiFound) {
              filteredData.push(player);
              taddeiFound = true;
            }

          } else {
            filteredData.push(player);
          }

        });

        // ORDINA PER PUNTI
        filteredData.sort((a, b) => (b.points || 0) - (a.points || 0));

        setPlayers(filteredData);
      }
    );

    return unsub;

  }, []);

  // COLORI NOMI
  const getNameColor = (name) => {

    const blueTeam = ["DRUMS", "CHIARA", "TADDEI", "LICARI"];
    const purpleTeam = ["LUDO", "MIMMO", "ELI", "DRAANE"];

    const upper = name?.toUpperCase();

    if (blueTeam.includes(upper)) {
      return "#00bfff";
    }

    if (purpleTeam.includes(upper)) {
      return "#c05cff";
    }

    return "#fff";
  };

  // SFONDO CARD
  const getCardGradient = (index) => {

    if (index === 0) {
      return ["#ffd700", "#ffb700"];
    }

    if (index === 1) {
      return ["#8a8a8a", "#5f5f5f"];
    }

    if (index === 2) {
      return ["#cd7f32", "#8f4e14"];
    }

    return ["#161616", "#0d0d0d"];
  };

  return (

    <LinearGradient
      colors={["#050505", "#0b0b0b", "#17001f"]}
      style={styles.container}
    >

      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Text style={styles.title}>
        CLASSIFICA
      </Text>

      <Text style={styles.subtitle}>
        REALBITY SHOW
      </Text>

      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{
          paddingBottom: 30
        }}
        showsVerticalScrollIndicator={false}
      >

        {players.map((p, i) => (

          <LinearGradient
            key={p.id}
            colors={getCardGradient(i)}
            style={styles.card}
          >

            <View style={styles.left}>

              <View style={styles.rankCircle}>

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
                {p.points || 0}
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
    paddingTop: 65,
    alignItems: "center",
    overflow: "hidden"
  },

  glow1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "#a020f0",
    opacity: 0.15,
    top: -70,
    right: -90
  },

  glow2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "#00bfff",
    opacity: 0.12,
    bottom: 40,
    left: -80
  },

  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 2
  },

  subtitle: {
    color: "#888",
    fontSize: 12,
    letterSpacing: 4,
    marginTop: 5,
    marginBottom: 28
  },

  card: {
    width: width * 0.9,
    minHeight: 95,
    borderRadius: 26,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10
  },

  left: {
    flexDirection: "row",
    alignItems: "center"
  },

  rankCircle: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },

  rank: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900"
  },

  name: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1
  },

  playerLabel: {
    color: "#777",
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 2
  },

  pointsBox: {
    alignItems: "center"
  },

  points: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900"
  },

  pointsLabel: {
    color: "#999",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: -2
  }

};