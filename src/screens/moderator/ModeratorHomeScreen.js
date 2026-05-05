import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../../theme/theme";

import AppHeader from "../../components/AppHeader";
import DashboardCard from "../../components/DashboardCard";
import ScreenContainer from "../../components/ScreenContainer";

import AuditLogScreen from "./AuditLogScreen";
import DisputeDetailScreen from "./DisputeDetailScreen";
import DisputeListScreen from "./DisputeListScreen";

export default function ModeratorHomeScreen() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedDispute, setSelectedDispute] = useState(null);

  if (screen === "disputes") {
    return (
      <DisputeListScreen
        onBack={() => setScreen("dashboard")}
        onSelectDispute={(dispute) => {
          setSelectedDispute(dispute);
          setScreen("disputeDetail");
        }}
      />
    );
  }

  if (screen === "disputeDetail" && selectedDispute) {
    return (
      <DisputeDetailScreen
        dispute={selectedDispute}
        onBack={() => setScreen("disputes")}
        onResolved={() => setScreen("disputes")}
      />
    );
  }

  if (screen === "auditLogs") {
    return <AuditLogScreen onBack={() => setScreen("dashboard")} />;
  }

  return (
    <ScreenContainer scroll>
      <AppHeader />

      <View style={styles.header}>
        <Text style={styles.title}>Review platform activity</Text>
        <Text style={styles.subtitle}>
          Handle disputed bookings, record decisions, escalate serious cases,
          and inspect the system audit trail.
        </Text>
      </View>

      <DashboardCard
        title="Review Disputes"
        description="Open dispute cases, review evidence notes, and decide whether to close or escalate the case."
        meta="Moderator case handling"
        accent="danger"
        onPress={() => setScreen("disputes")}
      />

      <DashboardCard
        title="Audit Logs"
        description="View important system actions such as requests, approvals, reviews, and dispute decisions."
        meta="Governance and traceability"
        accent="info"
        onPress={() => setScreen("auditLogs")}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.dangerLight,
    color: colors.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    fontWeight: "900",
    marginBottom: 14,
    overflow: "hidden",
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
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
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
  },
});
