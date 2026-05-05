import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { getBookingsByGuest } from "../../services/bookingService";
import { colors, spacing } from "../../theme/theme";

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
      <InnerScreenHeader
        title="My Bookings"
        subtitle="Track booking requests, approvals, countdown indicators, and completed stays."
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
            title="No bookings yet"
            message="Browse listings and submit your first booking request."
          />
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            mode="guest"
            onReview={() => onLeaveReview(item)}
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
