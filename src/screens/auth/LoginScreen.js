import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
} from "react-native";

import { loginUser } from "../../services/authService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("guest@test.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing details", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      await loginUser({ email, password });
    } catch (error) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.appName}>StayNest</Text>
      <Text style={styles.subtitle}>Short-term rental booking app</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Signing in..." : "Login"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>Create new account</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 12,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  linkText: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
    fontWeight: "600",
  },
});
