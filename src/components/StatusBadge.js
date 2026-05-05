import { StyleSheet, Text } from "react-native";
import { colors } from "../theme/theme";

function getStatusStyle(status) {
  switch (status) {
    case "requested":
      return {
        backgroundColor: colors.infoLight,
        color: colors.info,
      };
    case "approved":
    case "completed":
    case "closed":
      return {
        backgroundColor: colors.successLight,
        color: colors.success,
      };
    case "declined":
    case "disputed":
      return {
        backgroundColor: colors.dangerLight,
        color: colors.danger,
      };
    case "escalated":
      return {
        backgroundColor: colors.warningLight,
        color: colors.warning,
      };
    default:
      return {
        backgroundColor: colors.surfaceMuted,
        color: colors.textSecondary,
      };
  }
}

export default function StatusBadge({ status }) {
  const style = getStatusStyle(status);

  return (
    <Text
      style={[
        styles.badge,
        {
          backgroundColor: style.backgroundColor,
          color: style.color,
        },
      ]}
    >
      {String(status).toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
  },
});
