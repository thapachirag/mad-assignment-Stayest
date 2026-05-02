import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { logoutUser } from "../../services/authService";
import CreateListingScreen from "./CreateListingScreen";
import HostBookingRequestsScreen from "./HostBookingRequestsScreen";
import HostListingsScreen from "./HostListingsScreen";
import RaiseDisputeScreen from "./RaiseDisputeScreen";

export default function HostHomeScreen() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedBooking, setSelectedBooking] = useState(null);

  if (screen === "listings") {
    return (
      <HostListingsScreen
        onCreatePress={() => setScreen("createListing")}
        onBack={() => setScreen("dashboard")}
      />
    );
  }

  if (screen === "createListing") {
    return (
      <CreateListingScreen
        onSaved={() => setScreen("listings")}
        onCancel={() => setScreen("listings")}
      />
    );
  }

  if (screen === "bookingRequests") {
    return (
      <HostBookingRequestsScreen
        onBack={() => setScreen("dashboard")}
        onRaiseDispute={(booking) => {
          setSelectedBooking(booking);
          setScreen("raiseDispute");
        }}
      />
    );
  }

  if (screen === "raiseDispute" && selectedBooking) {
    return (
      <RaiseDisputeScreen
        booking={selectedBooking}
        onBack={() => setScreen("bookingRequests")}
        onSubmitted={() => setScreen("bookingRequests")}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Host</Text>
      <Text style={styles.title}>Host Dashboard</Text>
      <Text style={styles.description}>
        Create and manage property listings, then review guest booking requests.
      </Text>

      <Pressable style={styles.button} onPress={() => setScreen("listings")}>
        <Text style={styles.buttonText}>Manage Listings</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => setScreen("bookingRequests")}
      >
        <Text style={styles.secondaryButtonText}>Booking Requests</Text>
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
    backgroundColor: "#dcfce7",
    color: "#166534",
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
