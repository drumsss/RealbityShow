import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

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
      return "#a020f0";
    }

    return "#fff";
  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        CLASSIFICA
      </Text>

      <ScrollView style={{ width: "100%" }}>

        {players.map((p, i) => (

          <View key={p.id} style={styles.card}>

            <Text style={styles.rank}>
              #{i + 1}
            </Text>

            <Text
              style={[
                styles.name,
                { color: getNameColor(p.name) }
              ]}
            >
              {p.name}
            </Text>

            <Text style={styles.points}>
              {p.points || 0}
            </Text>

          </View>

        ))}

      </ScrollView>

    </View>
  );
}

const styles = {

  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
    padding: 15
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center"
  },

  rank: {
    color: "#ff0033",
    fontSize: 18,
    fontWeight: "bold"
  },

  name: {
    fontSize: 16,
    fontWeight: "bold"
  },

  points: {
    color: "#ff0033",
    fontSize: 18,
    fontWeight: "bold"
  }

};