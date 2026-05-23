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
      return "#00d4ff";
    }

    if (purpleTeam.includes(upper)) {
      return "#c77dff";
    }

    return "#ffffff";
  };

  // GRADIENT CLASSIFICA
  const getCardGradient = (index) => {

    if (index === 0) return ["#ffd700", "#ffb300"];
    if (index === 1) return ["#c0c0c0", "#7a7a7a"];
    if (index === 2) return ["#cd7f32", "#8a4a12"];

    return ["#1a1a1a", "#0b0b0b"];
  };

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

      <Text style={styles.title}>
        CLASSIFICA
      </Text>

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

        {players.map((p, i) => (

          <LinearGradient
            key={p.id}
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