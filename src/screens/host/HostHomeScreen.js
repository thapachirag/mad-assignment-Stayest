import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";
import DashboardCard from "../../components/DashboardCard";
import DashboardSummaryRow from "../../components/DashboardSummaryRow";
import ScreenContainer from "../../components/ScreenContainer";
import { auth } from "../../config/firebase";
import { getHostDashboardSummary } from "../../services/dashboardService";
import { colors, typography } from "../../theme/theme";

import CreateListingScreen from "./CreateListingScreen";
import HostBookingRequestsScreen from "./HostBookingRequestsScreen";
import HostListingsScreen from "./HostListingsScreen";
import RaiseDisputeScreen from "./RaiseDisputeScreen";

export default function HostHomeScreen() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  const [summary, setSummary] = useState({
    activeListings: 0,
    requestedBookings: 0,
    completedBookings: 0,
  });

  const [summaryLoading, setSummaryLoading] = useState(true);

  async function loadDashboardSummary() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSummaryLoading(false);
      return;
    }

    try {
      const result = await getHostDashboardSummary(currentUser.uid);
      setSummary(result);
    } catch (error) {
      console.log("Failed to load host dashboard summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardSummary();
  }, []);

  function refreshDashboard() {
    setSummaryLoading(true);
    loadDashboardSummary();
  }

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
        onBack={() => {
          refreshDashboard();
          setScreen("dashboard");
        }}
      />
    );
  }

  if (screen === "createListing") {
    return (
      <CreateListingScreen
        onSaved={() => {
          refreshDashboard();
          setScreen("listings");
        }}
        onCancel={() => setScreen("listings")}
      />
    );
  }

  if (screen === "editListing" && selectedListing) {
    return (
      <CreateListingScreen
        initialListing={selectedListing}
        onSaved={() => {
          refreshDashboard();
          setSelectedListing(null);
          setScreen("listings");
        }}
        onDeleted={() => {
          refreshDashboard();
          setSelectedListing(null);
          setScreen("listings");
        }}
        onCancel={() => {
          setSelectedListing(null);
          setScreen("listings");
        }}
      />
    );
  }

  if (screen === "bookingRequests") {
    return (
      <HostBookingRequestsScreen
        onBack={() => {
          refreshDashboard();
          setScreen("dashboard");
        }}
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
        onSubmitted={() => {
          refreshDashboard();
          setSelectedBooking(null);
          setScreen("bookingRequests");
        }}
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

      <DashboardSummaryRow
        loading={summaryLoading}
        items={[
          {
            label: "Listings",
            value: summary.activeListings,
            helper: "Active properties",
            accent: "info",
          },
          {
            label: "Requests",
            value: summary.requestedBookings,
            helper: "Need review",
            accent: "warning",
          },
          {
            label: "Completed",
            value: summary.completedBookings,
            helper: "Finished stays",
            accent: "success",
          },
        ]}
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Host Workflow</Text>
        <Text style={styles.summaryText}>
          Create listing → Receive request → Approve or decline → Complete stay
          → Raise dispute if needed
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
