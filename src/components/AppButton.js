import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../theme/theme";

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}) {
  const buttonStyle = [
    styles.button,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "danger" && styles.danger,
    variant === "success" && styles.success,
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    variant === "secondary" && styles.secondaryText,
    variant === "danger" && styles.dangerText,
  ];

  return (
    <Pressable style={buttonStyle} onPress={onPress} disabled={disabled}>
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: radius.md,
    marginTop: 12,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.dangerLight,
  },
  success: {
    backgroundColor: colors.success,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.danger,
  },
});
