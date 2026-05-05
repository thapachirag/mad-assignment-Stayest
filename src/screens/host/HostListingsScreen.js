import React, { useEffect, useState } from "react";
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

import EmptyState from "../../components/EmptyState";
import InnerScreenHeader from "../../components/InnerScreenHeader";
import { auth } from "../../config/firebase";
import {
  deleteListing,
  getListingsByHost,
} from "../../services/listingService";
import { colors, radius, spacing } from "../../theme/theme";

function HostListingCard({ listing, onEdit }) {
  const amenitiesCount = listing.amenities?.length || 0;

  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageTitle}>StayNest</Text>
        <Text style={styles.imageSubtitle}>Host Property</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <View style={styles.titleArea}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            <Text style={styles.location} numberOfLines={1}>
              {listing.location}
            </Text>
          </View>

          <View style={styles.priceBadge}>
            <Text style={styles.price}>£{listing.nightlyRate}</Text>
            <Text style={styles.priceLabel}>night</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {listing.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>{listing.maxGuests} guests</Text>
          </View>

          <View style={styles.metaPill}>
            <Text style={styles.metaIcon}>✦</Text>
            <Text style={styles.metaText}>{amenitiesCount} amenities</Text>
          </View>

          <View style={styles.metaPill}>
            <Text style={styles.metaIcon}>🧾</Text>
            <Text style={styles.metaText}>£{listing.cleaningFee} cleaning</Text>
          </View>
        </View>

        <View style={styles.availabilityBox}>
          <Text style={styles.availabilityLabel}>Availability</Text>
          <Text style={styles.availabilityText}>
            {listing.availableFrom} → {listing.availableTo}
          </Text>
        </View>

        <Pressable style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit Listing</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HostListingsScreen({
  onCreatePress,
  onEditPress,
  onBack,
}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadListings() {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setListings([]);
        return;
      }

      const hostListings = await getListingsByHost(currentUser.uid);
      setListings(hostListings);
    } catch (error) {
      Alert.alert("Load failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  }

  function handleDelete(listing) {
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to delete "${listing.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(listing.id);
              await deleteListing(listing.id);
              await loadListings();
              Alert.alert("Deleted", "The listing has been deleted.");
            } catch (error) {
              Alert.alert("Delete failed", error.message);
            } finally {
              setDeletingId(null);
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
        <Text style={styles.loadingText}>Loading your listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        title="My Listings"
        subtitle="Create and manage the properties guests can browse and request."
        onBack={onBack}
        rightLabel="Create"
        onRightPress={onCreatePress}
      />

      <View style={styles.summaryBox}>
        <Text style={styles.summaryValue}>{listings.length}</Text>
        <Text style={styles.summaryLabel}>
          {listings.length === 1 ? "active listing" : "active listings"}
        </Text>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No listings yet"
            message="Create your first property listing so guests can browse and request bookings."
          />
        }
        renderItem={({ item }) => (
          <HostListingCard listing={item} onEdit={() => onEditPress(item)} />
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
  summaryBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  summaryValue: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  summaryLabel: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  imagePlaceholder: {
    height: 130,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  imageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  imageSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  cardContent: {
    padding: spacing.lg,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleArea: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  location: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  priceBadge: {
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  price: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.success,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.success,
  },
  description: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  metaIcon: {
    marginRight: 5,
  },
  metaText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  availabilityBox: {
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  availabilityLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.info,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.info,
  },
  deleteButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.dangerLight,
    padding: 13,
    borderRadius: radius.md,
  },
  deleteButtonText: {
    color: colors.danger,
    textAlign: "center",
    fontWeight: "900",
  },
  editButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    padding: 13,
    borderRadius: radius.md,
  },
  editButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "900",
  },
});
