import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";
import DashboardCard from "../../components/DashboardCard";
import DashboardSummaryRow from "../../components/DashboardSummaryRow";
import ScreenContainer from "../../components/ScreenContainer";
import { getModeratorDashboardSummary } from "../../services/dashboardService";
import { colors, typography } from "../../theme/theme";

import AuditLogScreen from "./AuditLogScreen";
import DisputeDetailScreen from "./DisputeDetailScreen";
import DisputeListScreen from "./DisputeListScreen";

export default function ModeratorHomeScreen() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedDispute, setSelectedDispute] = useState(null);

  const [summary, setSummary] = useState({
    openDisputes: 0,
    escalatedDisputes: 0,
    auditLogs: 0,
  });

  const [summaryLoading, setSummaryLoading] = useState(true);

  async function loadDashboardSummary() {
    try {
      const result = await getModeratorDashboardSummary();
      setSummary(result);
    } catch (error) {
      console.log("Failed to load moderator dashboard summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardSummary();
  }, []);

  function refreshDashboard() {
    setSummaryLoading(true);
    loadDashboardSummary();
  }

  if (screen === "disputes") {
    return (
      <DisputeListScreen
        onBack={() => {
          refreshDashboard();
          setScreen("dashboard");
        }}
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
        onResolved={() => {
          refreshDashboard();
          setSelectedDispute(null);
          setScreen("disputes");
        }}
      />
    );
  }

  if (screen === "auditLogs") {
    return (
      <AuditLogScreen
        onBack={() => {
          refreshDashboard();
          setScreen("dashboard");
        }}
      />
    );
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

      <DashboardSummaryRow
        loading={summaryLoading}
        items={[
          {
            label: "Open",
            value: summary.openDisputes,
            helper: "Need review",
            accent: "danger",
          },
          {
            label: "Escalated",
            value: summary.escalatedDisputes,
            helper: "Further action",
            accent: "warning",
          },
          {
            label: "Audit Logs",
            value: summary.auditLogs,
            helper: "System actions",
            accent: "info",
          },
        ]}
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Governance Flow</Text>
        <Text style={styles.summaryText}>
          Dispute raised → Moderator review → Close or escalate → Audit log
          updated
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
