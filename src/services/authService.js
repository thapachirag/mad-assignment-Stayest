import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../config/firebase";

/**
 * Registers a new user with Firebase Authentication
 * and stores the user's profile/role in Firestore.
 */
export async function registerUser({ fullName, email, password, role }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    );

    const user = userCredential.user;

    console.log("Auth user created:", user.uid);

    await setDoc(doc(db, "users", user.uid), {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      isActive: true,
      createdAt: serverTimestamp(),
    });

    console.log("Firestore user profile created:", user.uid);

    return user;
  } catch (error) {
    console.log("Registration error:", error);
    throw error;
  }
}

/**
 * Logs in an existing user using email and password.
 */
export async function loginUser({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );

  return userCredential.user;
}

/**
 * Logs out the currently authenticated user.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Gets the user profile from Firestore.
 * This profile contains the role used for routing.
 */
export async function getUserProfile(userId) {
  const userDoc = await getDoc(doc(db, "users", userId));

  if (!userDoc.exists()) {
    return null;
  }

  return {
    id: userDoc.id,
    ...userDoc.data(),
  };
}
