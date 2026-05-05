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

import EmptyState from "../../components/EmptyState";
import InnerScreenHeader from "../../components/InnerScreenHeader";
import ListingCard from "../../components/ListingCard";
import { auth } from "../../config/firebase";
import {
    getSavedListingsByGuest,
    unsaveListing,
} from "../../services/savedListingService";
import { colors, radius, spacing } from "../../theme/theme";

export default function SavedListingsScreen({ onBack, onSelectListing }) {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadSavedListings() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSavedListings([]);
      setLoading(false);
      return;
    }

    try {
      const results = await getSavedListingsByGuest(currentUser.uid);
      setSavedListings(results);
    } catch (error) {
      Alert.alert("Load failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSavedListings();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadSavedListings();
    setRefreshing(false);
  }

  async function handleRemoveSaved(listing) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    try {
      await unsaveListing({
        guestId: currentUser.uid,
        listingId: listing.id,
      });

      await loadSavedListings();
    } catch (error) {
      Alert.alert("Remove failed", error.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading saved listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        title="Saved Listings"
        subtitle="View properties you bookmarked while browsing."
        onBack={onBack}
      />

      <View style={styles.summaryBox}>
        <Text style={styles.summaryValue}>{savedListings.length}</Text>
        <Text style={styles.summaryLabel}>
          {savedListings.length === 1 ? "saved property" : "saved properties"}
        </Text>
      </View>

      <FlatList
        data={savedListings}
        keyExtractor={(item) => item.savedId || item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No saved listings"
            message="Open a listing detail page and tap Save Listing to bookmark it."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.savedCardWrapper}>
            <ListingCard listing={item} onPress={() => onSelectListing(item)} />

            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemoveSaved(item)}
            >
              <Text style={styles.removeButtonText}>Remove from Saved</Text>
            </Pressable>
          </View>
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
  savedCardWrapper: {
    marginBottom: spacing.lg,
  },
  removeButton: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  removeButtonText: {
    color: colors.danger,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "900",
  },
});
