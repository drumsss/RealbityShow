import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { setUser } from "./session";

export default function Login() {

  const [name, setName] = useState("");

  // 🎬 LOGO ANIMATION
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.25)).current;
  const logoTranslate = useRef(new Animated.Value(-120)).current;

  // ✨ GLOW
  const logoGlow = useRef(new Animated.Value(0)).current;

  // 📺 GLITCH
  const glitchX = useRef(new Animated.Value(0)).current;
  const glitchOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {

    Animated.parallel([

      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 90,
        useNativeDriver: true
      }),

      Animated.timing(logoTranslate, {
        toValue: 0,
        duration: 1100,
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

    const interval = setInterval(() => {

      if (Math.random() > 0.65) {

        Animated.sequence([

          Animated.parallel([
            Animated.timing(glitchX, {
              toValue: 5,
              duration: 45,
              useNativeDriver: true
            }),
            Animated.timing(glitchOpacity, {
              toValue: 0.6,
              duration: 45,
              useNativeDriver: true
            })
          ]),

          Animated.parallel([
            Animated.timing(glitchX, {
              toValue: 0,
              duration: 60,
              useNativeDriver: true
            }),
            Animated.timing(glitchOpacity, {
              toValue: 1,
              duration: 60,
              useNativeDriver: true
            })
          ])

        ]).start();

      }

    }, 2500);

    return () => clearInterval(interval);

  }, []);

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

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { translateY: logoTranslate },
              { scale: logoScale },
              { translateX: glitchX }
            ],
            shadowOpacity: logoGlow.interpolate({
              inputRange: [0, 1],
              outputRange: [0.25, 1]
            })
          }
        ]}
      >

        <Animated.Image
          source={require("../assets/logo_colori.png")}
          resizeMode="contain"
          style={[
            styles.logo,
            {
              opacity: glitchOpacity
            }
          ]}
        />

      </Animated.View>

      <Text style={styles.subtitle}>
        ENTRA NEL GIOCO
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>
          NOME
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="scrivi il tuo nome"
          placeholderTextColor="#666"
          style={styles.input}
        />

        <TouchableOpacity
          onPress={login}
          style={styles.btn}
        >

          <LinearGradient
            colors={["#ff0033", "#ff4d6d"]}
            style={styles.btnInner}
          >

            <Text style={styles.btnText}>
              ENTRA
            </Text>

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
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "#ff0033",
    opacity: 0.18,
    top: -100,
    right: -100
  },

  glow2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: "#8a2be2",
    opacity: 0.16,
    bottom: -40,
    left: -100
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 18,

    shadowColor: "#ff0055",
    shadowRadius: 45,
    shadowOffset: {
      width: 0,
      height: 0
    },
    elevation: 20
  },

  logo: {
    width: 360,
    height: 180
  },

  subtitle: {
    color: "#b0b0b0",
    marginBottom: 36,
    letterSpacing: 4,
    fontSize: 11,
    fontWeight: "600"
  },

  card: {
    width: "88%",
    backgroundColor: "rgba(18,18,18,0.85)",
    padding: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 12
  },

  label: {
    color: "#c0c0c0",
    marginBottom: 10,
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: "600"
  },

  input: {
    backgroundColor: "#0b0b0b",
    color: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    fontSize: 15
  },

  btn: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#ff0033",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10
  },

  btnInner: {
    paddingVertical: 16,
    borderRadius: 18
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 15
  }

};