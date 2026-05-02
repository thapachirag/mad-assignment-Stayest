import React, { useState } from "react";
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
import { createReview } from "../../services/reviewService";

export default function ReviewScreen({ booking, onBack, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("Clean property and smooth check-in.");
  const [submitting, setSubmitting] = useState(false);

  function validateForm() {
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert("Invalid rating", "Please select a rating between 1 and 5.");
      return false;
    }

    if (!comment.trim()) {
      Alert.alert("Missing comment", "Please enter a short review comment.");
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

      await createReview({
        booking,
        reviewerId: currentUser.uid,
        revieweeId: booking.hostId,
        rating,
        comment,
      });

      Alert.alert("Review submitted", "Your review has been saved.");
      onSubmitted();
    } catch (error) {
      Alert.alert("Review failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderStars() {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)}>
            <Text style={styles.star}>{star <= rating ? "★" : "☆"}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Leave Review</Text>
        <Text style={styles.subtitle}>{booking.listingTitle}</Text>

        <Text style={styles.infoText}>
          Booking: {booking.checkInDate} to {booking.checkOutDate}
        </Text>

        <Text style={styles.label}>Your Rating</Text>
        {renderStars()}
        <Text style={styles.ratingText}>{rating} out of 5 stars</Text>

        <Text style={styles.label}>Comment</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={comment}
          onChangeText={setComment}
          multiline
          placeholder="Write your review..."
        />

        <Pressable
          style={[styles.primaryButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back to Bookings</Text>
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
    fontSize: 17,
    color: "#6b7280",
    fontWeight: "700",
  },
  infoText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 15,
    color: "#374151",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    marginTop: 10,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  star: {
    fontSize: 36,
    marginRight: 8,
    color: "#f59e0b",
  },
  ratingText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
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
    minHeight: 120,
    textAlignVertical: "top",
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
