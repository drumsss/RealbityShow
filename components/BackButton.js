import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function BackButton() {
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        position: "absolute",
        top: 50,
        left: 20,
        backgroundColor: "#111",
        padding: 10,
        borderRadius: 10,
        zIndex: 100
      }}
    >
      <Text style={{ color: "#fff", fontSize: 18 }}>
        ←
      </Text>
    </TouchableOpacity>
  );
}