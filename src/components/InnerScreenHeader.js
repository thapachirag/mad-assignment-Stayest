import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/theme";

export default function InnerScreenHeader({
  title,
  subtitle,
  onBack,
  rightLabel,
  onRightPress,
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        {rightLabel ? (
          <Pressable style={styles.rightButton} onPress={onRightPress}>
            <Text style={styles.rightButtonText}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>{title}</Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  rightButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  rightButtonText: {
    color: colors.info,
    fontWeight: "900",
    fontSize: 13,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
