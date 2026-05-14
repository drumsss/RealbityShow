import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "user";

export async function setUser(name) {
  return AsyncStorage.setItem(KEY, name);
}

export async function getUser() {
  return AsyncStorage.getItem(KEY);
}

export async function clearUser() {
  return AsyncStorage.removeItem(KEY);
}