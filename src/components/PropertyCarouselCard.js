import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme/theme";

export default function PropertyCarouselCard({ listing, onView }) {
  const amenitiesCount = listing.amenities?.length || 0;

  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>StayNest</Text>
        <Text style={styles.imageSubtext}>Property</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>

        <Text style={styles.location} numberOfLines={1}>
          {listing.location}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>£{listing.nightlyRate}</Text>
          <Text style={styles.priceSuffix}>/ night</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>{listing.maxGuests} guests</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>✦</Text>
            <Text style={styles.metaText}>{amenitiesCount} amenities</Text>
          </View>
        </View>

        <Pressable style={styles.viewButton} onPress={onView}>
          <Text style={styles.viewButtonText}>View</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginRight: spacing.lg,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  imageSubtext: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  location: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  priceRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.success,
  },
  priceSuffix: {
    marginLeft: 3,
    marginBottom: 3,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  metaRow: {
    marginTop: 12,
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  viewButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  viewButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
  },
});
