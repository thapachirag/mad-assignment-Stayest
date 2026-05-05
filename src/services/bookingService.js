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

export async function hasOverlappingApprovedBooking({
  listingId,
  checkInDate,
  checkOutDate,
}) {
  const bookingsQuery = query(
    collection(db, "bookings"),
    where("listingId", "==", listingId),
    where("status", "in", BLOCKING_STATUSES),
  );

  const snapshot = await getDocs(bookingsQuery);

  return snapshot.docs.some((bookingDoc) => {
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
  notes,
}) {
  const priceBreakdown = calculateBookingPrice({
    nightlyRate: listing.nightlyRate,
    cleaningFee: listing.cleaningFee,
    checkInDate,
    checkOutDate,
  });

  const bookingRef = await addDoc(collection(db, "bookings"), {
    // Important relationship fields
    listingId: listing.id,
    listingTitle: listing.title,
    hostId: listing.hostId,
    guestId: guestId,

    // Booking details
    checkInDate,
    checkOutDate,
    numberOfGuests: Number(numberOfGuests),
    nights: priceBreakdown.nights,

    // Price details
    nightlyRate: Number(listing.nightlyRate),
    cleaningFee: Number(listing.cleaningFee),
    totalPrice: priceBreakdown.totalPrice,

    // Guest note
    notes: notes.trim(),

    // Important status field
    status: "requested",

    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "bookingStatusHistory"), {
    bookingId: bookingRef.id,
    previousStatus: null,
    newStatus: "requested",
    actionBy: guestId,
    actionRole: "guest",
    actionNote: "Guest submitted booking request.",
    createdAt: serverTimestamp(),
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
  const bookingsQuery = query(
    collection(db, "bookings"),
    where("guestId", "==", guestId),
  );

  const snapshot = await getDocs(bookingsQuery);

  return snapshot.docs.map((bookingDoc) => ({
    id: bookingDoc.id,
    ...bookingDoc.data(),
  }));
}
export async function getBookingsByHost(hostId) {
  const bookingsQuery = query(
    collection(db, "bookings"),
    where("hostId", "==", hostId),
  );

  const snapshot = await getDocs(bookingsQuery);

  return snapshot.docs.map((bookingDoc) => ({
    id: bookingDoc.id,
    ...bookingDoc.data(),
  }));
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

export async function approveBookingRequest({ booking, hostId }) {
  const overlapExists = await hasOverlappingApprovedBooking({
    listingId: booking.listingId,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
  });

  if (overlapExists) {
    throw new Error(
      "This booking overlaps with another approved booking and cannot be approved.",
    );
  }

  await updateDoc(doc(db, "bookings", booking.id), {
    status: "approved",
    updatedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: booking.id,
    previousStatus: booking.status,
    newStatus: "approved",
    actionBy: hostId,
    actionRole: "host",
    actionNote: "Host approved the booking request.",
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
  await updateDoc(doc(db, "bookings", booking.id), {
    status: "declined",
    updatedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: booking.id,
    previousStatus: booking.status,
    newStatus: "declined",
    actionBy: hostId,
    actionRole: "host",
    actionNote: "Host declined the booking request.",
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
  await updateDoc(doc(db, "bookings", booking.id), {
    status: "completed",
    updatedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: booking.id,
    previousStatus: booking.status,
    newStatus: "completed",
    actionBy: hostId,
    actionRole: "host",
    actionNote: "Host marked the booking as completed after checkout.",
  });

  await createAuditLog({
    userId: hostId,
    role: "host",
    action: "COMPLETED_BOOKING",
    entityType: "booking",
    entityId: booking.id,
    description: `Host completed booking for ${booking.listingTitle}.`,
  });
}
