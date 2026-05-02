import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { db } from "../../config/firebase";

export default function AuditLogScreen({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadLogs() {
    const logsQuery = query(collection(db, "auditLogs"));
    const snapshot = await getDocs(logsQuery);

    const results = snapshot.docs.map((logDoc) => ({
      id: logDoc.id,
      ...logDoc.data(),
    }));

    setLogs(results);
    setLoading(false);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading audit logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audit Logs</Text>
      <Text style={styles.subtitle}>
        Track important system actions by user, role, and action type.
      </Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No audit logs</Text>
            <Text style={styles.emptyText}>
              Important system actions will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.action}>{item.action}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.metaBox}>
              <Text style={styles.metaText}>Role: {item.role}</Text>
              <Text style={styles.metaText}>Entity: {item.entityType}</Text>
              <Text style={styles.metaText}>User ID: {item.userId}</Text>
            </View>
          </View>
        )}
      />

      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 21,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  action: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  metaBox: {
    marginTop: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 10,
  },
  metaText: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "600",
    marginBottom: 3,
  },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  backButtonText: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "700",
  },
});
