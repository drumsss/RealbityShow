import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>

      <Tabs.Screen name="index" options={{ title: "HOME", tabBarIcon: () => <Text>🏠</Text> }} />
      <Tabs.Screen name="chat" options={{ title: "CHAT", tabBarIcon: () => <Text>💬</Text> }} />
      <Tabs.Screen name="calendar" options={{ title: "SFIDE", tabBarIcon: () => <Text>📅</Text> }} />
      <Tabs.Screen name="ranking" options={{ title: "RANK", tabBarIcon: () => <Text>🏆</Text> }} />
      <Tabs.Screen name="profile" options={{ title: "PROFILO", tabBarIcon: () => <Text>👤</Text> }} />

    </Tabs>
  );
}