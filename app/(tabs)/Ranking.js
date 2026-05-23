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

        const data = snap.docs.map(d => {
          const v = d.data();
          return {
            id: d.id,
            name: v.name || d.id,
            points: Number(v.points || 0)
          };
        });

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

        filteredData.sort((a, b) => (b.points || 0) - (a.points || 0));

        setPlayers(filteredData);
      }
    );

    return unsub;

  }, []);

  const getNameColor = (name) => {

    const blueTeam = ["DRUMS", "CHIARA", "TADDEI", "LICARI"];
    const purpleTeam = ["LUDO", "MIMMO", "ELI", "DRAANE"];

    const upper = name?.toUpperCase();

    if (blueTeam.includes(upper)) return "#00d4ff";
    if (purpleTeam.includes(upper)) return "#c77dff";

    return "#ffffff";
  };

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
            key={p.id}
            colors={getCardGradient(i)}
            style={[styles.card, { borderColor: getGlowColor(i) }]}
          >

            <View style={styles.left}>
              <View style={[styles.rankCircle, { borderColor: getGlowColor(i) }]}>
                <Text style={styles.rank}>#{i + 1}</Text>
              </View>

              <View>
                <Text style={[styles.name, { color: getNameColor(p.name) }]}>
                  {p.name}
                </Text>
                <Text style={styles.playerLabel}>PLAYER</Text>
              </View>
            </View>

            <View style={styles.pointsBox}>
              <Text style={styles.points}>{p.points || 0}</Text>
              <Text style={styles.pointsLabel}>PTS</Text>
            </View>

          </LinearGradient>

        ))}

      </ScrollView>
    </LinearGradient>
  );
}