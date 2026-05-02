import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ListingDetailsScreen({
  listing,
  onBack,
  onRequestBooking,
}) {
  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.location}>{listing.location}</Text>

      <View style={styles.priceBox}>
        <Text style={styles.price}>£{listing.nightlyRate}/night</Text>
        <Text style={styles.cleaningFee}>
          Cleaning fee: £{listing.cleaningFee}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.bodyText}>{listing.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <Text style={styles.bodyText}>
          Available from {listing.availableFrom} to {listing.availableTo}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guest Capacity</Text>
        <Text style={styles.bodyText}>
          Maximum guests allowed: {listing.maxGuests}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <Text style={styles.bodyText}>
          {listing.amenities?.length > 0
            ? listing.amenities.join(", ")
            : "No amenities listed."}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>House Rules</Text>
        <Text style={styles.bodyText}>
          {listing.houseRules || "No house rules provided."}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cancellation Policy</Text>
        <Text style={styles.bodyText}>
          {listing.cancellationPolicy || "No cancellation policy provided."}
        </Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={onRequestBooking}>
        <Text style={styles.primaryButtonText}>Request Booking</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Back to Listings</Text>
      </Pressable>
    </ScrollView>
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
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  location: {
    marginTop: 6,
    fontSize: 16,
    color: "#6b7280",
  },
  priceBox: {
    marginTop: 20,
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "#047857",
  },
  cleaningFee: {
    marginTop: 4,
    fontSize: 14,
    color: "#065f46",
    fontWeight: "600",
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 28,
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
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
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});
