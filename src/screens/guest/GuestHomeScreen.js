import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { logoutUser } from "../../services/authService";
import BookingRequestScreen from "./BookingRequestScreen";
import GuestBookingsScreen from "./GuestBookingsScreen";
import GuestBrowseScreen from "./GuestBrowseScreen";
import ListingDetailsScreen from "./ListingDetailsScreen";
import ReviewScreen from "./ReviewScreen";

export default function GuestHomeScreen() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  if (screen === "browse") {
    return (
      <GuestBrowseScreen
        onBack={() => setScreen("dashboard")}
        onSelectListing={(listing) => {
          setSelectedListing(listing);
          setScreen("details");
        }}
      />
    );
  }

  if (screen === "details" && selectedListing) {
    return (
      <ListingDetailsScreen
        listing={selectedListing}
        onBack={() => setScreen("browse")}
        onRequestBooking={() => setScreen("bookingRequest")}
      />
    );
  }

  if (screen === "bookingRequest" && selectedListing) {
    return (
      <BookingRequestScreen
        listing={selectedListing}
        onBack={() => setScreen("details")}
        onSubmitted={() => setScreen("bookings")}
      />
    );
  }

  if (screen === "bookings") {
    return (
      <GuestBookingsScreen
        onBack={() => setScreen("dashboard")}
        onLeaveReview={(booking) => {
          setSelectedBooking(booking);
          setScreen("review");
        }}
      />
    );
  }

  if (screen === "review" && selectedBooking) {
    return (
      <ReviewScreen
        booking={selectedBooking}
        onBack={() => setScreen("bookings")}
        onSubmitted={() => setScreen("bookings")}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Guest</Text>
      <Text style={styles.title}>Guest Dashboard</Text>
      <Text style={styles.description}>
        Browse available properties, view details, and submit booking requests.
      </Text>

      <Pressable style={styles.button} onPress={() => setScreen("browse")}>
        <Text style={styles.buttonText}>Browse Listings</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => setScreen("bookings")}
      >
        <Text style={styles.secondaryButtonText}>My Bookings</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={logoutUser}>
        <Text style={styles.secondaryButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    fontWeight: "700",
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 12,
    marginTop: 28,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 15,
    borderRadius: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
});
