import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { auth } from "../config/firebase";
import { getUserProfile, logoutUser } from "../services/authService";
import { colors, radius, spacing } from "../theme/theme";

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return "U";

  const cleaned = nameOrEmail.trim();

  if (cleaned.includes("@")) {
    return cleaned.charAt(0).toUpperCase();
  }

  const parts = cleaned.split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function getRoleColors(role) {
  if (role === "host") {
    return {
      backgroundColor: colors.successLight,
      color: colors.success,
      label: "Host",
    };
  }

  if (role === "moderator") {
    return {
      backgroundColor: colors.dangerLight,
      color: colors.danger,
      label: "Moderator",
    };
  }

  return {
    backgroundColor: colors.infoLight,
    color: colors.info,
    label: "Guest",
  };
}

export default function AppHeader() {
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      const result = await getUserProfile(currentUser.uid);
      setProfile(result);
    }

    loadProfile();
  }, []);

  const currentUser = auth.currentUser;
  const displayName = profile?.fullName || currentUser?.email || "User";
  const email = profile?.email || currentUser?.email || "";
  const role = profile?.role || "guest";
  const initials = getInitials(displayName);
  const roleStyle = getRoleColors(role);

  async function handleLogout() {
    setMenuOpen(false);
    await logoutUser();
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.leftSide}>
        <Text style={styles.appName}>StayNest</Text>
        <Text style={styles.subtitle}>Short-term stays made simple</Text>
      </View>

      <View style={styles.profileArea}>
        <Pressable
          style={styles.profileButton}
          onPress={() => setMenuOpen((value) => !value)}
        >
          <Text style={styles.profileInitials}>{initials}</Text>
        </Pressable>

        {menuOpen ? (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownLabel}>Signed in as</Text>
            <Text style={styles.dropdownName}>{displayName}</Text>
            <Text style={styles.dropdownEmail}>{email}</Text>

            <Text
              style={[
                styles.roleBadge,
                {
                  backgroundColor: roleStyle.backgroundColor,
                  color: roleStyle.color,
                },
              ]}
            >
              {roleStyle.label}
            </Text>

            <View style={styles.divider} />

            <Pressable style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>Profile</Text>
              <Text style={styles.dropdownItemSubtext}>
                View account details
              </Text>
            </Pressable>

            <Pressable style={styles.logoutItem} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSide: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  profileArea: {
    position: "relative",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitials: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "900",
  },
  dropdown: {
    position: "absolute",
    top: 54,
    right: 0,
    width: 240,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    zIndex: 99,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  dropdownLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dropdownName: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  dropdownEmail: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },
  roleBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  dropdownItemSubtext: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  logoutItem: {
    marginTop: 10,
    backgroundColor: colors.dangerLight,
    padding: 12,
    borderRadius: radius.md,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
});
