import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { db } from "../config/firebase";

function getTimestampMillis(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (value.seconds) {
    return value.seconds * 1000;
  }

  return 0;
}

async function getSavedListingSnapshot({ guestId, listingId }) {
  const savedQuery = query(
    collection(db, "savedListings"),
    where("guestId", "==", guestId),
    where("listingId", "==", listingId),
  );

  const snapshot = await getDocs(savedQuery);

  return snapshot;
}

export async function isListingSaved({ guestId, listingId }) {
  const snapshot = await getSavedListingSnapshot({ guestId, listingId });
  return !snapshot.empty;
}

export async function saveListing({ guestId, listing }) {
  const snapshot = await getSavedListingSnapshot({
    guestId,
    listingId: listing.id,
  });

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  const savedRef = await addDoc(collection(db, "savedListings"), {
    guestId,
    listingId: listing.id,
    hostId: listing.hostId,

    title: listing.title,
    location: listing.location,
    description: listing.description || "",
    nightlyRate: Number(listing.nightlyRate || 0),
    cleaningFee: Number(listing.cleaningFee || 0),
    maxGuests: Number(listing.maxGuests || 1),
    minimumStayNights: Number(listing.minimumStayNights || 1),
    amenities: listing.amenities || [],
    houseRules: listing.houseRules || "",
    cancellationPolicy: listing.cancellationPolicy || "",
    availableFrom: listing.availableFrom,
    availableTo: listing.availableTo,
    isActive: listing.isActive !== false,

    createdAt: serverTimestamp(),
  });

  return savedRef.id;
}

export async function unsaveListing({ guestId, listingId }) {
  const snapshot = await getSavedListingSnapshot({ guestId, listingId });

  const deletePromises = snapshot.docs.map((savedDoc) =>
    deleteDoc(doc(db, "savedListings", savedDoc.id)),
  );

  await Promise.all(deletePromises);
}

export async function toggleSavedListing({ guestId, listing }) {
  const alreadySaved = await isListingSaved({
    guestId,
    listingId: listing.id,
  });

  if (alreadySaved) {
    await unsaveListing({
      guestId,
      listingId: listing.id,
    });

    return false;
  }

  await saveListing({
    guestId,
    listing,
  });

  return true;
}

export async function getSavedListingsByGuest(guestId) {
  const savedQuery = query(
    collection(db, "savedListings"),
    where("guestId", "==", guestId),
  );

  const snapshot = await getDocs(savedQuery);

  const savedListings = snapshot.docs.map((savedDoc) => ({
    savedId: savedDoc.id,
    id: savedDoc.data().listingId,
    ...savedDoc.data(),
  }));

  return savedListings.sort(
    (a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt),
  );
}
