import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View
} from "react-native";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

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

  return (

    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Text style={styles.title}>
          WEEKLY CHALLENGES
        </Text>

        <Text style={styles.subtitle}>
          Calendario ufficiale delle sfide
        </Text>

      </View>

      {/* CARD GIORNI */}
      {days.map((day) => (

        <View key={day} style={styles.card}>

          <Text style={styles.day}>
            {dayNames[day]}
          </Text>

          <View style={styles.line} />

          <Text style={styles.challenge}>
            {data[day]}
          </Text>

        </View>

      ))}

      <View style={{ height: 30 }} />

    </ScrollView>
  );
}

const styles = {

  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 18,
    paddingTop: 60
  },

  header: {
    alignItems: "center",
    marginBottom: 30
  },

  title: {
    color: "#ffd700",
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 1
  },

  subtitle: {
    color: "#777",
    fontSize: 14,
    marginTop: 6
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1d1d1d"
  },

  day: {
    color: "#00bfff",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 2
  },

  line: {
    height: 2,
    width: "100%",
    backgroundColor: "#222",
    marginTop: 10,
    marginBottom: 14,
    borderRadius: 10
  },

  challenge: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24
  }

};