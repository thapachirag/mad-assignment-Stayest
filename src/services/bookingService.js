import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { doDateRangesOverlap } from "../utils/dateUtils";
import { calculateBookingPrice } from "../utils/priceUtils";
import { createAuditLog } from "./auditService";

const BLOCKING_STATUSES = ["approved", "confirmed", "checkedIn"];

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

function getBookingStatusPriority(status) {
  const priorityMap = {
    requested: 1,
    approved: 2,
    completed: 3,
    declined: 4,
    disputed: 5,
    confirmed: 6,
    checkedIn: 7,
    checkedOut: 8,
  };

  return priorityMap[status] || 99;
}

function sortBookingsForHost(bookings) {
  return [...bookings].sort((a, b) => {
    const statusDifference =
      getBookingStatusPriority(a.status) - getBookingStatusPriority(b.status);

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt);
  });
}

function sortBookingsNewestFirst(bookings) {
  return [...bookings].sort(
    (a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt),
  );
}

async function addBookingStatusHistory({
  bookingId,
  previousStatus,
  newStatus,
  actionBy,
  actionRole,
  actionNote,
}) {
  await addDoc(collection(db, "bookingStatusHistory"), {
    bookingId,
    previousStatus,
    newStatus,
    actionBy,
    actionRole,
    actionNote,
    createdAt: serverTimestamp(),
  });
}

export async function hasOverlappingApprovedBooking({
  listingId,
  checkInDate,
  checkOutDate,
  excludeBookingId = null,
}) {
  const bookingsQuery = query(
    collection(db, "bookings"),
    where("listingId", "==", listingId),
    where("status", "in", BLOCKING_STATUSES),
  );

  const snapshot = await getDocs(bookingsQuery);

  return snapshot.docs.some((bookingDoc) => {
    if (excludeBookingId && bookingDoc.id === excludeBookingId) {
      return false;
    }

    const booking = bookingDoc.data();

    return doDateRangesOverlap(
      checkInDate,
      checkOutDate,
      booking.checkInDate,
      booking.checkOutDate,
    );
  });
}

export async function createBookingRequest({
  listing,
  guestId,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  notes = "",
}) {
  const priceBreakdown = calculateBookingPrice({
    nightlyRate: listing.nightlyRate,
    cleaningFee: listing.cleaningFee,
    checkInDate,
    checkOutDate,
  });

  const bookingRef = await addDoc(collection(db, "bookings"), {
    listingId: listing.id,
    listingTitle: listing.title,
    hostId: listing.hostId,
    guestId,

    checkInDate,
    checkOutDate,
    numberOfGuests: Number(numberOfGuests),
    nights: priceBreakdown.nights,

    nightlyRate: Number(listing.nightlyRate),
    cleaningFee: Number(listing.cleaningFee),
    totalPrice: priceBreakdown.totalPrice,

    notes: notes.trim(),
    status: "requested",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: bookingRef.id,
    previousStatus: null,
    newStatus: "requested",
    actionBy: guestId,
    actionRole: "guest",
    actionNote: "Guest submitted booking request.",
  });

  await createAuditLog({
    userId: guestId,
    role: "guest",
    action: "CREATED_BOOKING_REQUEST",
    entityType: "booking",
    entityId: bookingRef.id,
    description: `Guest requested booking for ${listing.title}.`,
  });

  return bookingRef.id;
}

export async function getBookingsByGuest(guestId) {
  try {
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("guestId", "==", guestId),
    );

    const snapshot = await getDocs(bookingsQuery);

    const bookings = snapshot.docs.map((bookingDoc) => ({
      id: bookingDoc.id,
      ...bookingDoc.data(),
    }));

    return sortBookingsNewestFirst(bookings);
  } catch (error) {
    console.log("Failed to load guest bookings:", error);
    throw error;
  }
}

export async function getBookingsByHost(hostId) {
  try {
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("hostId", "==", hostId),
    );

    const snapshot = await getDocs(bookingsQuery);

    const bookings = snapshot.docs.map((bookingDoc) => ({
      id: bookingDoc.id,
      ...bookingDoc.data(),
    }));

    return sortBookingsForHost(bookings);
  } catch (error) {
    console.log("Failed to load host bookings:", error);
    throw error;
  }
}

export async function approveBookingRequest({ booking, hostId }) {
  if (booking.hostId !== hostId) {
    throw new Error("You can only approve bookings for your own listings.");
  }

  if (booking.status !== "requested") {
    throw new Error("Only requested bookings can be approved.");
  }

  const overlapExists = await hasOverlappingApprovedBooking({
    listingId: booking.listingId,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    excludeBookingId: booking.id,
  });

  if (overlapExists) {
    throw new Error(
      "These dates overlap with another approved booking for this listing.",
    );
  }

  await updateDoc(doc(db, "bookings", booking.id), {
    status: "approved",
    updatedAt: serverTimestamp(),
    approvedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: booking.id,
    previousStatus: booking.status,
    newStatus: "approved",
    actionBy: hostId,
    actionRole: "host",
    actionNote: "Host approved booking request.",
  });

  await createAuditLog({
    userId: hostId,
    role: "host",
    action: "APPROVED_BOOKING_REQUEST",
    entityType: "booking",
    entityId: booking.id,
    description: `Host approved booking request for ${booking.listingTitle}.`,
  });
}

export async function declineBookingRequest({ booking, hostId }) {
  if (booking.hostId !== hostId) {
    throw new Error("You can only decline bookings for your own listings.");
  }

  if (booking.status !== "requested") {
    throw new Error("Only requested bookings can be declined.");
  }

  await updateDoc(doc(db, "bookings", booking.id), {
    status: "declined",
    updatedAt: serverTimestamp(),
    declinedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: booking.id,
    previousStatus: booking.status,
    newStatus: "declined",
    actionBy: hostId,
    actionRole: "host",
    actionNote: "Host declined booking request.",
  });

  await createAuditLog({
    userId: hostId,
    role: "host",
    action: "DECLINED_BOOKING_REQUEST",
    entityType: "booking",
    entityId: booking.id,
    description: `Host declined booking request for ${booking.listingTitle}.`,
  });
}

export async function completeBooking({ booking, hostId }) {
  if (booking.hostId !== hostId) {
    throw new Error("You can only complete bookings for your own listings.");
  }

  if (booking.status !== "approved") {
    throw new Error("Only approved bookings can be marked as completed.");
  }

  await updateDoc(doc(db, "bookings", booking.id), {
    status: "completed",
    updatedAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: booking.id,
    previousStatus: booking.status,
    newStatus: "completed",
    actionBy: hostId,
    actionRole: "host",
    actionNote: "Host marked booking as completed.",
  });

  await createAuditLog({
    userId: hostId,
    role: "host",
    action: "COMPLETED_BOOKING",
    entityType: "booking",
    entityId: booking.id,
    description: `Host marked booking for ${booking.listingTitle} as completed.`,
  });
}

export async function markBookingAsDisputed({ booking, userId, role }) {
  if (booking.status !== "completed") {
    throw new Error("Only completed bookings can be disputed.");
  }

  await updateDoc(doc(db, "bookings", booking.id), {
    status: "disputed",
    updatedAt: serverTimestamp(),
    disputedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: booking.id,
    previousStatus: booking.status,
    newStatus: "disputed",
    actionBy: userId,
    actionRole: role,
    actionNote: "Booking was marked as disputed.",
  });

  await createAuditLog({
    userId,
    role,
    action: "MARKED_BOOKING_AS_DISPUTED",
    entityType: "booking",
    entityId: booking.id,
    description: `Booking for ${booking.listingTitle} was marked as disputed.`,
  });
}
