import { collection, getDocs } from "firebase/firestore";

import { db } from "../config/firebase";
import { getBookingsByGuest, getBookingsByHost } from "./bookingService";
import { getAllDisputes } from "./disputeService";
import { getListingsByHost } from "./listingService";

function countByStatus(items, status) {
  return items.filter((item) => item.status === status).length;
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

  return {
    activeListings,
    requestedBookings: countByStatus(bookings, "requested"),
    completedBookings: countByStatus(bookings, "completed"),
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
