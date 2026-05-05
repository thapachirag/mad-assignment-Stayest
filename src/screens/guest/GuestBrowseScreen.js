import Slider from "@react-native-community/slider";
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

import EmptyState from "../../components/EmptyState";
import InnerScreenHeader from "../../components/InnerScreenHeader";
import ListingCard from "../../components/ListingCard";
import { getAllActiveListings } from "../../services/listingService";
import { colors, radius, spacing } from "../../theme/theme";
import { formatPrice, PRICE_STEP } from "../../utils/currencyUtils";

const SORT_OPTIONS = [
  {
    label: "Recommended",
    value: "recommended",
  },
  {
    label: "Price: Low to High",
    value: "priceLowHigh",
  },
  {
    label: "Price: High to Low",
    value: "priceHighLow",
  },
  {
    label: "Guest Capacity",
    value: "guestCapacity",
  },
  {
    label: "Recently Added",
    value: "recentlyAdded",
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCreatedAtMillis(listing) {
  if (!listing.createdAt) return 0;

  if (typeof listing.createdAt.toMillis === "function") {
    return listing.createdAt.toMillis();
  }

  if (listing.createdAt.seconds) {
    return listing.createdAt.seconds * 1000;
  }

  return 0;
}

function PriceRangeSliders({
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}) {
  const isSinglePrice = max <= min;

  if (isSinglePrice) {
    return (
      <View style={styles.sliderWrapper}>
        <Text style={styles.singlePriceText}>
          Only {formatPrice(min)} per night
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.sliderWrapper}>
      <View style={styles.sliderHeaderRow}>
        <Text style={styles.sliderLabel}>Minimum</Text>
        <Text style={styles.sliderValueText}>{formatPrice(minValue)}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={PRICE_STEP}
        value={minValue}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        onValueChange={(value) => {
          const nextMin = clamp(value, min, maxValue);
          onMinChange(nextMin);
        }}
      />

      <View style={styles.sliderHeaderRow}>
        <Text style={styles.sliderLabel}>Maximum</Text>
        <Text style={styles.sliderValueText}>{formatPrice(maxValue)}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={PRICE_STEP}
        value={maxValue}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        onValueChange={(value) => {
          const nextMax = clamp(value, minValue, max);
          onMaxChange(nextMax);
        }}
      />

      <View style={styles.sliderBoundsRow}>
        <Text style={styles.sliderBoundText}>{formatPrice(min)}</Text>
        <Text style={styles.sliderBoundText}>{formatPrice(max)}</Text>
      </View>

      <Text style={styles.sliderHelperText}>
        Price changes in {formatPrice(PRICE_STEP)} steps.
      </Text>
    </View>
  );
}

export default function GuestBrowseScreen({ onBack, onSelectListing }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [guestCapacity, setGuestCapacity] = useState("");
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [priceRangeTouched, setPriceRangeTouched] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState({
    min: 0,
    max: 10000,
  });

  async function loadListings() {
    try {
      const results = await getAllActiveListings();
      setListings(results);
    } catch (error) {
      console.log("Failed to load listings:", error);
      setListings([]);
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

  const priceBounds = useMemo(() => {
    const prices = listings
      .map((listing) => Number(listing.nightlyRate))
      .filter((price) => Number.isFinite(price));

    if (prices.length === 0) {
      return {
        min: 0,
        max: 10000,
      };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [listings]);

  useEffect(() => {
    if (!priceRangeTouched) {
      setSelectedPriceRange(priceBounds);
    }
  }, [priceBounds, priceRangeTouched]);

  const effectivePriceRange = priceRangeTouched
    ? selectedPriceRange
    : priceBounds;

  function handleMinPriceChange(value) {
    setPriceRangeTouched(true);

    setSelectedPriceRange((currentRange) => ({
      min: clamp(value, priceBounds.min, currentRange.max),
      max: currentRange.max,
    }));
  }

  function handleMaxPriceChange(value) {
    setPriceRangeTouched(true);

    setSelectedPriceRange((currentRange) => ({
      min: currentRange.min,
      max: clamp(value, currentRange.min, priceBounds.max),
    }));
  }

  function handleClearFilters() {
    setGuestCapacity("");
    setSelectedSort("recommended");
    setSelectedPriceRange(priceBounds);
    setPriceRangeTouched(false);
    setFiltersExpanded(false);
  }

  const hasActiveFilters =
    Boolean(guestCapacity) ||
    selectedSort !== "recommended" ||
    effectivePriceRange.min > priceBounds.min ||
    effectivePriceRange.max < priceBounds.max;

  const filteredAndSortedListings = useMemo(() => {
    const filtered = listings.filter((listing) => {
      const nightlyRate = Number(listing.nightlyRate);
      const maxGuests = Number(listing.maxGuests);

      const priceMatch =
        nightlyRate >= effectivePriceRange.min &&
        nightlyRate <= effectivePriceRange.max;

      const guestMatch = !guestCapacity || maxGuests >= Number(guestCapacity);

      return priceMatch && guestMatch;
    });

    const sorted = [...filtered];

    if (selectedSort === "priceLowHigh") {
      sorted.sort(
        (a, b) => Number(a.nightlyRate || 0) - Number(b.nightlyRate || 0),
      );
    }

    if (selectedSort === "priceHighLow") {
      sorted.sort(
        (a, b) => Number(b.nightlyRate || 0) - Number(a.nightlyRate || 0),
      );
    }

    if (selectedSort === "guestCapacity") {
      sorted.sort(
        (a, b) => Number(b.maxGuests || 0) - Number(a.maxGuests || 0),
      );
    }

    if (selectedSort === "recentlyAdded") {
      sorted.sort((a, b) => getCreatedAtMillis(b) - getCreatedAtMillis(a));
    }

    return sorted;
  }, [listings, effectivePriceRange, guestCapacity, selectedSort]);

  function getSortLabel() {
    const selectedOption = SORT_OPTIONS.find(
      (option) => option.value === selectedSort,
    );

    return selectedOption?.label || "Recommended";
  }

  function getFilterSummary() {
    const parts = [];

    if (
      effectivePriceRange.min > priceBounds.min ||
      effectivePriceRange.max < priceBounds.max
    ) {
      parts.push(
        `${formatPrice(effectivePriceRange.min)}–${formatPrice(
          effectivePriceRange.max,
        )}`,
      );
    }

    if (guestCapacity) {
      parts.push(`${guestCapacity}+ guests`);
    }

    if (selectedSort !== "recommended") {
      parts.push(`Sort: ${getSortLabel()}`);
    }

    if (parts.length === 0) {
      return `Price range ${formatPrice(priceBounds.min)}–${formatPrice(
        priceBounds.max,
      )}`;
    }

    return parts.join(" · ");
  }

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
      <InnerScreenHeader
        title="Browse Listings"
        subtitle="Search available properties and filter by price, guest capacity, or sorting preference."
        onBack={onBack}
      />

      <View
        style={[styles.filterBox, hasActiveFilters && styles.activeFilterBox]}
      >
        <Pressable
          style={styles.filterHeaderRow}
          onPress={() => setFiltersExpanded((value) => !value)}
        >
          <View style={styles.filterHeaderLeft}>
            <View style={styles.filterTitleRow}>
              <Text style={styles.filterTitle}>Filters & Sort</Text>

              {hasActiveFilters ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.filterSubtitle,
                hasActiveFilters && styles.activeFilterSubtitle,
              ]}
            >
              {getFilterSummary()}
            </Text>
          </View>

          <Text style={styles.expandIcon}>{filtersExpanded ? "−" : "+"}</Text>
        </Pressable>

        {filtersExpanded ? (
          <View style={styles.expandedFilterContent}>
            <View style={styles.inputGroup}>
              <View style={styles.rangeHeaderRow}>
                <Text style={styles.inputLabel}>Price range per night</Text>
                <Text style={styles.rangeSummary}>
                  {formatPrice(effectivePriceRange.min)} -{" "}
                  {formatPrice(effectivePriceRange.max)}
                </Text>
              </View>

              <PriceRangeSliders
                min={priceBounds.min}
                max={priceBounds.max}
                minValue={effectivePriceRange.min}
                maxValue={effectivePriceRange.max}
                onMinChange={handleMinPriceChange}
                onMaxChange={handleMaxPriceChange}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Number of guests</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={guestCapacity}
                onChangeText={(value) =>
                  setGuestCapacity(value.replace(/[^0-9]/g, ""))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sort by</Text>

              <View style={styles.sortOptionsWrap}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = selectedSort === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.sortChip,
                        isSelected && styles.selectedSortChip,
                      ]}
                      onPress={() => setSelectedSort(option.value)}
                    >
                      <Text
                        style={[
                          styles.sortChipText,
                          isSelected && styles.selectedSortChipText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {hasActiveFilters ? (
              <Pressable
                style={styles.clearButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.resultInfoBox}>
        <Text style={styles.resultInfoText}>
          {hasActiveFilters
            ? `Showing ${filteredAndSortedListings.length} filtered listing(s)`
            : `Showing all ${filteredAndSortedListings.length} listing(s)`}
        </Text>

        {hasActiveFilters ? (
          <Pressable onPress={handleClearFilters}>
            <Text style={styles.clearInlineText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filteredAndSortedListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No matching listings"
            message="Try clearing the filters or ask a host to create a property listing."
          />
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => onSelectListing(item)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  filterBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  activeFilterBox: {
    borderColor: colors.info,
    backgroundColor: colors.infoLight,
  },
  filterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterHeaderLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  filterSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: "700",
  },
  activeFilterSubtitle: {
    color: colors.info,
    fontWeight: "900",
  },
  activeBadge: {
    backgroundColor: colors.info,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  activeBadgeText: {
    color: colors.primaryText,
    fontSize: 10,
    fontWeight: "900",
  },
  expandIcon: {
    fontSize: 28,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  expandedFilterContent: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 13,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  rangeHeaderRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rangeSummary: {
    fontSize: 13,
    color: colors.success,
    fontWeight: "900",
  },
  sliderWrapper: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  singlePriceText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "900",
    textAlign: "center",
  },
  sliderHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  sliderLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "900",
  },
  slider: {
    width: "100%",
    height: 42,
  },
  sliderValueText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  sliderBoundsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  sliderBoundText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "800",
  },
  sliderHelperText: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "700",
    lineHeight: 18,
  },
  sortOptionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sortChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  selectedSortChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortChipText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  selectedSortChipText: {
    color: colors.primaryText,
  },
  clearButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    borderRadius: radius.md,
  },
  clearButtonText: {
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
  },
  resultInfoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "800",
  },
  clearInlineText: {
    fontSize: 13,
    color: colors.info,
    fontWeight: "900",
  },
  listContent: {
    paddingBottom: 40,
  },
});
