import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme/theme";
import { getCheckInIndicator } from "../utils/dateUtils";
import BookingTimeline from "./BookingTimeline";
import StatusBadge from "./StatusBadge";

export default function BookingCard({
  booking,
  mode = "guest",
  updating = false,
  onApprove,
  onDecline,
  onComplete,
  onReview,
  onRaiseDispute,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>
            {booking.listingTitle}
          </Text>
          <Text style={styles.dates}>
            {booking.checkInDate} → {booking.checkOutDate}
          </Text>
        </View>

        <StatusBadge status={booking.status} />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{booking.numberOfGuests}</Text>
          <Text style={styles.summaryLabel}>Guests</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{booking.nights}</Text>
          <Text style={styles.summaryLabel}>Nights</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>£{booking.totalPrice}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      {booking.notes ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>
            {mode === "host" ? "Guest note" : "Your note"}
          </Text>
          <Text style={styles.noteText}>{booking.notes}</Text>
        </View>
      ) : null}

      <View style={styles.indicatorBox}>
        <Text style={styles.indicatorText}>
          {getCheckInIndicator(booking.checkInDate, booking.checkOutDate)}
        </Text>
      </View>

      <BookingTimeline status={booking.status} />

      {mode === "host" && booking.status === "requested" ? (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.successButton, updating && styles.disabled]}
            onPress={onApprove}
            disabled={updating}
          >
            <Text style={styles.successButtonText}>
              {updating ? "Updating..." : "Approve"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.dangerButton, updating && styles.disabled]}
            onPress={onDecline}
            disabled={updating}
          >
            <Text style={styles.dangerButtonText}>Decline</Text>
          </Pressable>
        </View>
      ) : null}

      {mode === "host" && booking.status === "approved" ? (
        <Pressable
          style={[styles.primaryButton, updating && styles.disabled]}
          onPress={onComplete}
          disabled={updating}
        >
          <Text style={styles.primaryButtonText}>
            {updating ? "Updating..." : "Mark as Completed"}
          </Text>
        </Pressable>
      ) : null}

      {mode === "host" && booking.status === "completed" ? (
        <Pressable style={styles.dangerButtonFull} onPress={onRaiseDispute}>
          <Text style={styles.dangerButtonText}>Raise Dispute</Text>
        </Pressable>
      ) : null}

      {mode === "guest" && booking.status === "completed" ? (
        <Pressable style={styles.primaryButton} onPress={onReview}>
          <Text style={styles.primaryButtonText}>Leave Review</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  dates: {
    marginTop: 5,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "800",
  },
  noteBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  indicatorBox: {
    marginTop: spacing.md,
    backgroundColor: colors.infoLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  indicatorText: {
    fontSize: 13,
    color: colors.info,
    fontWeight: "900",
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    padding: 13,
    borderRadius: radius.md,
  },
  primaryButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 15,
  },
  successButton: {
    flex: 1,
    backgroundColor: colors.success,
    padding: 13,
    borderRadius: radius.md,
  },
  successButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "900",
  },
  dangerButton: {
    flex: 1,
    backgroundColor: colors.dangerLight,
    padding: 13,
    borderRadius: radius.md,
  },
  dangerButtonFull: {
    marginTop: spacing.lg,
    backgroundColor: colors.dangerLight,
    padding: 13,
    borderRadius: radius.md,
  },
  dangerButtonText: {
    color: colors.danger,
    textAlign: "center",
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.6,
  },
});
