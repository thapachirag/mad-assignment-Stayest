import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import ListingCard from "../../components/ListingCard";
import { auth } from "../../config/firebase";
import { getListingsByHost } from "../../services/listingService";

export default function HostListingsScreen({ onCreatePress, onBack }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadListings() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setListings([]);
      setLoading(false);
      return;
    }

    const hostListings = await getListingsByHost(currentUser.uid);
    setListings(hostListings);
    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, []),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Listings</Text>
      <Text style={styles.subtitle}>
        Manage the properties you have created as a host.
      </Text>

      <Pressable style={styles.primaryButton} onPress={onCreatePress}>
        <Text style={styles.primaryButtonText}>Create New Listing</Text>
      </Pressable>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>
              Create your first property listing so guests can browse and
              request bookings.
            </Text>
          </View>
        }
        renderItem={({ item }) => <ListingCard listing={item} />}
      />

      <Pressable style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
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
  primaryButton: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  secondaryButtonText: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "700",
  },
});
