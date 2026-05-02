import { useMemo, useState } from "react";
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

import { auth } from "../../config/firebase";
import { createBookingRequest } from "../../services/bookingService";
import { isValidDateRange } from "../../utils/dateUtils";
import { calculateBookingPrice } from "../../utils/priceUtils";

export default function BookingRequestScreen({ listing, onBack, onSubmitted }) {
  const [checkInDate, setCheckInDate] = useState("2026-05-20");
  const [checkOutDate, setCheckOutDate] = useState("2026-05-23");
  const [numberOfGuests, setNumberOfGuests] = useState("2");
  const [notes, setNotes] = useState("Arriving around 5 PM.");
  const [submitting, setSubmitting] = useState(false);

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

  function validateForm() {
    if (!checkInDate || !checkOutDate) {
      Alert.alert(
        "Missing dates",
        "Please enter check-in and check-out dates.",
      );
      return false;
    }

    if (!isValidDateRange(checkInDate, checkOutDate)) {
      Alert.alert(
        "Invalid dates",
        "Check-out date must be after check-in date.",
      );
      return false;
    }

    if (
      checkInDate < listing.availableFrom ||
      checkOutDate > listing.availableTo
    ) {
      Alert.alert(
        "Outside availability",
        `This listing is available from ${listing.availableFrom} to ${listing.availableTo}.`,
      );
      return false;
    }

    if (!numberOfGuests || Number(numberOfGuests) <= 0) {
      Alert.alert("Invalid guests", "Please enter a valid number of guests.");
      return false;
    }

    if (Number(numberOfGuests) > Number(listing.maxGuests)) {
      Alert.alert(
        "Guest limit exceeded",
        `This listing allows a maximum of ${listing.maxGuests} guest(s).`,
      );
      return false;
    }

    return true;
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Request Booking</Text>
        <Text style={styles.subtitle}>{listing.title}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Available: {listing.availableFrom} to {listing.availableTo}
          </Text>
          <Text style={styles.infoText}>Max guests: {listing.maxGuests}</Text>
        </View>

        <Text style={styles.label}>Check-in Date</Text>
        <TextInput
          style={styles.input}
          value={checkInDate}
          onChangeText={setCheckInDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Check-out Date</Text>
        <TextInput
          style={styles.input}
          value={checkOutDate}
          onChangeText={setCheckOutDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Number of Guests</Text>
        <TextInput
          style={styles.input}
          value={numberOfGuests}
          onChangeText={setNumberOfGuests}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Optional Notes to Host</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={styles.priceBox}>
          <Text style={styles.priceTitle}>Price Breakdown</Text>

          {priceBreakdown ? (
            <>
              <Text style={styles.priceLine}>
                £{listing.nightlyRate} × {priceBreakdown.nights} night(s): £
                {priceBreakdown.nightlyTotal}
              </Text>
              <Text style={styles.priceLine}>
                Cleaning fee: £{priceBreakdown.cleaningFee}
              </Text>
              <Text style={styles.totalPrice}>
                Total: £{priceBreakdown.totalPrice}
              </Text>
            </>
          ) : (
            <Text style={styles.priceLine}>
              Enter valid dates to calculate total price.
            </Text>
          )}
        </View>

        <Pressable
          style={[styles.primaryButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
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
    marginBottom: 18,
    fontSize: 16,
    color: "#6b7280",
  },
  infoBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 4,
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
  priceBox: {
    marginTop: 20,
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 16,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#064e3b",
    marginBottom: 8,
  },
  priceLine: {
    fontSize: 15,
    color: "#065f46",
    marginBottom: 4,
  },
  totalPrice: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "800",
    color: "#047857",
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
