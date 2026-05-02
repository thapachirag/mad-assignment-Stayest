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
import { createAuditLog } from "./auditService";

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

export async function raiseDispute({
  booking,
  raisedBy,
  raisedByRole,
  category,
  description,
  evidenceNotes,
}) {
  const disputeRef = await addDoc(collection(db, "disputes"), {
    bookingId: booking.id,
    listingId: booking.listingId,
    listingTitle: booking.listingTitle,
    hostId: booking.hostId,
    guestId: booking.guestId,
    raisedBy,
    raisedByRole,
    category,
    description: description.trim(),
    evidenceNotes: evidenceNotes.trim(),
    status: "open",
    decisionReason: "",
    moderatorId: "",
    createdAt: serverTimestamp(),
    resolvedAt: null,
  });

  await updateDoc(doc(db, "bookings", booking.id), {
    status: "disputed",
    updatedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: booking.id,
    previousStatus: booking.status,
    newStatus: "disputed",
    actionBy: raisedBy,
    actionRole: raisedByRole,
    actionNote: `Dispute raised under category: ${category}.`,
  });

  await createAuditLog({
    userId: raisedBy,
    role: raisedByRole,
    action: "RAISED_DISPUTE",
    entityType: "dispute",
    entityId: disputeRef.id,
    description: `Dispute raised for ${booking.listingTitle}.`,
  });

  return disputeRef.id;
}

export async function getAllDisputes() {
  const disputesQuery = query(collection(db, "disputes"));
  const snapshot = await getDocs(disputesQuery);

  return snapshot.docs.map((disputeDoc) => ({
    id: disputeDoc.id,
    ...disputeDoc.data(),
  }));
}

export async function getOpenDisputes() {
  const disputesQuery = query(
    collection(db, "disputes"),
    where("status", "==", "open"),
  );

  const snapshot = await getDocs(disputesQuery);

  return snapshot.docs.map((disputeDoc) => ({
    id: disputeDoc.id,
    ...disputeDoc.data(),
  }));
}

export async function closeDispute({ dispute, moderatorId, decisionReason }) {
  await updateDoc(doc(db, "disputes", dispute.id), {
    status: "closed",
    decisionReason: decisionReason.trim(),
    moderatorId,
    resolvedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "bookings", dispute.bookingId), {
    status: "completed",
    updatedAt: serverTimestamp(),
  });

  await addBookingStatusHistory({
    bookingId: dispute.bookingId,
    previousStatus: "disputed",
    newStatus: "completed",
    actionBy: moderatorId,
    actionRole: "moderator",
    actionNote: `Dispute closed: ${decisionReason}`,
  });

  await createAuditLog({
    userId: moderatorId,
    role: "moderator",
    action: "CLOSED_DISPUTE",
    entityType: "dispute",
    entityId: dispute.id,
    description: `Moderator closed dispute for ${dispute.listingTitle}.`,
  });
}

export async function escalateDispute({
  dispute,
  moderatorId,
  decisionReason,
}) {
  await updateDoc(doc(db, "disputes", dispute.id), {
    status: "escalated",
    decisionReason: decisionReason.trim(),
    moderatorId,
    resolvedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "bookings", dispute.bookingId), {
    status: "disputed",
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    userId: moderatorId,
    role: "moderator",
    action: "ESCALATED_DISPUTE",
    entityType: "dispute",
    entityId: dispute.id,
    description: `Moderator escalated dispute for ${dispute.listingTitle}.`,
  });
}
