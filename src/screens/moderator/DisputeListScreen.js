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
import StatusBadge from "../../components/StatusBadge";
import { getAllDisputes } from "../../services/disputeService";
import { colors, radius, spacing } from "../../theme/theme";

function DisputeCard({ dispute, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTopRow}>
        <View style={styles.titleArea}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {dispute.listingTitle}
          </Text>
          <Text style={styles.metaText}>Raised by: {dispute.raisedByRole}</Text>
        </View>

        <StatusBadge status={dispute.status} />
      </View>

      <View style={styles.categoryPill}>
        <Text style={styles.categoryText}>{dispute.category}</Text>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {dispute.description}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Review case details</Text>
        <Text style={styles.arrow}>→</Text>
      </View>
    </Pressable>
  );
}

function SummaryFilterCard({ label, value, status, selectedStatus, onPress }) {
  const isSelected = selectedStatus === status;

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

export default function DisputeListScreen({ onBack, onSelectDispute }) {
  const [disputes, setDisputes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDisputes() {
    try {
      const results = await getAllDisputes();
      setDisputes(results);
    } catch (error) {
      console.log("Failed to load disputes:", error);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDisputes();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDisputes();
    setRefreshing(false);
  }

  function handleFilterPress(status) {
    setSelectedStatus((currentStatus) =>
      currentStatus === status ? null : status,
    );
  }

  const summary = useMemo(() => {
    const open = disputes.filter((item) => item.status === "open").length;
    const closed = disputes.filter((item) => item.status === "closed").length;
    const escalated = disputes.filter(
      (item) => item.status === "escalated",
    ).length;

    return { open, closed, escalated };
  }, [disputes]);

  const filteredDisputes = useMemo(() => {
    if (!selectedStatus) {
      return disputes;
    }

    return disputes.filter((item) => item.status === selectedStatus);
  }, [disputes, selectedStatus]);

  function getEmptyTitle() {
    if (selectedStatus === "open") return "No open disputes";
    if (selectedStatus === "closed") return "No closed disputes";
    if (selectedStatus === "escalated") return "No escalated disputes";
    return "No disputes";
  }

  function getEmptyMessage() {
    if (selectedStatus) {
      return "No dispute cases match the selected filter.";
    }

    return "Disputed bookings will appear here for moderator review.";
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dispute cases...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        title="Dispute Cases"
        subtitle="Review open, closed, and escalated booking disputes."
        onBack={onBack}
      />

      <View style={styles.summaryRow}>
        <SummaryFilterCard
          label="Open"
          value={summary.open}
          status="open"
          selectedStatus={selectedStatus}
          onPress={() => handleFilterPress("open")}
        />

        <SummaryFilterCard
          label="Closed"
          value={summary.closed}
          status="closed"
          selectedStatus={selectedStatus}
          onPress={() => handleFilterPress("closed")}
        />

        <SummaryFilterCard
          label="Escalated"
          value={summary.escalated}
          status="escalated"
          selectedStatus={selectedStatus}
          onPress={() => handleFilterPress("escalated")}
        />
      </View>

      <View style={styles.filterInfoBox}>
        <Text style={styles.filterInfoText}>
          {selectedStatus
            ? `Showing ${filteredDisputes.length} ${selectedStatus} dispute(s)`
            : `Showing all ${filteredDisputes.length} dispute(s)`}
        </Text>

        {selectedStatus ? (
          <Pressable onPress={() => setSelectedStatus(null)}>
            <Text style={styles.clearFilterText}>Clear filter</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filteredDisputes}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState title={getEmptyTitle()} message={getEmptyMessage()} />
        }
        renderItem={({ item }) => (
          <DisputeCard dispute={item} onPress={() => onSelectDispute(item)} />
        )}
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
    fontSize: 26,
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
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  titleArea: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  metaText: {
    marginTop: 5,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  categoryPill: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  categoryText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  description: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footerRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: colors.info,
    fontWeight: "900",
  },
  arrow: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: "900",
  },
});
