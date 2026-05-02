import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { createAuditLog } from "./auditService";

/**
 * Checks whether the current user has already reviewed this booking.
 */
export async function hasUserReviewedBooking({ bookingId, reviewerId }) {
  const reviewQuery = query(
    collection(db, "reviews"),
    where("bookingId", "==", bookingId),
    where("reviewerId", "==", reviewerId),
  );

  const snapshot = await getDocs(reviewQuery);

  return !snapshot.empty;
}

/**
 * Creates a review for a completed booking.
 */
export async function createReview({
  booking,
  reviewerId,
  revieweeId,
  rating,
  comment,
}) {
  const alreadyReviewed = await hasUserReviewedBooking({
    bookingId: booking.id,
    reviewerId,
  });

  if (alreadyReviewed) {
    throw new Error("You have already submitted a review for this booking.");
  }

  const reviewRef = await addDoc(collection(db, "reviews"), {
    bookingId: booking.id,
    listingId: booking.listingId,
    listingTitle: booking.listingTitle,
    reviewerId,
    revieweeId,
    rating: Number(rating),
    comment: comment.trim(),
    createdAt: serverTimestamp(),
  });

  await createAuditLog({
    userId: reviewerId,
    role: "guest",
    action: "SUBMITTED_REVIEW",
    entityType: "review",
    entityId: reviewRef.id,
    description: `Guest submitted a review for ${booking.listingTitle}.`,
  });

  return reviewRef.id;
}
