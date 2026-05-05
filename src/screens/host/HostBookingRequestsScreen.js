import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import InnerScreenHeader from "../../components/InnerScreenHeader";
import { auth } from "../../config/firebase";
import {
  approveBookingRequest,
  completeBooking,
  declineBookingRequest,
  getBookingsByHost,
} from "../../services/bookingService";
import { colors, spacing } from "../../theme/theme";

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

    Alert.alert(
      "Approve Booking",
      "Are you sure you want to approve this booking request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              setUpdatingBookingId(booking.id);

              await approveBookingRequest({
                booking,
                hostId: currentUser.uid,
              });

              Alert.alert("Booking approved", "The request has been approved.");
              await loadBookings();
            } catch (error) {
              Alert.alert("Approval failed", error.message);
            } finally {
              setUpdatingBookingId(null);
            }
          },
        },
      ],
    );
  }

  async function handleDecline(booking) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    Alert.alert(
      "Decline Booking",
      "Are you sure you want to decline this booking request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdatingBookingId(booking.id);

              await declineBookingRequest({
                booking,
                hostId: currentUser.uid,
              });

              Alert.alert("Booking declined", "The request has been declined.");
              await loadBookings();
            } catch (error) {
              Alert.alert("Decline failed", error.message);
            } finally {
              setUpdatingBookingId(null);
            }
          },
        },
      ],
    );
  }

  async function handleComplete(booking) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    Alert.alert(
      "Complete Booking",
      "Mark this booking as completed after checkout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              setUpdatingBookingId(booking.id);

              await completeBooking({
                booking,
                hostId: currentUser.uid,
              });

              Alert.alert("Booking completed", "The stay has been completed.");
              await loadBookings();
            } catch (error) {
              Alert.alert("Completion failed", error.message);
            } finally {
              setUpdatingBookingId(null);
            }
          },
        },
      ],
    );
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
      <InnerScreenHeader
        title="Booking Requests"
        subtitle="Review guest requests, approve or decline them, complete stays, and raise disputes."
        onBack={onBack}
      />

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No booking requests"
            message="Guest booking requests for your listings will appear here."
          />
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            mode="host"
            updating={updatingBookingId === item.id}
            onApprove={() => handleApprove(item)}
            onDecline={() => handleDecline(item)}
            onComplete={() => handleComplete(item)}
            onRaiseDispute={() => onRaiseDispute(item)}
          />
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
  },
  listContent: {
    paddingBottom: 40,
  },
});
