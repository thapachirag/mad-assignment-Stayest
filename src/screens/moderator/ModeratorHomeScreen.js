import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { logoutUser } from "../../services/authService";
import AuditLogScreen from "./AuditLogScreen";
import DisputeDetailScreen from "./DisputeDetailScreen";
import DisputeListScreen from "./DisputeListScreen";

export default function ModeratorHomeScreen() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedDispute, setSelectedDispute] = useState(null);

  if (screen === "disputes") {
    return (
      <DisputeListScreen
        onBack={() => setScreen("dashboard")}
        onSelectDispute={(dispute) => {
          setSelectedDispute(dispute);
          setScreen("disputeDetail");
        }}
      />
    );
  }

  if (screen === "disputeDetail" && selectedDispute) {
    return (
      <DisputeDetailScreen
        dispute={selectedDispute}
        onBack={() => setScreen("disputes")}
        onResolved={() => setScreen("disputes")}
      />
    );
  }

  if (screen === "auditLogs") {
    return <AuditLogScreen onBack={() => setScreen("dashboard")} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Moderator</Text>
      <Text style={styles.title}>Moderator Dashboard</Text>
      <Text style={styles.description}>
        Review disputes, close or escalate cases, and inspect audit logs.
      </Text>

      <Pressable style={styles.button} onPress={() => setScreen("disputes")}>
        <Text style={styles.buttonText}>Review Disputes</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => setScreen("auditLogs")}
      >
        <Text style={styles.secondaryButtonText}>Audit Logs</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={logoutUser}>
        <Text style={styles.secondaryButtonText}>Logout</Text>
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
    backgroundColor: "#fee2e2",
    color: "#991b1b",
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
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 15,
    borderRadius: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
});
