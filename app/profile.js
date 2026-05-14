import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Profile() {

  const { playerId } = useLocalSearchParams();

  const getColor = (name) => {

    const blue = ["drums", "chiara", "taddei", "licari"];
    const purple = ["ludo", "mimmo", "eli", "draane"];

    const n = name?.toLowerCase();

    if (blue.includes(n)) return "#00bfff";
    if (purple.includes(n)) return "#a020f0";

    return "#ffd700";
  };

  const color = getColor(playerId);

  return (

    <View style={styles.container}>

      {/* TITLE */}
      <Text style={styles.title}>
        PROFILO
      </Text>

      {/* CARD */}
      <View style={styles.card}>

        <Text style={[styles.name, { color }]}>
          {playerId}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>
          Squadra
        </Text>

        <Text style={[styles.value, { color }]}>
          {color === "#00bfff"
            ? "BEAUTIES"
            : color === "#a020f0"
              ? "LICATADRUMS"
              : "PLAYER"}
        </Text>

        <Text style={styles.label}>
          Stato
        </Text>

        <Text style={styles.value}>
          Attivo nel reality
        </Text>

      </View>

    </View>
  );
}

const styles = {

  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 70,
    paddingHorizontal: 20
  },

  title: {
    color: "#ffd700",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 2
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "#1f1f1f"
  },

  name: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center"
  },

  divider: {
    height: 1,
    backgroundColor: "#222",
    marginVertical: 15
  },

  label: {
    color: "#777",
    fontSize: 12,
    marginTop: 10,
    letterSpacing: 1
  },

  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5
  }

};