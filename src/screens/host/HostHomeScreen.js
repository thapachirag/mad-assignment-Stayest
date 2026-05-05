import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../../theme/theme";

import AppHeader from "../../components/AppHeader";
import DashboardCard from "../../components/DashboardCard";
import ScreenContainer from "../../components/ScreenContainer";

import CreateListingScreen from "./CreateListingScreen";
import HostBookingRequestsScreen from "./HostBookingRequestsScreen";
import HostListingsScreen from "./HostListingsScreen";
import RaiseDisputeScreen from "./RaiseDisputeScreen";

export default function HostHomeScreen() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  if (screen === "listings") {
    return (
      <HostListingsScreen
        onCreatePress={() => {
          setSelectedListing(null);
          setScreen("createListing");
        }}
        onEditPress={(listing) => {
          setSelectedListing(listing);
          setScreen("editListing");
        }}
        onBack={() => setScreen("dashboard")}
      />
    );
  }

  if (screen === "createListing") {
    return (
      <CreateListingScreen
        onSaved={() => setScreen("listings")}
        onCancel={() => setScreen("listings")}
      />
    );
  }

  if (screen === "editListing" && selectedListing) {
    return (
      <CreateListingScreen
        initialListing={selectedListing}
        onSaved={() => setScreen("listings")}
        onDeleted={() => setScreen("listings")}
        onCancel={() => setScreen("listings")}
      />
    );
  }

  if (screen === "bookingRequests") {
    return (
      <HostBookingRequestsScreen
        onBack={() => setScreen("dashboard")}
        onRaiseDispute={(booking) => {
          setSelectedBooking(booking);
          setScreen("raiseDispute");
        }}
      />
    );
  }

  if (screen === "raiseDispute" && selectedBooking) {
    return (
      <RaiseDisputeScreen
        booking={selectedBooking}
        onBack={() => setScreen("bookingRequests")}
        onSubmitted={() => setScreen("bookingRequests")}
      />
    );
  }

  return (
    <ScreenContainer scroll>
      <AppHeader />

      <View style={styles.header}>
        <Text style={styles.title}>Manage your properties</Text>
        <Text style={styles.subtitle}>
          Create property listings, manage booking requests, complete stays, and
          raise disputes when needed.
        </Text>
      </View>

      <DashboardCard
        title="Manage Listings"
        description="Create and review property listings with price, amenities, rules, and availability dates."
        meta="Property owner tools"
        accent="success"
        onPress={() => setScreen("listings")}
      />

      <DashboardCard
        title="Booking Requests"
        description="Approve or decline guest requests, mark stays as completed, and raise disputes."
        meta="Host booking inbox"
        accent="warning"
        onPress={() => setScreen("bookingRequests")}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.successLight,
    color: colors.success,
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
});
