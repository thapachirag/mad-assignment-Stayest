import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../config/firebase";

export async function createAuditLog({
  userId,
  role,
  action,
  entityType,
  entityId,
  description,
}) {
  await addDoc(collection(db, "auditLogs"), {
    userId,
    role,
    action,
    entityType,
    entityId,
    description,
    createdAt: serverTimestamp(),
  });
}
