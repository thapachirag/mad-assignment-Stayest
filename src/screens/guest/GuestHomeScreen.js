import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../../theme/theme";

import AppHeader from "../../components/AppHeader";
import DashboardCard from "../../components/DashboardCard";
import FeaturedListingsSection from "../../components/FeaturedListingsSection";
import ScreenContainer from "../../components/ScreenContainer";

import BookingRequestScreen from "./BookingRequestScreen";
import GuestBookingsScreen from "./GuestBookingsScreen";
import GuestBrowseScreen from "./GuestBrowseScreen";
import ListingDetailsScreen from "./ListingDetailsScreen";
import ReviewScreen from "./ReviewScreen";

export default function GuestHomeScreen() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  if (screen === "browse") {
    return (
      <GuestBrowseScreen
        onBack={() => setScreen("dashboard")}
        onSelectListing={(listing) => {
          setSelectedListing(listing);
          setScreen("details");
        }}
      />
    );
  }

  if (screen === "details" && selectedListing) {
    return (
      <ListingDetailsScreen
        listing={selectedListing}
        onBack={() => setScreen("browse")}
        onRequestBooking={() => setScreen("bookingRequest")}
      />
    );
  }

  if (screen === "bookingRequest" && selectedListing) {
    return (
      <BookingRequestScreen
        listing={selectedListing}
        onBack={() => setScreen("details")}
        onSubmitted={() => setScreen("bookings")}
      />
    );
  }

  if (screen === "bookings") {
    return (
      <GuestBookingsScreen
        onBack={() => setScreen("dashboard")}
        onLeaveReview={(booking) => {
          setSelectedBooking(booking);
          setScreen("review");
        }}
      />
    );
  }

  if (screen === "review" && selectedBooking) {
    return (
      <ReviewScreen
        booking={selectedBooking}
        onBack={() => setScreen("bookings")}
        onSubmitted={() => setScreen("bookings")}
      />
    );
  }

  return (
    <ScreenContainer scroll>
      <AppHeader />

      <FeaturedListingsSection
        onBrowseAll={() => setScreen("browse")}
        onViewListing={(listing) => {
          setSelectedListing(listing);
          setScreen("details");
        }}
      />

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <DashboardCard
          title="Browse All Listings"
          description="Search all available properties and filter by price or guest capacity."
          meta="Full listing search"
          accent="info"
          onPress={() => setScreen("browse")}
        />

        <DashboardCard
          title="My Bookings"
          description="Track booking requests, approval status, countdown indicators, and completed stays."
          meta="View requested, approved, completed, or disputed bookings"
          accent="success"
          onPress={() => setScreen("bookings")}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.infoLight,
    color: colors.info,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    fontWeight: "900",
    marginBottom: 14,
    overflow: "hidden",
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.body,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  quickActions: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 4,
  },
});
