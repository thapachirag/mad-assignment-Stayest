import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { getAllActiveListings } from "../services/listingService";
import { colors, spacing, typography } from "../theme/theme";
import EmptyState from "./EmptyState";
import PropertyCarouselCard from "./PropertyCarouselCard";

export default function FeaturedListingsSection({
  onViewListing,
  onBrowseAll,
}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadListings() {
    try {
      const results = await getAllActiveListings();
      setListings(results.slice(0, 6));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Featured Listings</Text>
          <Text style={styles.sectionSubtitle}>
            Recently available properties
          </Text>
        </View>

        <Pressable onPress={onBrowseAll}>
          <Text style={styles.seeAllText}>See all</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      ) : listings.length === 0 ? (
        <EmptyState
          title="No listings available"
          message="Host-created property listings will appear here."
        />
      ) : (
        <FlatList
          horizontal
          data={listings}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          renderItem={({ item }) => (
            <PropertyCarouselCard
              listing={item}
              onView={() => onViewListing(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 14,
    color: colors.info,
    fontWeight: "900",
  },
  loadingBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  carouselContent: {
    paddingRight: spacing.xl,
  },
});
