import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppHeader from "../../components/AppHeader";
import DashboardCard from "../../components/DashboardCard";
import DashboardSummaryRow from "../../components/DashboardSummaryRow";
import ListingCard from "../../components/ListingCard";
import ScreenContainer from "../../components/ScreenContainer";
import { auth } from "../../config/firebase";
import { getGuestDashboardSummary } from "../../services/dashboardService";
import { getAllActiveListings } from "../../services/listingService";
import { colors, radius, spacing, typography } from "../../theme/theme";

import BookingRequestScreen from "./BookingRequestScreen";
import GuestBookingsScreen from "./GuestBookingsScreen";
import GuestBrowseScreen from "./GuestBrowseScreen";
import ListingDetailsScreen from "./ListingDetailsScreen";
import ReviewScreen from "./ReviewScreen";
import SavedListingsScreen from "./SavedListingsScreen";

export default function GuestHomeScreen() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [summary, setSummary] = useState({
    requestedBookings: 0,
    approvedBookings: 0,
    completedBookings: 0,
  });

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  async function loadDashboardSummary() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSummaryLoading(false);
      return;
    }

    try {
      const result = await getGuestDashboardSummary(currentUser.uid);
      setSummary(result);
    } catch (error) {
      console.log("Failed to load guest dashboard summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  }

  async function loadFeaturedListings() {
    try {
      const results = await getAllActiveListings();
      setFeaturedListings(results.slice(0, 5));
    } catch (error) {
      console.log("Failed to load featured listings:", error);
      setFeaturedListings([]);
    } finally {
      setFeaturedLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardSummary();
    loadFeaturedListings();
  }, []);

  function refreshDashboard() {
    setSummaryLoading(true);
    setFeaturedLoading(true);
    loadDashboardSummary();
    loadFeaturedListings();
  }

  if (screen === "browse") {
    return (
      <GuestBrowseScreen
        onBack={() => {
          refreshDashboard();
          setScreen("dashboard");
        }}
        onSelectListing={(listing) => {
          setSelectedListing(listing);
          setScreen("listingDetails");
        }}
      />
    );
  }

  if (screen === "listingDetails" && selectedListing) {
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
        onBack={() => setScreen("listingDetails")}
        onSubmitted={() => {
          refreshDashboard();
          setScreen("bookings");
        }}
      />
    );
  }

  if (screen === "bookings") {
    return (
      <GuestBookingsScreen
        onBack={() => {
          refreshDashboard();
          setScreen("dashboard");
        }}
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
        onSubmitted={() => {
          refreshDashboard();
          setSelectedBooking(null);
          setScreen("bookings");
        }}
      />
    );
  }

  if (screen === "savedListings") {
    return (
      <SavedListingsScreen
        onBack={() => setScreen("dashboard")}
        onSelectListing={(listing) => {
          setSelectedListing(listing);
          setScreen("listingDetails");
        }}
      />
    );
  }

  return (
    <ScreenContainer scroll>
      <AppHeader />

      <View style={styles.header}>
        <Text style={styles.title}>Find your next stay</Text>
        <Text style={styles.subtitle}>
          Browse available properties, request bookings, track your stay status,
          and leave reviews after completion.
        </Text>
      </View>

      <DashboardSummaryRow
        loading={summaryLoading}
        items={[
          {
            label: "Requested",
            value: summary.requestedBookings,
            helper: "Pending host response",
            accent: "warning",
          },
          {
            label: "Approved",
            value: summary.approvedBookings,
            helper: "Upcoming stays",
            accent: "info",
          },
          {
            label: "Completed",
            value: summary.completedBookings,
            helper: "Past stays",
            accent: "success",
          },
        ]}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Listings</Text>
        <Text style={styles.sectionSubtitle}>
          Swipe sideways to explore recently available properties.
        </Text>
      </View>

      {featuredLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Loading featured listings...</Text>
        </View>
      ) : null}

      {!featuredLoading && featuredListings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptyText}>
            Active properties created by hosts will appear here.
          </Text>
        </View>
      ) : null}

      {!featuredLoading && featuredListings.length > 0 ? (
        <FlatList
          horizontal
          data={featuredListings}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          snapToAlignment="start"
          decelerationRate="fast"
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <ListingCard
                listing={item}
                onPress={() => {
                  setSelectedListing(item);
                  setScreen("listingDetails");
                }}
              />
            </View>
          )}
        />
      ) : null}

      <DashboardCard
        title="Browse Listings"
        description="Search available properties, filter by price or guest capacity, and view listing details."
        meta="Find properties"
        accent="info"
        onPress={() => setScreen("browse")}
      />

      <DashboardCard
        title="My Bookings"
        description="Track requested, approved, declined, completed, and disputed bookings."
        meta="Booking status timeline"
        accent="success"
        onPress={() => setScreen("bookings")}
      />

      <DashboardCard
        title="Saved Listings"
        description="View properties you bookmarked for later comparison or booking."
        meta="Bookmarked properties"
        accent="info"
        onPress={() => setScreen("savedListings")}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
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
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
    fontWeight: "700",
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: "700",
  },
  carouselContent: {
    paddingRight: spacing.xl,
    paddingBottom: spacing.md,
  },
  carouselItem: {
    width: 300,
    marginRight: spacing.md,
  },
  loadingBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: "700",
  },
});
