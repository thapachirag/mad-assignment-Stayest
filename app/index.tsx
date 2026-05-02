import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { auth } from "../src/config/firebase";
import { getUserProfile, logoutUser } from "../src/services/authService";

import LoginScreen from "../src/screens/auth/LoginScreen";
import RegisterScreen from "../src/screens/auth/RegisterScreen";
import GuestHomeScreen from "../src/screens/guest/GuestHomeScreen";
import HostHomeScreen from "../src/screens/host/HostHomeScreen";
import ModeratorHomeScreen from "../src/screens/moderator/ModeratorHomeScreen";

function LoadingScreen() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading StayNest...</Text>
    </View>
  );
}

function ProfileErrorScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Profile not found</Text>
      <Text style={styles.errorText}>
        Your Firebase account exists, but your Firestore user profile could not
        be loaded.
      </Text>

      <Pressable style={styles.logoutButton} onPress={logoutUser}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

async function loadProfileWithRetry(userId: string) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const profile = await getUserProfile(userId);

    if (profile) {
      return profile;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return null;
}

export default function Index() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCheckingAuth(true);
      setFirebaseUser(user);

      if (user) {
        const userProfile = await loadProfileWithRetry(user.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return <LoadingScreen />;
  }

  if (!firebaseUser) {
    if (authScreen === "register") {
      return (
        <RegisterScreen
          navigation={{
            goBack: () => setAuthScreen("login"),
          }}
        />
      );
    }

    return (
      <LoginScreen
        navigation={{
          navigate: () => setAuthScreen("register"),
        }}
      />
    );
  }

  if (!profile) {
    return <ProfileErrorScreen />;
  }

  if (profile.role === "host") {
    return <HostHomeScreen />;
  }

  if (profile.role === "moderator") {
    return <ModeratorHomeScreen />;
  }

  return <GuestHomeScreen />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#4b5563",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111827",
  },
  errorText: {
    textAlign: "center",
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
