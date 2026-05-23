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

    return () => {
      unsub.forEach(u => u());
    };

  }, []);

  const getGradient = (index) => {

    const base = [
      ["#ffd700", "#ffb300"],
      ["#00d4ff", "#0066ff"],
      ["#c77dff", "#6a00ff"],
      ["#ff4d6d", "#ff0033"],
      ["#00ff9d", "#00b36b"],
      ["#c0c0c0", "#6b6b6b"],
      ["#ff9f1c", "#ff5e00"]
    ];

    return base[index % base.length];
  };

  return (

    <LinearGradient
      colors={["#050505", "#0b0b0b", "#160022"]}
      style={styles.container}
    >

      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* HEADER */}
      <View style={styles.header}>

        <Text style={styles.title}>
          WEEKLY CHALLENGES
        </Text>

        <Text style={styles.subtitle}>
          CALENDARIO UFFICIALE
        </Text>

      </View>

      {/* CARDS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          alignItems: "center"
        }}
        style={{ width: "100%" }}
      >

        {days.map((day, i) => (

          <LinearGradient
            key={day}
            colors={getGradient(i)}
            style={styles.card}
          >

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
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "#c77dff",
    opacity: 0.15,
    top: -90,
    right: -100
  },

  glow2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "#00d4ff",
    opacity: 0.12,
    bottom: 40,
    left: -90
  },

  header: {
    alignItems: "center",
    marginBottom: 25
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 2
  },

  subtitle: {
    color: "#888",
    fontSize: 12,
    letterSpacing: 4,
    marginTop: 6
  },

  card: {
    width: width * 0.92,
    borderRadius: 26,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10
  },

  left: {
    flex: 1
  },

  day: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2
  },

  line: {
    height: 2,
    width: "40%",
    backgroundColor: "rgba(255,255,255,0.2)",
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10
  },

  challenge: {
    color: "#eaeaea",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22
  },

  badge: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center"
  },

  badgeText: {
    color: "#fff",
    fontWeight: "900"
  }

};