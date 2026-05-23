import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  View
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const { width } = Dimensions.get("window");

export default function Calendar() {

  const [data, setData] = useState({});

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ];

  const dayNames = {
    monday: "MONDAY",
    tuesday: "TUESDAY",
    wednesday: "WEDNESDAY",
    thursday: "THURSDAY",
    friday: "FRIDAY",
    saturday: "SATURDAY",
    sunday: "SUNDAY"
  };

  useEffect(() => {

    const unsub = days.map(day =>
      onSnapshot(
        doc(db, "calendar", day),
        (snap) => {
          setData(prev => ({
            ...prev,
            [day]: snap.data()?.title || "NESSUNA SFIDA"
          }));
        }
      )
    );

    return () => unsub.forEach(u => u());
  }, []);

  return (

    <LinearGradient
      colors={["#050505", "#070707", "#120018"]}
      style={styles.container}
    >

      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>WEEKLY CHALLENGES</Text>
        <Text style={styles.subtitle}>CALENDARIO UFFICIALE</Text>
      </View>

      {/* CARDS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
          alignItems: "center"
        }}
        style={{ width: "100%" }}
      >

        {days.map((day, i) => (

          <View key={day} style={styles.card}>

            <View style={styles.innerGlow} />

            <View style={styles.left}>

              <Text style={styles.day}>
                {dayNames[day]}
              </Text>

              <View style={styles.line} />

              <Text style={styles.challenge}>
                {data[day]}
              </Text>

            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {String(i + 1).padStart(2, "0")}
              </Text>
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
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "#a020f0",
    opacity: 0.10,
    top: -120,
    right: -120
  },

  glow2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "#00d4ff",
    opacity: 0.08,
    bottom: 40,
    left: -120
  },

  header: {
    alignItems: "center",
    marginBottom: 25
  },

  title: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 2
  },

  subtitle: {
    color: "#777",
    fontSize: 12,
    letterSpacing: 4,
    marginTop: 6
  },

  card: {
    width: width * 0.92,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.04)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",

    shadowColor: "#000",
    shadowOpacity: 0.7,
    shadowRadius: 25,
    elevation: 14,

    overflow: "hidden"
  },

  innerGlow: {
    position: "absolute",
    width: "120%",
    height: "120%",
    backgroundColor: "rgba(255,255,255,0.03)",
    transform: [{ rotate: "10deg" }]
  },

  left: {
    flex: 1,
    zIndex: 2
  },

  day: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2
  },

  line: {
    height: 1,
    width: "30%",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 10,
    marginBottom: 10
  },

  challenge: {
    color: "#e5e5e5",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22
  },

  badge: {
    width: 50,
    height: 50,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)"
  },

  badgeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14
  }

};