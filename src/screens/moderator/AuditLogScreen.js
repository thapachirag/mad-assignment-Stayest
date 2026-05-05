import * as Clipboard from "expo-clipboard";
import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import EmptyState from "../../components/EmptyState";
import InnerScreenHeader from "../../components/InnerScreenHeader";
import { db } from "../../config/firebase";
import { colors, radius, spacing } from "../../theme/theme";

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

function formatDateTime(log) {
  const millis = getCreatedAtMillis(log);

  if (!millis) {
    return "Date unavailable";
  }

  return new Date(millis).toLocaleString();
}

function parseDateStart(dateText) {
  if (!dateText) return null;

  const [year, month, day] = dateText.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
}

function parseDateEnd(dateText) {
  if (!dateText) return null;

  const [year, month, day] = dateText.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
}

function AuditLogCard({ log, onCopyUserId }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onLongPress={onCopyUserId}
      delayLongPress={700}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.actionBadge}>
          <Text style={styles.actionText}>
            {log.action || "UNKNOWN_ACTION"}
          </Text>
        </View>

        <Text style={styles.dateText}>{formatDateTime(log)}</Text>
      </View>

      <Text style={styles.description}>
        {log.description || "No description available."}
      </Text>

      <View style={styles.metaBox}>
        <Text style={styles.metaText}>Role: {log.role || "N/A"}</Text>

        <View style={styles.userIdRow}>
          <View style={styles.userIdTextArea}>
            <Text style={styles.metaText}>User ID:</Text>
            <Text style={styles.userIdValue} numberOfLines={1}>
              {log.userId || "N/A"}
            </Text>
          </View>
        </View>

        <Text style={styles.metaText}>Entity: {log.entityType || "N/A"}</Text>
        <Text style={styles.metaText}>Entity ID: {log.entityId || "N/A"}</Text>
      </View>
    </Pressable>
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

