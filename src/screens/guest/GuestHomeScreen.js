import { Pressable, StyleSheet, Text, View } from "react-native";

import { logoutUser } from "../../services/authService";

export default function GuestHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Guest</Text>
      <Text style={styles.title}>Guest Dashboard</Text>
      <Text style={styles.description}>
        Next feature: browse property listings and submit booking requests.
      </Text>

      <Pressable style={styles.button} onPress={logoutUser}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    fontWeight: "700",
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 12,
    marginTop: 28,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center",
  },
});
