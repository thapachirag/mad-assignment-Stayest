import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from "react-native";

import { auth } from "../../config/firebase";
import { createListing } from "../../services/listingService";

export default function CreateListingScreen({ onSaved, onCancel }) {
  const [title, setTitle] = useState("Modern Studio Apartment");
  const [location, setLocation] = useState("Northampton");
  const [description, setDescription] = useState(
    "A clean and comfortable studio apartment suitable for short stays.",
  );
  const [nightlyRate, setNightlyRate] = useState("75");
  const [cleaningFee, setCleaningFee] = useState("20");
  const [maxGuests, setMaxGuests] = useState("2");
  const [amenitiesText, setAmenitiesText] = useState("WiFi, Kitchen, Parking");
  const [houseRules, setHouseRules] = useState("No smoking. No parties.");
  const [cancellationPolicy, setCancellationPolicy] = useState("Flexible");
  const [availableFrom, setAvailableFrom] = useState("2026-05-10");
  const [availableTo, setAvailableTo] = useState("2026-06-30");
  const [saving, setSaving] = useState(false);

  function validateForm() {
    if (!title || !location || !description) {
      Alert.alert(
        "Missing details",
        "Please enter title, location, and description.",
      );
      return false;
    }

    if (!nightlyRate || Number(nightlyRate) <= 0) {
      Alert.alert("Invalid price", "Nightly rate must be greater than 0.");
      return false;
    }

    if (!cleaningFee || Number(cleaningFee) < 0) {
      Alert.alert("Invalid cleaning fee", "Cleaning fee cannot be negative.");
      return false;
    }

    if (!maxGuests || Number(maxGuests) <= 0) {
      Alert.alert(
        "Invalid guest capacity",
        "Maximum guests must be greater than 0.",
      );
      return false;
    }

    if (!availableFrom || !availableTo) {
      Alert.alert(
        "Missing availability",
        "Please enter available from and available to dates.",
      );
      return false;
    }

    if (availableFrom >= availableTo) {
      Alert.alert(
        "Invalid dates",
        "Available To date must be after Available From date.",
      );
      return false;
    }

    return true;
  }

  async function handleSave() {
    if (!validateForm()) {
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    const amenities = amenitiesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      setSaving(true);

      await createListing({
        hostId: currentUser.uid,
        listingData: {
          title,
          location,
          description,
          nightlyRate,
          cleaningFee,
          maxGuests,
          amenities,
          houseRules,
          cancellationPolicy,
          availableFrom,
          availableTo,
        },
      });

      Alert.alert("Listing created", "Your property listing has been saved.");
      onSaved();
    } catch (error) {
      Alert.alert("Save failed", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Listing</Text>
        <Text style={styles.subtitle}>
          Add the property information guests will see before requesting a
          booking.
        </Text>

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Nightly Rate (£)</Text>
        <TextInput
          style={styles.input}
          value={nightlyRate}
          onChangeText={setNightlyRate}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Cleaning Fee (£)</Text>
        <TextInput
          style={styles.input}
          value={cleaningFee}
          onChangeText={setCleaningFee}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Maximum Guests</Text>
        <TextInput
          style={styles.input}
          value={maxGuests}
          onChangeText={setMaxGuests}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Amenities</Text>
        <TextInput
          style={styles.input}
          value={amenitiesText}
          onChangeText={setAmenitiesText}
          placeholder="WiFi, Kitchen, Parking"
        />

        <Text style={styles.label}>House Rules</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={houseRules}
          onChangeText={setHouseRules}
          multiline
        />

        <Text style={styles.label}>Cancellation Policy</Text>
        <TextInput
          style={styles.input}
          value={cancellationPolicy}
          onChangeText={setCancellationPolicy}
        />

        <Text style={styles.label}>Available From</Text>
        <TextInput
          style={styles.input}
          value={availableFrom}
          onChangeText={setAvailableFrom}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Available To</Text>
        <TextInput
          style={styles.input}
          value={availableTo}
          onChangeText={setAvailableTo}
          placeholder="YYYY-MM-DD"
        />

        <Pressable
          style={[styles.primaryButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? "Saving..." : "Save Listing"}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onCancel}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 22,
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 21,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#ffffff",
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 15,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
