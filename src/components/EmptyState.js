import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/theme";

export default function EmptyState({ title, message }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
