import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { auth } from "../../config/firebase";
import {
    approveBookingRequest,
    completeBooking,
    declineBookingRequest,
    getBookingsByHost,
} from "../../services/bookingService";
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

export default function HostBookingRequestsScreen({ onBack, onRaiseDispute }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  async function loadBookings() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const results = await getBookingsByHost(currentUser.uid);
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

  async function handleApprove(booking) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    try {
      setUpdatingBookingId(booking.id);
      await approveBookingRequest({
        booking,
        hostId: currentUser.uid,
      });

      Alert.alert(
        "Booking approved",
        "The guest booking request has been approved.",
      );
      await loadBookings();
    } catch (error) {
      Alert.alert("Approval failed", error.message);
    } finally {
      setUpdatingBookingId(null);
    }
  }

  async function handleDecline(booking) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    try {
      setUpdatingBookingId(booking.id);
      await declineBookingRequest({
        booking,
        hostId: currentUser.uid,
      });

      Alert.alert(
        "Booking declined",
        "The guest booking request has been declined.",
      );
      await loadBookings();
    } catch (error) {
      Alert.alert("Decline failed", error.message);
    } finally {
      setUpdatingBookingId(null);
    }
  }

  async function handleComplete(booking) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    try {
      setUpdatingBookingId(booking.id);
      await completeBooking({
        booking,
        hostId: currentUser.uid,
      });

      Alert.alert(
        "Booking completed",
        "The booking has been marked as completed.",
      );
      await loadBookings();
    } catch (error) {
      Alert.alert("Completion failed", error.message);
    } finally {
      setUpdatingBookingId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading booking requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Requests</Text>
      <Text style={styles.subtitle}>
        Review guest requests and approve, decline, or complete stays.
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
            <Text style={styles.emptyTitle}>No booking requests</Text>
            <Text style={styles.emptyText}>
              Guest booking requests for your listings will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isUpdating = updatingBookingId === item.id;

          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{item.listingTitle}</Text>
                <Text style={styles.status}>{getStatusLabel(item.status)}</Text>
              </View>

              <Text style={styles.dateText}>
                {item.checkInDate} to {item.checkOutDate}
              </Text>

              <Text style={styles.metaText}>
                Guests: {item.numberOfGuests} • Nights: {item.nights}
              </Text>

              <Text style={styles.metaText}>
                Total price: £{item.totalPrice}
              </Text>

              {item.notes ? (
                <Text style={styles.notes}>Guest note: {item.notes}</Text>
              ) : null}

              <Text style={styles.indicator}>
                {getCheckInIndicator(item.checkInDate, item.checkOutDate)}
              </Text>

              {item.status === "requested" ? (
                <View style={styles.actionRow}>
                  <Pressable
                    style={[
                      styles.approveButton,
                      isUpdating && styles.disabledButton,
                    ]}
                    onPress={() => handleApprove(item)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.approveButtonText}>
                      {isUpdating ? "Updating..." : "Approve"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.declineButton,
                      isUpdating && styles.disabledButton,
                    ]}
                    onPress={() => handleDecline(item)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </Pressable>
                </View>
              ) : null}

              {item.status === "approved" ? (
                <Pressable
                  style={[
                    styles.completeButton,
                    isUpdating && styles.disabledButton,
                  ]}
                  onPress={() => handleComplete(item)}
                  disabled={isUpdating}
                >
                  <Text style={styles.completeButtonText}>
                    {isUpdating ? "Updating..." : "Mark as Completed"}
                  </Text>
                </Pressable>
              ) : null}

              {item.status === "completed" ? (
                <Pressable
                  style={styles.disputeButton}
                  onPress={() => onRaiseDispute(item)}
                >
                  <Text style={styles.disputeButtonText}>Raise Dispute</Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
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
    fontWeight: "700",
  },
  metaText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
  },
  notes: {
    marginTop: 10,
    fontSize: 14,
    color: "#374151",
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 10,
  },
  indicator: {
    marginTop: 10,
    fontSize: 14,
    color: "#047857",
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#047857",
    padding: 13,
    borderRadius: 12,
  },
  approveButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "800",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#fee2e2",
    padding: 13,
    borderRadius: 12,
  },
  declineButtonText: {
    color: "#991b1b",
    textAlign: "center",
    fontWeight: "800",
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: "#111827",
    padding: 13,
    borderRadius: 12,
  },
  completeButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.6,
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
  disputeButton: {
    marginTop: 16,
    backgroundColor: "#fee2e2",
    padding: 13,
    borderRadius: 12,
  },
  disputeButtonText: {
    color: "#991b1b",
    textAlign: "center",
    fontWeight: "800",
  },
});
