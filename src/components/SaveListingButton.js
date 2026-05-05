import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

import { auth } from "../config/firebase";
import {
    isListingSaved,
    toggleSavedListing,
} from "../services/savedListingService";
import { colors } from "../theme/theme";

export default function SaveListingButton({ listing }) {
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function loadSavedState() {
    const currentUser = auth.currentUser;

    if (!currentUser || !listing?.id) {
      setChecking(false);
      return;
    }

    try {
      const result = await isListingSaved({
        guestId: currentUser.uid,
        listingId: listing.id,
      });

      setSaved(result);
    } catch (error) {
      console.log("Failed to check saved listing:", error);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    setChecking(true);
    loadSavedState();
  }, [listing?.id]);

  async function handleToggleSaved() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    try {
      setUpdating(true);

      const nextSavedState = await toggleSavedListing({
        guestId: currentUser.uid,
        listing,
      });

      setSaved(nextSavedState);
    } catch (error) {
      Alert.alert("Save failed", error.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Pressable
      style={[styles.iconButton, saved && styles.savedIconButton]}
      onPress={handleToggleSaved}
      disabled={checking || updating}
      accessibilityRole="button"
      accessibilityLabel={saved ? "Remove saved listing" : "Save listing"}
    >
      {checking || updating ? (
        <ActivityIndicator size="small" />
      ) : (
        <Ionicons
          name={saved ? "bookmark" : "bookmark-outline"}
          size={24}
          color={saved ? colors.info : colors.textPrimary}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },
  savedIconButton: {
    backgroundColor: colors.infoLight,
    borderColor: colors.info,
  },
});
