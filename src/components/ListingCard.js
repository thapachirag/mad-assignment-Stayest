import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/theme";

export default function ListingCard({ listing, onPress }) {
  const amenitiesCount = listing.amenities?.length || 0;

  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>StayNest</Text>
        <Text style={styles.imageSubtext}>Property</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleArea}>
            <Text style={styles.title} numberOfLines={1}>
              {listing.title}
            </Text>
            <Text style={styles.location} numberOfLines={1}>
              {listing.location}
            </Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.price}>£{listing.nightlyRate}</Text>
            <Text style={styles.priceSuffix}>night</Text>
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
        </View>

        <Text style={styles.availability}>
          Available: {listing.availableFrom} → {listing.availableTo}
        </Text>

        {onPress ? (
          <Pressable style={styles.viewButton} onPress={onPress}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  imageSubtext: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  content: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  location: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  priceBox: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.success,
  },
  priceSuffix: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "700",
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
  availability: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.info,
    fontWeight: "800",
  },
  viewButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    padding: 13,
    borderRadius: radius.md,
  },
  viewButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 15,
  },
});