export default function AuditLogScreen({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedAction, setSelectedAction] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(12)).current;

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

  function handleRolePress(role) {
    setSelectedRole((currentRole) => (currentRole === role ? null : role));
  }

  function handleClearFilters() {
    setSelectedRole(null);
    setSelectedAction("all");
    setUserSearch("");
    setFromDate("");
    setToDate("");
    setFiltersExpanded(false);
  }

  function showCopyToast(message) {
    setToastMessage(message);

    toastOpacity.setValue(0);
    toastTranslateY.setValue(12);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1400),
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 12,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }

  async function handleCopyUserId(userId) {
    if (!userId) {
      showCopyToast("No User ID available to copy.");
      return;
    }

    try {
      await Clipboard.setStringAsync(String(userId));
      showCopyToast("User ID copied to clipboard.");
    } catch (error) {
      console.log("Failed to copy User ID:", error);
      showCopyToast("Unable to copy User ID.");
    }
  }

  const summary = useMemo(() => {
    const guest = logs.filter((item) => item.role === "guest").length;
    const host = logs.filter((item) => item.role === "host").length;
    const moderator = logs.filter((item) => item.role === "moderator").length;

    return { guest, host, moderator };
  }, [logs]);

  const actionOptions = useMemo(() => {
    const uniqueActions = Array.from(
      new Set(logs.map((log) => log.action).filter(Boolean)),
    );

    return uniqueActions.sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const fromMillis = parseDateStart(fromDate);
    const toMillis = parseDateEnd(toDate);
    const normalizedUserSearch = userSearch.trim().toLowerCase();

    return logs.filter((log) => {
      const createdAtMillis = getCreatedAtMillis(log);

      const roleMatch = !selectedRole || log.role === selectedRole;

      const actionMatch =
        selectedAction === "all" || log.action === selectedAction;

      const userMatch =
        !normalizedUserSearch ||
        String(log.userId || "")
          .toLowerCase()
          .includes(normalizedUserSearch);

      const fromMatch = !fromMillis || createdAtMillis >= fromMillis;
      const toMatch = !toMillis || createdAtMillis <= toMillis;

      return roleMatch && actionMatch && userMatch && fromMatch && toMatch;
    });
  }, [logs, selectedRole, selectedAction, userSearch, fromDate, toDate]);

  const hasActiveFilters =
    Boolean(selectedRole) ||
    selectedAction !== "all" ||
    Boolean(userSearch.trim()) ||
    Boolean(fromDate.trim()) ||
    Boolean(toDate.trim());

  function getFilterSummary() {
    const parts = [];

    if (selectedRole) {
      parts.push(`Role: ${selectedRole}`);
    }

    if (selectedAction !== "all") {
      parts.push(`Action: ${selectedAction}`);
    }

    if (userSearch.trim()) {
      parts.push(`User: ${userSearch.trim()}`);
    }

    if (fromDate || toDate) {
      parts.push(`Date: ${fromDate || "start"} → ${toDate || "end"}`);
    }

    if (parts.length === 0) {
      return "No filters applied";
    }

    return parts.join(" · ");
  }

  function getEmptyTitle() {
    if (hasActiveFilters) return "No matching audit logs";
    return "No audit logs";
  }

  function getEmptyMessage() {
    if (hasActiveFilters) {
      return "No audit logs match the selected role, user, action, or date filters.";
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
        subtitle="Filter system actions by role, user, action type, or date range."
        onBack={onBack}
      />

      <View style={styles.summaryRow}>
        <SummaryFilterCard
          label="Guest"
          value={summary.guest}
          role="guest"
          selectedRole={selectedRole}
          onPress={() => handleRolePress("guest")}
        />

        <SummaryFilterCard
          label="Host"
          value={summary.host}
          role="host"
          selectedRole={selectedRole}
          onPress={() => handleRolePress("host")}
        />

        <SummaryFilterCard
          label="Moderator"
          value={summary.moderator}
          role="moderator"
          selectedRole={selectedRole}
          onPress={() => handleRolePress("moderator")}
        />
      </View>

      <View
        style={[styles.filterBox, hasActiveFilters && styles.activeFilterBox]}
      >
        <Pressable
          style={styles.filterHeaderRow}
          onPress={() => setFiltersExpanded((value) => !value)}
        >
          <View style={styles.filterHeaderLeft}>
            <View style={styles.filterTitleRow}>
              <Text style={styles.filterTitle}>Advanced Filters</Text>

              {hasActiveFilters ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.filterSubtitle,
                hasActiveFilters && styles.activeFilterSubtitle,
              ]}
            >
              {getFilterSummary()}
            </Text>
          </View>

          <Text style={styles.expandIcon}>{filtersExpanded ? "−" : "+"}</Text>
        </Pressable>

        {filtersExpanded ? (
          <View style={styles.expandedFilterContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Search by User ID</Text>
              <TextInput
                style={styles.input}
                value={userSearch}
                onChangeText={setUserSearch}
                placeholder="Paste or type user ID"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date Range</Text>

              <View style={styles.twoColumnRow}>
                <View style={styles.column}>
                  <TextInput
                    style={styles.input}
                    value={fromDate}
                    onChangeText={setFromDate}
                    placeholder="From: YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={styles.column}>
                  <TextInput
                    style={styles.input}
                    value={toDate}
                    onChangeText={setToDate}
                    placeholder="To: YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Action Type</Text>

              <View style={styles.actionChipWrap}>
                <Pressable
                  style={[
                    styles.actionChip,
                    selectedAction === "all" && styles.selectedActionChip,
                  ]}
                  onPress={() => setSelectedAction("all")}
                >
                  <Text
                    style={[
                      styles.actionChipText,
                      selectedAction === "all" && styles.selectedActionChipText,
                    ]}
                  >
                    All
                  </Text>
                </Pressable>

                {actionOptions.map((action) => {
                  const isSelected = selectedAction === action;

                  return (
                    <Pressable
                      key={action}
                      style={[
                        styles.actionChip,
                        isSelected && styles.selectedActionChip,
                      ]}
                      onPress={() => setSelectedAction(action)}
                    >
                      <Text
                        style={[
                          styles.actionChipText,
                          isSelected && styles.selectedActionChipText,
                        ]}
                      >
                        {action}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {hasActiveFilters ? (
              <Pressable
                style={styles.clearButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.filterInfoBox}>
        <Text style={styles.filterInfoText}>
          {hasActiveFilters
            ? `Showing ${filteredLogs.length} filtered log(s)`
            : `Showing all ${filteredLogs.length} audit log(s)`}
        </Text>

        {hasActiveFilters ? (
          <Pressable onPress={handleClearFilters}>
            <Text style={styles.clearInlineText}>Clear</Text>
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
        renderItem={({ item }) => (
          <AuditLogCard
            log={item}
            onCopyUserId={() => handleCopyUserId(item.userId)}
          />
        )}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.copyToast,
          {
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          },
        ]}
      >
        <Text style={styles.copyToastText}>{toastMessage}</Text>
      </Animated.View>
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
  filterBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  activeFilterBox: {
    borderColor: colors.info,
    backgroundColor: colors.infoLight,
  },
  filterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterHeaderLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  filterTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  filterSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
    lineHeight: 18,
  },
  activeFilterSubtitle: {
    color: colors.info,
    fontWeight: "900",
  },
  activeBadge: {
    backgroundColor: colors.info,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  activeBadgeText: {
    color: colors.primaryText,
    fontSize: 10,
    fontWeight: "900",
  },
  expandIcon: {
    fontSize: 28,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  expandedFilterContent: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 13,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  actionChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
  selectedActionChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionChipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
  },
  selectedActionChipText: {
    color: colors.primaryText,
  },
  clearButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    borderRadius: radius.md,
  },
  clearButtonText: {
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
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
  clearInlineText: {
    fontSize: 13,
    color: colors.info,
    fontWeight: "900",
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  actionBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.infoLight,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexShrink: 1,
  },
  actionText: {
    color: colors.info,
    fontSize: 12,
    fontWeight: "900",
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "800",
    textAlign: "right",
    flex: 1,
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
  userIdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: 4,
  },
  userIdTextArea: {
    flex: 1,
  },
  userIdValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "800",
  },
  copyPill: {
    backgroundColor: colors.infoLight,
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  copyPillPressed: {
    opacity: 0.75,
  },
  copyPillText: {
    color: colors.info,
    fontSize: 12,
    fontWeight: "900",
  },
  copyHint: {
    marginTop: spacing.sm,
    fontSize: 11,
    color: colors.info,
    fontWeight: "900",
  },
  copyToast: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 6,
  },
  copyToastText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
});
