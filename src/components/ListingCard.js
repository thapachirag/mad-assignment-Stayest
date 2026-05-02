import { StyleSheet, Text, View } from "react-native";

export default function ListingCard({ listing }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>£{listing.nightlyRate}/night</Text>
      </View>

      <Text style={styles.location}>{listing.location}</Text>

      <Text style={styles.description} numberOfLines={2}>
        {listing.description}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Max guests: {listing.maxGuests}</Text>
        <Text style={styles.metaText}>Cleaning: £{listing.cleaningFee}</Text>
      </View>

      <Text style={styles.availability}>
        Available: {listing.availableFrom} to {listing.availableTo}
      </Text>

      {listing.amenities?.length > 0 ? (
        <Text style={styles.amenities}>
          Amenities: {listing.amenities.join(", ")}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#047857",
  },
  location: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metaText: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "600",
  },
  availability: {
    marginTop: 10,
    fontSize: 13,
    color: "#1d4ed8",
    fontWeight: "600",
  },
  amenities: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
  },
});
