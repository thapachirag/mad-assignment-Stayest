import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import EmptyState from "../../components/EmptyState";
import InnerScreenHeader from "../../components/InnerScreenHeader";
import { db } from "../../config/firebase";
import { colors, radius, spacing } from "../../theme/theme";

function AuditLogCard({ log }) {
  return (
    <View style={styles.card}>
      <View style={styles.actionBadge}>
        <Text style={styles.actionText}>{log.action}</Text>
      </View>

      <Text style={styles.description}>{log.description}</Text>

      <View style={styles.metaBox}>
        <Text style={styles.metaText}>Role: {log.role}</Text>
        <Text style={styles.metaText}>Entity: {log.entityType}</Text>
        <Text style={styles.metaText}>Entity ID: {log.entityId}</Text>
      </View>
    </View>
  );
}

export default function AuditLogScreen({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadLogs() {
    try {
      const logsQuery = query(collection(db, "auditLogs"));
      const snapshot = await getDocs(logsQuery);

      const results = snapshot.docs.map((logDoc) => ({
        id: logDoc.id,
        ...logDoc.data(),
      }));

      setLogs(results);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  }

  const summary = useMemo(() => {
    const guestActions = logs.filter((item) => item.role === "guest").length;
    const hostActions = logs.filter((item) => item.role === "host").length;
    const moderatorActions = logs.filter(
      (item) => item.role === "moderator",
    ).length;

    return { guestActions, hostActions, moderatorActions };
  }, [logs]);

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
      <InnerScreenHeader
        title="Audit Logs"
        subtitle="Track important actions across bookings, reviews, listings, and disputes."
        onBack={onBack}
      />

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.guestActions}</Text>
          <Text style={styles.summaryLabel}>Guest</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.hostActions}</Text>
          <Text style={styles.summaryLabel}>Host</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.moderatorActions}</Text>
          <Text style={styles.summaryLabel}>Moderator</Text>
        </View>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No audit logs"
            message="Important system actions will appear here."
          />
        }
        renderItem={({ item }) => <AuditLogCard log={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  summaryLabel: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.infoLight,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  actionText: {
    color: colors.info,
    fontSize: 12,
    fontWeight: "900",
  },
  description: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    fontWeight: "700",
  },
  metaBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
    marginBottom: 4,
  },
});
