import { useState } from "react";
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
import { raiseDispute } from "../../services/disputeService";

const DISPUTE_CATEGORIES = ["damage", "cleanliness", "rule violation", "other"];

export default function RaiseDisputeScreen({ booking, onBack, onSubmitted }) {
  const [category, setCategory] = useState("damage");
  const [description, setDescription] = useState(
    "Issue found after checkout that requires moderator review.",
  );
  const [evidenceNotes, setEvidenceNotes] = useState(
    "Host has noted the issue and can provide supporting evidence if required.",
  );
  const [submitting, setSubmitting] = useState(false);

  function validateForm() {
    if (!category) {
      Alert.alert("Missing category", "Please select a dispute category.");
      return false;
    }

    if (!description.trim()) {
      Alert.alert("Missing description", "Please describe the dispute.");
      return false;
    }

    if (!evidenceNotes.trim()) {
      Alert.alert("Missing evidence notes", "Please add evidence notes.");
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

      await raiseDispute({
        booking,
        raisedBy: currentUser.uid,
        raisedByRole: "host",
        category,
        description,
        evidenceNotes,
      });

      Alert.alert(
        "Dispute raised",
        "The dispute has been sent to the moderator.",
      );
      onSubmitted();
    } catch (error) {
      Alert.alert("Dispute failed", error.message);
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
        <Text style={styles.title}>Raise Dispute</Text>
        <Text style={styles.subtitle}>{booking.listingTitle}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Booking: {booking.checkInDate} to {booking.checkOutDate}
          </Text>
          <Text style={styles.infoText}>
            Guest count: {booking.numberOfGuests}
          </Text>
          <Text style={styles.infoText}>
            Total price: £{booking.totalPrice}
          </Text>
        </View>

        <Text style={styles.label}>Dispute Category</Text>

        <View style={styles.categoryGrid}>
          {DISPUTE_CATEGORIES.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.categoryButton,
                category === item && styles.selectedCategory,
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Evidence Notes</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={evidenceNotes}
          onChangeText={setEvidenceNotes}
          multiline
        />

        <Pressable
          style={[styles.primaryButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? "Submitting..." : "Submit Dispute"}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back</Text>
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
  infoBox: {
    marginTop: 18,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    padding: 14,
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
    marginBottom: 8,
    marginTop: 18,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
  },
  selectedCategory: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  categoryText: {
    color: "#111827",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  selectedCategoryText: {
    color: "#ffffff",
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
    minHeight: 100,
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
