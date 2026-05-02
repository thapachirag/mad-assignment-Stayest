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

import { auth } from "../../config/firebase";
import { getBookingsByGuest } from "../../services/bookingService";
import { getCheckInIndicator } from "../../utils/dateUtils";

function getStatusLabel(status) {
  const labels = {
    requested: "Requested",
    approved: "Approved",
    declined: "Declined",
    confirmed: "Confirmed",
    checkedIn: "Checked-In",
    checkedOut: "Checked-Out",
    completed: "Completed",
    disputed: "Disputed",
  };

  return labels[status] || status;
}

export default function GuestBookingsScreen({ onBack, onLeaveReview }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadBookings() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const results = await getBookingsByGuest(currentUser.uid);
    setBookings(results);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <Text style={styles.subtitle}>
        Track your booking requests and stay status.
      </Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>
              Browse listings and submit your first booking request.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{item.listingTitle}</Text>
              <Text style={styles.status}>{getStatusLabel(item.status)}</Text>
            </View>

            <Text style={styles.dateText}>
              {item.checkInDate} to {item.checkOutDate}
            </Text>

            <Text style={styles.metaText}>
              Guests: {item.numberOfGuests} • Total: £{item.totalPrice}
            </Text>

            <Text style={styles.indicator}>
              {getCheckInIndicator(item.checkInDate, item.checkOutDate)}
            </Text>

            <View style={styles.timelineBox}>
              <Text style={styles.timelineTitle}>Status Timeline</Text>
              <Text style={styles.timelineText}>1. Requested</Text>
              <Text style={styles.timelineText}>
                2.{" "}
                {item.status === "declined" ? "Declined" : "Approved / Pending"}
              </Text>
              <Text style={styles.timelineText}>3. Completed</Text>
            </View>
            {item.status === "completed" ? (
              <Pressable
                style={styles.reviewButton}
                onPress={() => onLeaveReview(item)}
              >
                <Text style={styles.reviewButtonText}>Leave Review</Text>
              </Pressable>
            ) : null}
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
    fontSize: 13,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  dateText: {
    marginTop: 8,
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  metaText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
  },
  indicator: {
    marginTop: 10,
    fontSize: 14,
    color: "#047857",
    fontWeight: "800",
  },
  timelineBox: {
    marginTop: 14,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 12,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  timelineText: {
    fontSize: 13,
    color: "#4b5563",
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
  reviewButton: {
    marginTop: 14,
    backgroundColor: "#111827",
    padding: 13,
    borderRadius: 12,
  },
  reviewButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "800",
  },
});
