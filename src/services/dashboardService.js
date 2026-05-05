import { collection, getDocs } from "firebase/firestore";

import { db } from "../config/firebase";
import { getBookingsByGuest, getBookingsByHost } from "./bookingService";
import { getAllDisputes } from "./disputeService";
import { getListingsByHost } from "./listingService";

function countByStatus(items, status) {
  return items.filter((item) => item.status === status).length;
}

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

function isCurrentMonth(timestampValue) {
  const timestampMillis = getTimestampMillis(timestampValue);

  if (!timestampMillis) {
    return false;
  }

  const date = new Date(timestampMillis);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function calculateHostEarnings(bookings) {
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  );

  const totalEarnings = completedBookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice || 0),
    0,
  );

  const currentMonthEarnings = completedBookings
    .filter((booking) =>
      isCurrentMonth(
        booking.completedAt || booking.updatedAt || booking.createdAt,
      ),
    )
    .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

  const averageBookingValue =
    completedBookings.length > 0
      ? Math.round(totalEarnings / completedBookings.length)
      : 0;

  return {
    totalEarnings,
    currentMonthEarnings,
    averageBookingValue,
  };
}

export async function getGuestDashboardSummary(guestId) {
  const bookings = await getBookingsByGuest(guestId);

  return {
    requestedBookings: countByStatus(bookings, "requested"),
    approvedBookings: countByStatus(bookings, "approved"),
    completedBookings: countByStatus(bookings, "completed"),
  };
}

export async function getHostDashboardSummary(hostId) {
  const [listings, bookings] = await Promise.all([
    getListingsByHost(hostId),
    getBookingsByHost(hostId),
  ]);

  const activeListings = listings.filter(
    (listing) => listing.isActive !== false,
  ).length;

  const earnings = calculateHostEarnings(bookings);

  return {
    activeListings,
    requestedBookings: countByStatus(bookings, "requested"),
    completedBookings: countByStatus(bookings, "completed"),
    totalEarnings: earnings.totalEarnings,
    currentMonthEarnings: earnings.currentMonthEarnings,
    averageBookingValue: earnings.averageBookingValue,
  };
}

export async function getModeratorDashboardSummary() {
  const [disputes, auditSnapshot] = await Promise.all([
    getAllDisputes(),
    getDocs(collection(db, "auditLogs")),
  ]);

  return {
    openDisputes: countByStatus(disputes, "open"),
    escalatedDisputes: countByStatus(disputes, "escalated"),
    auditLogs: auditSnapshot.size,
  };
}
