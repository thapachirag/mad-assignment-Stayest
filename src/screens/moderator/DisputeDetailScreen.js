import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { getAllDisputes } from "../../services/disputeService";

function getStatusColor(status) {
  if (status === "open") return "#1d4ed8";
  if (status === "closed") return "#047857";
  if (status === "escalated") return "#b45309";
  return "#111827";
}

export default function DisputeListScreen({ onBack, onSelectDispute }) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDisputes() {
    const results = await getAllDisputes();
    setDisputes(results);
    setLoading(false);
  }

  useEffect(() => {
    loadDisputes();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDisputes();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading disputes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dispute Cases</Text>
      <Text style={styles.subtitle}>
        Review open, closed, and escalated disputes.
      </Text>

      <FlatList
        data={disputes}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No disputes</Text>
            <Text style={styles.emptyText}>
              Disputed bookings will appear here for moderator review.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onSelectDispute(item)}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{item.listingTitle}</Text>
              <Text
                style={[styles.status, { color: getStatusColor(item.status) }]}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.metaText}>Category: {item.category}</Text>
            <Text style={styles.metaText}>Raised by: {item.raisedByRole}</Text>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <Text style={styles.viewDetails}>View dispute details →</Text>
          </Pressable>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  status: {
    fontSize: 12,
    fontWeight: "900",
  },
  metaText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  viewDetails: {
    marginTop: 12,
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "800",
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
