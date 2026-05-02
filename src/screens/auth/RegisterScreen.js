import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { registerUser } from "../../services/authService";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("guest");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !password) {
      Alert.alert("Missing details", "Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await registerUser({
        fullName,
        email,
        password,
        role,
      });
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Register as a guest or property host.</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={fullName}
        onChangeText={setFullName}
      />

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

      <Text style={styles.label}>Account type</Text>

      <View style={styles.roleRow}>
        <Pressable
          style={[styles.roleButton, role === "guest" && styles.selectedRole]}
          onPress={() => setRole("guest")}
        >
          <Text
            style={[
              styles.roleText,
              role === "guest" && styles.selectedRoleText,
            ]}
          >
            Guest
          </Text>
        </Pressable>

        <Pressable
          style={[styles.roleButton, role === "host" && styles.selectedRole]}
          onPress={() => setRole("host")}
        >
          <Text
            style={[
              styles.roleText,
              role === "host" && styles.selectedRoleText,
            ]}
          >
            Host
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating account..." : "Register"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 24,
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
  label: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 10,
    color: "#111827",
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 12,
  },
  selectedRole: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  roleText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#111827",
  },
  selectedRoleText: {
    color: "#ffffff",
  },
  button: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 12,
    marginTop: 4,
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
