import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/theme";

export default function DashboardCard({
  title,
  description,
  meta,
  onPress,
  accent = "info",
}) {
  const accentColor =
    accent === "success"
      ? colors.success
      : accent === "danger"
        ? colors.danger
        : accent === "warning"
          ? colors.warning
          : colors.info;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>

      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginTop: spacing.md,
    overflow: "hidden",
  },
  accentBar: {
    width: 6,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  description: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "700",
  },
  arrow: {
    paddingRight: spacing.lg,
    fontSize: 26,
    color: colors.textMuted,
    fontWeight: "700",
  },
});
