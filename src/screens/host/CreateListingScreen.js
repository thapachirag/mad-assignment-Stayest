import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import InnerScreenHeader from "../../components/InnerScreenHeader";
import { auth } from "../../config/firebase";
import {
  createListing,
  deleteListing,
  updateListing,
} from "../../services/listingService";
import { colors, radius, spacing } from "../../theme/theme";

function FormSection({ title, subtitle, children }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function FieldLabel({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateString(dateString) {
  if (!dateString) {
    return new Date();
  }

  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export default function CreateListingScreen({
  onSaved,
  onCancel,
  onDeleted,
  initialListing = null,
}) {
  const isEditing = Boolean(initialListing?.id);

  const today = useMemo(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  }, []);

  const defaultFrom = formatDate(today);
  const defaultTo = formatDate(addDays(today, 30));

  const [title, setTitle] = useState(
    initialListing?.title || "Modern Studio Apartment",
  );

  const [location, setLocation] = useState(
    initialListing?.location || "Northampton",
  );

  const [description, setDescription] = useState(
    initialListing?.description ||
      "A clean and comfortable studio apartment suitable for short stays.",
  );

  const [nightlyRate, setNightlyRate] = useState(
    initialListing?.nightlyRate ? String(initialListing.nightlyRate) : "3500",
  );

  const [cleaningFee, setCleaningFee] = useState(
    initialListing?.cleaningFee ? String(initialListing.cleaningFee) : "500",
  );

  const [maxGuests, setMaxGuests] = useState(
    initialListing?.maxGuests ? String(initialListing.maxGuests) : "2",
  );

  const [amenitiesText, setAmenitiesText] = useState(
    initialListing?.amenities?.length
      ? initialListing.amenities.join(", ")
      : "WiFi, Kitchen, Parking",
  );

  const [houseRules, setHouseRules] = useState(
    initialListing?.houseRules || "No smoking. No parties.",
  );

  const [cancellationPolicy, setCancellationPolicy] = useState(
    initialListing?.cancellationPolicy || "Flexible",
  );

  const [availableFrom, setAvailableFrom] = useState(
    initialListing?.availableFrom || defaultFrom,
  );

  const [availableTo, setAvailableTo] = useState(
    initialListing?.availableTo || defaultTo,
  );

  const [errors, setErrors] = useState({});
  const [activeDatePicker, setActiveDatePicker] = useState(null);
  const [saving, setSaving] = useState(false);

  const availableFromDate = parseDateString(availableFrom);
  const availableToDate = parseDateString(availableTo);

  function clearError(fieldName) {
    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };
      delete updatedErrors[fieldName];
      return updatedErrors;
    });
  }

  function handleDateChange(event, selectedDate) {
    const pickerType = activeDatePicker;

    if (Platform.OS === "android") {
      setActiveDatePicker(null);
    }

    if (!selectedDate || !pickerType) {
      return;
    }

    const formattedDate = formatDate(selectedDate);

    if (pickerType === "availableFrom") {
      setAvailableFrom(formattedDate);

      const existingAvailableToDate = parseDateString(availableTo);

      if (existingAvailableToDate <= selectedDate) {
        setAvailableTo(formatDate(addDays(selectedDate, 1)));
      }

      clearError("dates");
    }

    if (pickerType === "availableTo") {
      setAvailableTo(formattedDate);
      clearError("dates");
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Property title is required.";
    }

    if (!location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!nightlyRate || Number(nightlyRate) <= 0) {
      nextErrors.nightlyRate = "Nightly rate must be greater than 0.";
    }

    if (!cleaningFee || Number(cleaningFee) < 0) {
      nextErrors.cleaningFee = "Cleaning fee cannot be negative.";
    }

    if (!maxGuests || Number(maxGuests) <= 0) {
      nextErrors.maxGuests = "Maximum guests must be greater than 0.";
    }

    if (availableFrom >= availableTo) {
      nextErrors.dates = "Available To date must be after Available From date.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
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

    const listingPayload = {
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
      nightlyRate: Number(nightlyRate),
      cleaningFee: Number(cleaningFee),
      maxGuests: Number(maxGuests),
      amenities,
      houseRules: houseRules.trim(),
      cancellationPolicy: cancellationPolicy.trim(),
      availableFrom,
      availableTo,
      isActive: true,
    };

    try {
      setSaving(true);

      if (isEditing) {
        await updateListing(initialListing.id, listingPayload);

        Alert.alert(
          "Listing updated",
          "Your property listing has been updated.",
        );
      } else {
        await createListing({
          hostId: currentUser.uid,
          listingData: listingPayload,
        });

        Alert.alert("Listing created", "Your property listing has been saved.");
      }

      onSaved();
    } catch (error) {
      Alert.alert(isEditing ? "Update failed" : "Save failed", error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteListing() {
    if (!isEditing) {
      return;
    }

    Alert.alert(
      "Delete Listing",
      `Are you sure you want to delete "${initialListing.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);

              await deleteListing(initialListing.id);

              Alert.alert("Listing deleted", "The listing has been removed.");

              if (onDeleted) {
                onDeleted();
              } else {
                onSaved();
              }
            } catch (error) {
              Alert.alert("Delete failed", error.message);
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InnerScreenHeader
          title={isEditing ? "Edit Listing" : "Create Listing"}
          subtitle={
            isEditing
              ? "Update property details, pricing, amenities, rules, and availability."
              : "Add property details, pricing, amenities, rules, and availability."
          }
          onBack={onCancel}
        />

        <FormSection
          title="Basic Information"
          subtitle="This information helps guests understand your property."
        >
          <FieldLabel>Property Title</FieldLabel>
          <TextInput
            style={[styles.input, errors.title && styles.fieldError]}
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              clearError("title");
            }}
            placeholder="Modern Studio Apartment"
          />
          {errors.title ? (
            <Text style={styles.errorText}>{errors.title}</Text>
          ) : null}

          <FieldLabel>Location</FieldLabel>
          <TextInput
            style={[styles.input, errors.location && styles.fieldError]}
            value={location}
            onChangeText={(value) => {
              setLocation(value);
              clearError("location");
            }}
            placeholder="Northampton"
          />
          {errors.location ? (
            <Text style={styles.errorText}>{errors.location}</Text>
          ) : null}

          <FieldLabel>Description</FieldLabel>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              errors.description && styles.fieldError,
            ]}
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              clearError("description");
            }}
            multiline
            placeholder="Describe the property..."
          />
          {errors.description ? (
            <Text style={styles.errorText}>{errors.description}</Text>
          ) : null}
        </FormSection>

        <FormSection
          title="Pricing and Capacity"
          subtitle="Set your nightly price, cleaning fee, and guest capacity."
        >
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <FieldLabel>Nightly Rate (NPR)</FieldLabel>
              <TextInput
                style={[styles.input, errors.nightlyRate && styles.fieldError]}
                value={nightlyRate}
                onChangeText={(value) => {
                  setNightlyRate(value.replace(/[^0-9]/g, ""));
                  clearError("nightlyRate");
                }}
                keyboardType="number-pad"
              />
              {errors.nightlyRate ? (
                <Text style={styles.errorText}>{errors.nightlyRate}</Text>
              ) : null}
            </View>

            <View style={styles.column}>
              <FieldLabel>Cleaning Fee (NPR)</FieldLabel>
              <TextInput
                style={[styles.input, errors.cleaningFee && styles.fieldError]}
                value={cleaningFee}
                onChangeText={(value) => {
                  setCleaningFee(value.replace(/[^0-9]/g, ""));
                  clearError("cleaningFee");
                }}
                keyboardType="number-pad"
              />
              {errors.cleaningFee ? (
                <Text style={styles.errorText}>{errors.cleaningFee}</Text>
              ) : null}
            </View>
          </View>

          <FieldLabel>Maximum Guests</FieldLabel>
          <TextInput
            style={[styles.input, errors.maxGuests && styles.fieldError]}
            value={maxGuests}
            onChangeText={(value) => {
              setMaxGuests(value.replace(/[^0-9]/g, ""));
              clearError("maxGuests");
            }}
            keyboardType="number-pad"
          />
          {errors.maxGuests ? (
            <Text style={styles.errorText}>{errors.maxGuests}</Text>
          ) : null}
        </FormSection>

        <FormSection
          title="Availability"
          subtitle="Choose when this property can be booked."
        >
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <FieldLabel>Available From</FieldLabel>
              <Pressable
                style={[styles.dateButton, errors.dates && styles.fieldError]}
                onPress={() => {
                  clearError("dates");
                  setActiveDatePicker("availableFrom");
                }}
              >
                <Text style={styles.dateButtonText}>{availableFrom}</Text>
                <Text>📅</Text>
              </Pressable>
            </View>

            <View style={styles.column}>
              <FieldLabel>Available To</FieldLabel>
              <Pressable
                style={[styles.dateButton, errors.dates && styles.fieldError]}
                onPress={() => {
                  clearError("dates");
                  setActiveDatePicker("availableTo");
                }}
              >
                <Text style={styles.dateButtonText}>{availableTo}</Text>
                <Text>📅</Text>
              </Pressable>
            </View>
          </View>

          {errors.dates ? (
            <Text style={styles.errorText}>{errors.dates}</Text>
          ) : (
            <Text style={styles.helperText}>
              The end date must be after the start date.
            </Text>
          )}

          {activeDatePicker ? (
            <View style={styles.pickerBox}>
              <DateTimePicker
                value={
                  activeDatePicker === "availableFrom"
                    ? availableFromDate
                    : availableToDate
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                themeVariant="light"
                textColor={colors.textPrimary}
                accentColor={colors.primary}
                style={styles.datePicker}
                minimumDate={
                  activeDatePicker === "availableFrom"
                    ? today
                    : addDays(availableFromDate, 1)
                }
                onChange={handleDateChange}
              />

              {Platform.OS === "ios" ? (
                <Pressable
                  style={styles.doneButton}
                  onPress={() => setActiveDatePicker(null)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </FormSection>

        <FormSection
          title="Amenities and Rules"
          subtitle="Use comma-separated amenities so they display as chips in the guest view."
        >
          <FieldLabel>Amenities</FieldLabel>
          <TextInput
            style={styles.input}
            value={amenitiesText}
            onChangeText={setAmenitiesText}
            placeholder="WiFi, Kitchen, Parking"
          />

          <FieldLabel>House Rules</FieldLabel>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={houseRules}
            onChangeText={setHouseRules}
            multiline
          />

          <FieldLabel>Cancellation Policy</FieldLabel>
          <TextInput
            style={styles.input}
            value={cancellationPolicy}
            onChangeText={setCancellationPolicy}
          />
        </FormSection>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>
            {isEditing ? "Listing update" : "Listing visibility"}
          </Text>
          <Text style={styles.noticeText}>
            {isEditing
              ? "Your changes will update this listing for guests immediately."
              : "This listing will become active immediately and visible to guests in browse and featured listing sections."}
          </Text>
        </View>

        <Pressable
          style={[styles.primaryButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving
              ? "Saving..."
              : isEditing
                ? "Update Listing"
                : "Save Listing"}
          </Text>
        </Pressable>

        {isEditing ? (
          <Pressable
            style={[styles.deleteButton, saving && styles.disabledButton]}
            onPress={handleDeleteListing}
            disabled={saving}
          >
            <Text style={styles.deleteButtonText}>Delete Listing</Text>
          </Pressable>
        ) : null}

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
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: 48,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    marginTop: 4,
    marginBottom: spacing.md,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  label: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 13,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 13,
    backgroundColor: colors.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  pickerBox: {
    marginTop: spacing.md,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
  },
  datePicker: {
    backgroundColor: "#ffffff",
    width: "100%",
    alignSelf: "stretch",
  },
  doneButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  doneButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "900",
  },
  helperText: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  fieldError: {
    borderColor: colors.danger,
    borderWidth: 2,
    backgroundColor: "#fff5f5",
  },
  errorText: {
    marginTop: 4,
    marginBottom: spacing.sm,
    fontSize: 12,
    color: colors.danger,
    fontWeight: "900",
    lineHeight: 18,
  },
  noticeBox: {
    backgroundColor: colors.infoLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.info,
    marginBottom: 5,
  },
  noticeText: {
    fontSize: 13,
    color: colors.info,
    lineHeight: 19,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },
  deleteButton: {
    backgroundColor: colors.dangerLight,
    padding: 15,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  deleteButtonText: {
    color: colors.danger,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
