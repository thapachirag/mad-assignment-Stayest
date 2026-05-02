import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";

import { db } from "../config/firebase";

/**
 * Creates a new property listing owned by a host.
 */
export async function createListing({ hostId, listingData }) {
  const docRef = await addDoc(collection(db, "listings"), {
    hostId,
    title: listingData.title.trim(),
    location: listingData.location.trim(),
    description: listingData.description.trim(),
    nightlyRate: Number(listingData.nightlyRate),
    cleaningFee: Number(listingData.cleaningFee),
    maxGuests: Number(listingData.maxGuests),
    amenities: listingData.amenities,
    houseRules: listingData.houseRules.trim(),
    cancellationPolicy: listingData.cancellationPolicy.trim(),
    availableFrom: listingData.availableFrom,
    availableTo: listingData.availableTo,
    blockedDates: [],
    imageUrls: [],
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Gets all listings created by the logged-in host.
 */
export async function getListingsByHost(hostId) {
  const listingsQuery = query(
    collection(db, "listings"),
    where("hostId", "==", hostId),
  );

  const snapshot = await getDocs(listingsQuery);

  return snapshot.docs.map((listingDoc) => ({
    id: listingDoc.id,
    ...listingDoc.data(),
  }));
}

/**
 * Updates an existing property listing.
 */
export async function updateListing(listingId, listingData) {
  await updateDoc(doc(db, "listings", listingId), {
    ...listingData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a property listing.
 * For the final version, we may soft-delete instead of permanent delete.
 */
export async function deleteListing(listingId) {
  await deleteDoc(doc(db, "listings", listingId));
}
