import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import InnerScreenHeader from "../../components/InnerScreenHeader";
import StatusBadge from "../../components/StatusBadge";
import { auth } from "../../config/firebase";
import { closeDispute, escalateDispute } from "../../services/disputeService";
import { colors, radius, spacing } from "../../theme/theme";

function DetailSection({ title, children }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function DisputeDetailScreen({ dispute, onBack, onResolved }) {
  const [decisionReason, setDecisionReason] = useState(
    dispute.decisionReason ||
      "Reviewed submitted notes and closed the case based on available evidence.",
  );
  const [errors, setErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  const isOpen = dispute.status === "open";

  function validateDecision() {
    const nextErrors = {};

    if (!decisionReason.trim()) {
      nextErrors.decisionReason = "Please enter a decision reason.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleClose() {
    if (!validateDecision()) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    Alert.alert(
      "Close Dispute",
      "Are you sure you want to close this dispute and mark the booking as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close",
          onPress: async () => {
            try {
              setUpdating(true);

              await closeDispute({
                dispute,
                moderatorId: currentUser.uid,
                decisionReason,
              });

              Alert.alert("Dispute closed", "The dispute has been closed.");
              onResolved();
            } catch (error) {
              Alert.alert("Close failed", error.message);
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  }

  function handleEscalate() {
    if (!validateDecision()) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    Alert.alert(
      "Escalate Dispute",
      "Are you sure you want to escalate this case for further review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Escalate",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdating(true);

              await escalateDispute({
                dispute,
                moderatorId: currentUser.uid,
                decisionReason,
              });

              Alert.alert(
                "Dispute escalated",
                "The dispute has been escalated.",
              );
              onResolved();
            } catch (error) {
              Alert.alert("Escalation failed", error.message);
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InnerScreenHeader
          title="Dispute Detail"
          subtitle="Review submitted evidence and record a moderator decision."
          onBack={onBack}
        />

        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.titleArea}>
              <Text style={styles.listingTitle}>{dispute.listingTitle}</Text>
              <Text style={styles.categoryText}>
                Category: {dispute.category}
              </Text>
            </View>

            <StatusBadge status={dispute.status} />
          </View>
        </View>

        <DetailSection title="Case Information">
          <InfoRow label="Raised by" value={dispute.raisedByRole} />
          <InfoRow label="Booking ID" value={dispute.bookingId} />
          <InfoRow label="Listing ID" value={dispute.listingId} />
        </DetailSection>

        <DetailSection title="Dispute Description">
          <Text style={styles.bodyText}>{dispute.description}</Text>
        </DetailSection>

        <DetailSection title="Evidence Notes">
          <Text style={styles.bodyText}>{dispute.evidenceNotes}</Text>
        </DetailSection>

        {dispute.decisionReason ? (
          <DetailSection title="Previous Decision">
            <Text style={styles.bodyText}>{dispute.decisionReason}</Text>
          </DetailSection>
        ) : null}

        {isOpen ? (
          <View style={styles.decisionCard}>
            <Text style={styles.sectionTitle}>Moderator Decision</Text>
            <Text style={styles.sectionSubtitle}>
              Add a clear reason before closing or escalating the case.
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.multiline,
                errors.decisionReason && styles.fieldError,
              ]}
              value={decisionReason}
              onChangeText={(value) => {
                setDecisionReason(value);
                setErrors({});
              }}
              multiline
              placeholder="Write decision reason..."
            />

            {errors.decisionReason ? (
              <Text style={styles.errorText}>{errors.decisionReason}</Text>
            ) : null}

            <Pressable
              style={[styles.closeButton, updating && styles.disabledButton]}
              onPress={handleClose}
              disabled={updating}
            >
              <Text style={styles.closeButtonText}>
                {updating ? "Updating..." : "Close Dispute"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.escalateButton, updating && styles.disabledButton]}
              onPress={handleEscalate}
              disabled={updating}
            >
              <Text style={styles.escalateButtonText}>Escalate Case</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.closedBox}>
            <Text style={styles.closedTitle}>Case already resolved</Text>
            <Text style={styles.closedText}>
              This dispute has already been marked as {dispute.status}.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: 48,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  titleArea: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  bodyText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  infoValue: {
    marginTop: 3,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  decisionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 13,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  fieldError: {
    borderColor: colors.danger,
    borderWidth: 2,
    backgroundColor: "#fff5f5",
  },
  errorText: {
    marginTop: 7,
    fontSize: 12,
    color: colors.danger,
    fontWeight: "900",
    lineHeight: 18,
  },
  closeButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: radius.md,
  },
  closeButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },
  escalateButton: {
    marginTop: spacing.md,
    backgroundColor: colors.warningLight,
    padding: 15,
    borderRadius: radius.md,
  },
  escalateButtonText: {
    color: colors.warning,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.6,
  },
  closedBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  closedTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 5,
  },
  closedText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: "700",
  },
});
