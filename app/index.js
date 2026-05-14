import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { setUser } from "./session";

export default function Login() {

  const [name, setName] = useState("");

  const login = async () => {
    if (!name.trim()) return;

    await setUser(name.toLowerCase().trim());

    router.replace("/(tabs)");
  };

  return (

    <LinearGradient
      colors={["#050505", "#0f0f0f", "#1a001f"]}
      style={styles.container}
    >

      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Text style={styles.title}>REALBITY</Text>
      <Text style={styles.subtitle}>ENTRA NEL GIOCO</Text>

      <View style={styles.card}>

        <Text style={styles.label}>NOME</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="scrivi il tuo nome"
          placeholderTextColor="#666"
          style={styles.input}
        />

        <TouchableOpacity onPress={login} style={styles.btn}>
          <LinearGradient
            colors={["#ff0033", "#ff4d6d"]}
            style={styles.btnInner}
          >
            <Text style={styles.btnText}>ENTRA</Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>

    </LinearGradient>
  );
}

const styles = {

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  glow1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#ff0033",
    opacity: 0.15,
    top: -60,
    right: -60
  },

  glow2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: "#a020f0",
    opacity: 0.12,
    bottom: 80,
    left: -60
  },

  title: {
    color: "#fff",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 3
  },

  subtitle: {
    color: "#888",
    marginTop: 6,
    marginBottom: 30,
    letterSpacing: 2,
    fontSize: 12
  },

  card: {
    width: "88%",
    backgroundColor: "rgba(20,20,20,0.9)",
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#222"
  },

  label: {
    color: "#aaa",
    marginBottom: 8,
    letterSpacing: 1
  },

  input: {
    backgroundColor: "#000",
    color: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#222"
  },

  btn: {
    borderRadius: 14,
    overflow: "hidden"
  },

  btnInner: {
    padding: 14,
    borderRadius: 14
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    letterSpacing: 1
  }
};