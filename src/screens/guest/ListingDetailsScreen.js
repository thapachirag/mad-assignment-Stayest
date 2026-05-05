import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import InnerScreenHeader from "../../components/InnerScreenHeader";
import { colors, radius, spacing } from "../../theme/theme";

function DetailSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function AmenityChip({ label }) {
  return (
    <View style={styles.amenityChip}>
      <Text style={styles.amenityText}>{label}</Text>
    </View>
  );
}

export default function ListingDetailsScreen({
  listing,
  onBack,
  onRequestBooking,
}) {
  const amenities = listing.amenities || [];

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <InnerScreenHeader
          title="Property Details"
          subtitle="Review the property information before requesting a booking."
          onBack={onBack}
        />

        <View style={styles.heroImage}>
          <Text style={styles.heroTitle}>StayNest</Text>
          <Text style={styles.heroSubtitle}>Property Preview</Text>
        </View>

        <View style={styles.titleBlock}>
          <View style={styles.titleArea}>
            <Text style={styles.propertyTitle}>{listing.title}</Text>
            <Text style={styles.location}>{listing.location}</Text>
          </View>

          <View style={styles.priceBadge}>
            <Text style={styles.price}>£{listing.nightlyRate}</Text>
            <Text style={styles.priceLabel}>per night</Text>
          </View>
        </View>

        <View style={styles.quickInfoRow}>
          <View style={styles.quickInfoCard}>
            <Text style={styles.quickInfoIcon}>👥</Text>
            <Text style={styles.quickInfoValue}>{listing.maxGuests}</Text>
            <Text style={styles.quickInfoLabel}>Guests</Text>
          </View>

          <View style={styles.quickInfoCard}>
            <Text style={styles.quickInfoIcon}>✦</Text>
            <Text style={styles.quickInfoValue}>{amenities.length}</Text>
            <Text style={styles.quickInfoLabel}>Amenities</Text>
          </View>

          <View style={styles.quickInfoCard}>
            <Text style={styles.quickInfoIcon}>🧾</Text>
            <Text style={styles.quickInfoValue}>£{listing.cleaningFee}</Text>
            <Text style={styles.quickInfoLabel}>Cleaning</Text>
          </View>
        </View>

        <DetailSection title="Description">
          <Text style={styles.bodyText}>{listing.description}</Text>
        </DetailSection>

        <DetailSection title="Availability">
          <View style={styles.availabilityBox}>
            <Text style={styles.availabilityText}>
              {listing.availableFrom} → {listing.availableTo}
            </Text>
          </View>
        </DetailSection>

        <DetailSection title="Amenities">
          {amenities.length > 0 ? (
            <View style={styles.amenitiesWrap}>
              {amenities.map((item) => (
                <AmenityChip key={item} label={item} />
              ))}
            </View>
          ) : (
            <Text style={styles.bodyText}>No amenities listed.</Text>
          )}
        </DetailSection>

        <DetailSection title="House Rules">
          <Text style={styles.bodyText}>
            {listing.houseRules || "No house rules provided."}
          </Text>
        </DetailSection>

        <DetailSection title="Cancellation Policy">
          <Text style={styles.bodyText}>
            {listing.cancellationPolicy || "No cancellation policy provided."}
          </Text>
        </DetailSection>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPrice}>£{listing.nightlyRate}</Text>
          <Text style={styles.bottomPriceLabel}>per night</Text>
        </View>

        <Pressable style={styles.requestButton} onPress={onRequestBooking}>
          <Text style={styles.requestButtonText}>Request Booking</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  heroImage: {
    height: 190,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  titleBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  titleArea: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  location: {
    marginTop: 5,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  priceBadge: {
    backgroundColor: colors.successLight,
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  price: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.success,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "800",
  },
  quickInfoRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  quickInfoIcon: {
    fontSize: 20,
  },
  quickInfoValue: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  quickInfoLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "800",
  },
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  availabilityBox: {
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  availabilityText: {
    color: colors.info,
    fontWeight: "900",
    fontSize: 14,
  },
  amenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  amenityChip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  amenityText: {
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: 13,
  },
  bottomSpacer: {
    height: 20,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  requestButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.md,
  },
  requestButtonText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: "900",
  },
});
