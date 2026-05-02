import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import ListingCard from "../../components/ListingCard";
import { getAllActiveListings } from "../../services/listingService";

export default function GuestBrowseScreen({ onBack, onSelectListing }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [maxPrice, setMaxPrice] = useState("");
  const [guestCapacity, setGuestCapacity] = useState("");

  async function loadListings() {
    try {
      const results = await getAllActiveListings();
      setListings(results);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  }

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const priceMatch =
        !maxPrice || Number(listing.nightlyRate) <= Number(maxPrice);

      const guestMatch =
        !guestCapacity || Number(listing.maxGuests) >= Number(guestCapacity);

      return priceMatch && guestMatch;
    });
  }, [listings, maxPrice, guestCapacity]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading available properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse Listings</Text>
      <Text style={styles.subtitle}>
        Search available properties and filter by price or guest capacity.
      </Text>

      <View style={styles.filterBox}>
        <Text style={styles.filterTitle}>Filters</Text>

        <TextInput
          style={styles.input}
          placeholder="Maximum nightly price e.g. 100"
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
        />

        <TextInput
          style={styles.input}
          placeholder="Number of guests e.g. 2"
          keyboardType="numeric"
          value={guestCapacity}
          onChangeText={setGuestCapacity}
        />

        <Pressable
          style={styles.clearButton}
          onPress={() => {
            setMaxPrice("");
            setGuestCapacity("");
          }}
        >
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No matching listings</Text>
            <Text style={styles.emptyText}>
              Try clearing the filters or ask a host to create a property
              listing.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => onSelectListing(item)} />
        )}
      />

      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 21,
  },
  filterBox: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  clearButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 12,
  },
  clearButtonText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#111827",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  backButtonText: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "700",
  },
});
