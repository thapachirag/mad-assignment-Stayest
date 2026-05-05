import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme/theme";

const FLOW_STEPS = ["requested", "approved", "completed"];

function getStepLabel(step) {
  const labels = {
    requested: "Requested",
    approved: "Approved",
    completed: "Completed",
  };

  return labels[step] || step;
}

function getStepState(step, status) {
  if (status === "declined") {
    if (step === "requested") return "done";
    if (step === "approved") return "failed";
    return "pending";
  }

  if (status === "disputed") {
    return "done";
  }

  const currentIndex = FLOW_STEPS.indexOf(status);
  const stepIndex = FLOW_STEPS.indexOf(step);

  if (currentIndex === -1) {
    return step === "requested" ? "done" : "pending";
  }

  if (stepIndex <= currentIndex) return "done";

  return "pending";
}

export default function BookingTimeline({ status }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Progress</Text>

      <View style={styles.stepsRow}>
        {FLOW_STEPS.map((step, index) => {
          const state = getStepState(step, status);

          return (
            <React.Fragment key={step}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    state === "done" && styles.doneCircle,
                    state === "failed" && styles.failedCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      state === "done" && styles.doneCircleText,
                      state === "failed" && styles.doneCircleText,
                    ]}
                  >
                    {state === "done"
                      ? "✓"
                      : state === "failed"
                        ? "!"
                        : index + 1}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.stepLabel,
                    state === "done" && styles.doneLabel,
                    state === "failed" && styles.failedLabel,
                  ]}
                >
                  {getStepLabel(step)}
                </Text>
              </View>

              {index < FLOW_STEPS.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    state === "done" && styles.doneLine,
                    status === "disputed" && styles.doneLine,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>

      {status === "declined" ? (
        <Text style={styles.warningText}>
          This request was declined by the host.
        </Text>
      ) : null}

      {status === "disputed" ? (
        <Text style={styles.warningText}>
          This booking is currently under dispute review.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepItem: {
    alignItems: "center",
    width: 70,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  doneCircle: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  failedCircle: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  circleText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textSecondary,
  },
  doneCircleText: {
    color: colors.primaryText,
  },
  stepLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
    textAlign: "center",
  },
  doneLabel: {
    color: colors.success,
  },
  failedLabel: {
    color: colors.danger,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginTop: 14,
  },
  doneLine: {
    backgroundColor: colors.success,
  },
  warningText: {
    marginTop: spacing.md,
    fontSize: 13,
    fontWeight: "700",
    color: colors.warning,
  },
});
