import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme/theme";

function getAccentStyles(accent) {
  if (accent === "success") {
    return {
      backgroundColor: colors.successLight || colors.surfaceMuted,
      valueColor: colors.success,
    };
  }

  if (accent === "danger") {
    return {
      backgroundColor: colors.dangerLight || colors.surfaceMuted,
      valueColor: colors.danger,
    };
  }

  if (accent === "warning") {
    return {
      backgroundColor: colors.warningLight || colors.surfaceMuted,
      valueColor: colors.warning,
    };
  }

  return {
    backgroundColor: colors.infoLight || colors.surfaceMuted,
    valueColor: colors.info,
  };
}

function SummaryCard({ label, value, helper, accent = "info", loading }) {
  const accentStyle = getAccentStyles(accent);

  return (
    <View
      style={[styles.card, { backgroundColor: accentStyle.backgroundColor }]}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text style={[styles.value, { color: accentStyle.valueColor }]}>
          {value}
        </Text>
      )}

      <Text style={styles.label}>{label}</Text>

      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

export default function DashboardSummaryRow({ items, loading = false }) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <SummaryCard
          key={item.label}
          label={item.label}
          value={item.value}
          helper={item.helper}
          accent={item.accent}
          loading={loading}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 92,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: {
    fontSize: 26,
    fontWeight: "900",
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  helper: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "700",
  },
});
