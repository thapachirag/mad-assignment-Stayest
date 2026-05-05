import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
        <Text style={styles.metaText}>User ID: {log.userId}</Text>
      </View>
    </View>
  );
}

function SummaryFilterCard({ label, value, role, selectedRole, onPress }) {
  const isSelected = selectedRole === role;

  return (
    <Pressable
      style={[styles.summaryCard, isSelected && styles.selectedSummaryCard]}
      onPress={onPress}
    >
      <Text
        style={[styles.summaryValue, isSelected && styles.selectedSummaryValue]}
      >
        {value}
      </Text>

      <Text
        style={[styles.summaryLabel, isSelected && styles.selectedSummaryLabel]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getCreatedAtMillis(log) {
  if (!log.createdAt) return 0;

  if (typeof log.createdAt.toMillis === "function") {
    return log.createdAt.toMillis();
  }

  if (log.createdAt.seconds) {
    return log.createdAt.seconds * 1000;
  }

  return 0;
}

export default function AuditLogScreen({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadLogs() {
    try {
      const logsQuery = query(collection(db, "auditLogs"));
      const snapshot = await getDocs(logsQuery);

      const results = snapshot.docs
        .map((logDoc) => ({
          id: logDoc.id,
          ...logDoc.data(),
        }))
        .sort((a, b) => getCreatedAtMillis(b) - getCreatedAtMillis(a));

      setLogs(results);
    } catch (error) {
      console.log("Failed to load audit logs:", error);
      setLogs([]);
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

  function handleFilterPress(role) {
    setSelectedRole((currentRole) => (currentRole === role ? null : role));
  }

  const summary = useMemo(() => {
    const guest = logs.filter((item) => item.role === "guest").length;
    const host = logs.filter((item) => item.role === "host").length;
    const moderator = logs.filter((item) => item.role === "moderator").length;

    return { guest, host, moderator };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (!selectedRole) {
      return logs;
    }

    return logs.filter((item) => item.role === selectedRole);
  }, [logs, selectedRole]);

  function getEmptyTitle() {
    if (selectedRole === "guest") return "No guest audit logs";
    if (selectedRole === "host") return "No host audit logs";
    if (selectedRole === "moderator") return "No moderator audit logs";
    return "No audit logs";
  }

  function getEmptyMessage() {
    if (selectedRole) {
      return "No audit logs match the selected role filter.";
    }

    return "Important system actions will appear here.";
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
      <InnerScreenHeader
        title="Audit Logs"
        subtitle="Track important actions across bookings, reviews, listings, and disputes."
        onBack={onBack}
      />

      <View style={styles.summaryRow}>
        <SummaryFilterCard
          label="Guest"
          value={summary.guest}
          role="guest"
          selectedRole={selectedRole}
          onPress={() => handleFilterPress("guest")}
        />

        <SummaryFilterCard
          label="Host"
          value={summary.host}
          role="host"
          selectedRole={selectedRole}
          onPress={() => handleFilterPress("host")}
        />

        <SummaryFilterCard
          label="Moderator"
          value={summary.moderator}
          role="moderator"
          selectedRole={selectedRole}
          onPress={() => handleFilterPress("moderator")}
        />
      </View>

      <View style={styles.filterInfoBox}>
        <Text style={styles.filterInfoText}>
          {selectedRole
            ? `Showing ${filteredLogs.length} ${selectedRole} log(s)`
            : `Showing all ${filteredLogs.length} audit log(s)`}
        </Text>

        {selectedRole ? (
          <Pressable onPress={() => setSelectedRole(null)}>
            <Text style={styles.clearFilterText}>Clear filter</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState title={getEmptyTitle()} message={getEmptyMessage()} />
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
    marginBottom: spacing.md,
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
  selectedSummaryCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  selectedSummaryValue: {
    color: colors.primaryText,
  },
  summaryLabel: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  selectedSummaryLabel: {
    color: colors.primaryText,
  },
  filterInfoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "800",
  },
  clearFilterText: {
    fontSize: 13,
    color: colors.info,
    fontWeight: "900",
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
