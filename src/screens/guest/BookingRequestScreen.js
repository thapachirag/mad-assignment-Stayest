import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
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
import { createBookingRequest } from "../../services/bookingService";
import { colors, radius, spacing } from "../../theme/theme";
import { formatPrice } from "../../utils/currencyUtils";
import { isValidDateRange } from "../../utils/dateUtils";
import { calculateBookingPrice } from "../../utils/priceUtils";

function FormSection({ title, subtitle, children, onLayout }) {
  return (
    <View style={styles.sectionCard} onLayout={onLayout}>
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

function addDays(date, numberOfDays) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + numberOfDays);
  return nextDate;
}

export default function BookingRequestScreen({ listing, onBack, onSubmitted }) {
  const defaultCheckInDate = listing.availableFrom || "2026-05-20";
  const defaultCheckOutDate = formatDate(
    addDays(parseDateString(defaultCheckInDate), 1),
  );

  const [checkInDate, setCheckInDate] = useState(defaultCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOutDate);
  const [numberOfGuests, setNumberOfGuests] = useState("2");
  const [notes, setNotes] = useState("Arriving around 5 PM.");
  const [submitting, setSubmitting] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState(null);
  const [errors, setErrors] = useState({});

  const guestShakeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const sectionPositionsRef = useRef({
    dates: 0,
    guests: 0,
  });

  const availableFromDate = parseDateString(listing.availableFrom);
  const availableToDate = parseDateString(listing.availableTo);
  const currentCheckInDate = parseDateString(checkInDate);
  const currentCheckOutDate = parseDateString(checkOutDate);

  const minimumStayNights = Number(listing.minimumStayNights || 1);

  const priceBreakdown = useMemo(() => {
    if (!isValidDateRange(checkInDate, checkOutDate)) {
      return null;
    }

    return calculateBookingPrice({
      nightlyRate: listing.nightlyRate,
      cleaningFee: listing.cleaningFee,
      checkInDate,
      checkOutDate,
    });
  }, [listing, checkInDate, checkOutDate]);

  function scrollToSection(sectionName) {
    const yPosition = sectionPositionsRef.current[sectionName] || 0;

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(yPosition - 20, 0),
        animated: true,
      });
    }, 100);
  }

  function triggerGuestShake() {
    guestShakeAnim.setValue(0);

    Animated.sequence([
      Animated.timing(guestShakeAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(guestShakeAnim, {
        toValue: -1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(guestShakeAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(guestShakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function clearError(fieldName) {
    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };
      delete updatedErrors[fieldName];
      return updatedErrors;
    });
  }

  function getDateError(nextCheckInDate, nextCheckOutDate) {
    if (!nextCheckInDate || !nextCheckOutDate) {
      return "Please select check-in and check-out dates.";
    }

    if (!isValidDateRange(nextCheckInDate, nextCheckOutDate)) {
      return "Check-out date must be after check-in date.";
    }

    if (
      nextCheckInDate < listing.availableFrom ||
      nextCheckOutDate > listing.availableTo
    ) {
      return `This listing is available from ${listing.availableFrom} to ${listing.availableTo}.`;
    }

    const nextPriceBreakdown = calculateBookingPrice({
      nightlyRate: listing.nightlyRate,
      cleaningFee: listing.cleaningFee,
      checkInDate: nextCheckInDate,
      checkOutDate: nextCheckOutDate,
    });

    if (nextPriceBreakdown.nights < minimumStayNights) {
      return `This listing requires a minimum stay of ${minimumStayNights} night(s).`;
    }

    return null;
  }

  function setDateErrorIfNeeded(nextCheckInDate, nextCheckOutDate) {
    const dateError = getDateError(nextCheckInDate, nextCheckOutDate);

    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };

      if (dateError) {
        updatedErrors.dates = dateError;
      } else {
        delete updatedErrors.dates;
      }

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

    if (pickerType === "checkIn") {
      let nextCheckOutDate = checkOutDate;

      if (currentCheckOutDate <= selectedDate) {
        nextCheckOutDate = formatDate(addDays(selectedDate, 1));
        setCheckOutDate(nextCheckOutDate);
      }

      setCheckInDate(formattedDate);
      setDateErrorIfNeeded(formattedDate, nextCheckOutDate);
    }

    if (pickerType === "checkOut") {
      setCheckOutDate(formattedDate);
      setDateErrorIfNeeded(checkInDate, formattedDate);
    }
  }

  function validateGuestCount(value) {
    const cleanedValue = value.replace(/[^0-9]/g, "");
    setNumberOfGuests(cleanedValue);

    const numericValue = Number(cleanedValue);

    if (!cleanedValue) {
      clearError("numberOfGuests");
      return;
    }

    if (numericValue <= 0) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        numberOfGuests: "Please enter at least 1 guest.",
      }));
      triggerGuestShake();
      return;
    }

    if (numericValue > Number(listing.maxGuests)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        numberOfGuests: `Maximum allowed guests: ${listing.maxGuests}.`,
      }));
      triggerGuestShake();
      return;
    }

    clearError("numberOfGuests");
  }

  function validateForm() {
    const nextErrors = {};

    const dateError = getDateError(checkInDate, checkOutDate);

    if (dateError) {
      nextErrors.dates = dateError;
    }

    if (!numberOfGuests || Number(numberOfGuests) <= 0) {
      nextErrors.numberOfGuests = "Please enter a valid number of guests.";
    } else if (Number(numberOfGuests) > Number(listing.maxGuests)) {
      nextErrors.numberOfGuests = `Maximum allowed guests: ${listing.maxGuests}.`;
    }

    setErrors(nextErrors);

    if (nextErrors.dates) {
      scrollToSection("dates");
    } else if (nextErrors.numberOfGuests) {
      scrollToSection("guests");
    }

    if (nextErrors.numberOfGuests) {
      triggerGuestShake();
    }

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Not logged in", "Please login again.");
      return;
    }

    try {
      setSubmitting(true);

      await createBookingRequest({
        listing,
        guestId: currentUser.uid,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        notes,
      });

      Alert.alert(
        "Booking requested",
        "Your booking request has been sent to the host.",
      );

      onSubmitted();
    } catch (error) {
      Alert.alert("Booking failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InnerScreenHeader
          title="Request Booking"
          subtitle="Choose your stay dates, confirm guest count, and review the total price before sending the request."
          onBack={onBack}
        />

        <View style={styles.propertyCard}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>StayNest</Text>
          </View>

          <View style={styles.propertyContent}>
            <Text style={styles.propertyTitle}>{listing.title}</Text>
            <Text style={styles.propertyLocation}>{listing.location}</Text>

            <View style={styles.propertyMetaRow}>
              <Text style={styles.propertyMeta}>
                {formatPrice(listing.nightlyRate)}/night
              </Text>
              <Text style={styles.propertyMeta}>
                Max {listing.maxGuests} guests
              </Text>
              <Text style={styles.propertyMeta}>
                Min {minimumStayNights} night(s)
              </Text>
            </View>
          </View>
        </View>

        <FormSection
          title="Stay Dates"
          subtitle={`Available from ${listing.availableFrom} to ${listing.availableTo}`}
          onLayout={(event) => {
            sectionPositionsRef.current.dates = event.nativeEvent.layout.y;
          }}
        >
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <FieldLabel>Check-in</FieldLabel>
              <Pressable
                style={[styles.dateButton, errors.dates && styles.fieldError]}
                onPress={() => {
                  setActiveDatePicker("checkIn");
                }}
              >
                <Text style={styles.dateButtonText}>{checkInDate}</Text>
                <Text style={styles.dateButtonIcon}>📅</Text>
              </Pressable>
            </View>

            <View style={styles.column}>
              <FieldLabel>Check-out</FieldLabel>
              <Pressable
                style={[styles.dateButton, errors.dates && styles.fieldError]}
                onPress={() => {
                  setActiveDatePicker("checkOut");
                }}
              >
                <Text style={styles.dateButtonText}>{checkOutDate}</Text>
                <Text style={styles.dateButtonIcon}>📅</Text>
              </Pressable>
            </View>
          </View>

          {errors.dates ? (
            <Text style={styles.errorText}>{errors.dates}</Text>
          ) : (
            <Text style={styles.helperText}>
              Select dates from the calendar. This listing requires a minimum
              stay of {minimumStayNights} night(s).
            </Text>
          )}

          {activeDatePicker ? (
            <View style={styles.pickerBox}>
              <DateTimePicker
                value={
                  activeDatePicker === "checkIn"
                    ? currentCheckInDate
                    : parseDateString(checkOutDate)
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                themeVariant="light"
                textColor={colors.textPrimary}
                accentColor={colors.primary}
                style={styles.datePicker}
                minimumDate={
                  activeDatePicker === "checkIn"
                    ? availableFromDate
                    : addDays(currentCheckInDate, 1)
                }
                maximumDate={availableToDate}
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
          title="Guests"
          subtitle={`This property allows up to ${listing.maxGuests} guest(s).`}
          onLayout={(event) => {
            sectionPositionsRef.current.guests = event.nativeEvent.layout.y;
          }}
        >
          <FieldLabel>Number of Guests</FieldLabel>

          <Animated.View
            style={{
              transform: [
                {
                  translateX: guestShakeAnim.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [-8, 0, 8],
                  }),
                },
              ],
            }}
          >
            <TextInput
              style={[styles.input, errors.numberOfGuests && styles.fieldError]}
              value={numberOfGuests}
              onChangeText={validateGuestCount}
              keyboardType="number-pad"
              placeholder="2"
              placeholderTextColor={colors.textMuted}
            />
          </Animated.View>

          {errors.numberOfGuests ? (
            <Text style={styles.errorText}>{errors.numberOfGuests}</Text>
          ) : null}
        </FormSection>

        <FormSection
          title="Message to Host"
          subtitle="Add arrival time or any request the host should know."
        >
          <TextInput
            style={[styles.input, styles.multiline]}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Write optional note..."
            placeholderTextColor={colors.textMuted}
          />
        </FormSection>

        <FormSection title="Price Breakdown">
          {priceBreakdown ? (
            <View>
              <View style={styles.priceLine}>
                <Text style={styles.priceLabel}>
                  {formatPrice(listing.nightlyRate)} × {priceBreakdown.nights}{" "}
                  night(s)
                </Text>
                <Text style={styles.priceValue}>
                  {formatPrice(priceBreakdown.nightlyTotal)}
                </Text>
              </View>

              <View style={styles.priceLine}>
                <Text style={styles.priceLabel}>Cleaning fee</Text>
                <Text style={styles.priceValue}>
                  {formatPrice(priceBreakdown.cleaningFee)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatPrice(priceBreakdown.totalPrice)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.helperText}>
              Select valid dates to calculate the total price.
            </Text>
          )}
        </FormSection>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Booking status</Text>
          <Text style={styles.noticeText}>
            This will create a booking request with status “Requested”. The host
            can approve or decline it from their dashboard.
          </Text>
        </View>

        <Pressable
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Submitting..." : "Submit Booking Request"}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back to Details</Text>
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
  propertyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  propertyContent: {
    padding: spacing.lg,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  propertyLocation: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  propertyMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  propertyMeta: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "800",
    overflow: "hidden",
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
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  dateButtonIcon: {
    fontSize: 16,
  },
  pickerBox: {
    marginTop: spacing.md,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  datePicker: {
    backgroundColor: "#ffffff",
    width: "100%",
    height: Platform.OS === "ios" ? 180 : undefined,
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 13,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
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
    marginTop: 7,
    fontSize: 12,
    color: colors.danger,
    fontWeight: "900",
    lineHeight: 18,
  },
  priceLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  priceLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  priceValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 17,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  totalValue: {
    fontSize: 24,
    color: colors.success,
    fontWeight: "900",
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
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  submitButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.6,
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
});
