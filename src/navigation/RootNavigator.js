import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../config/firebase";
import { getUserProfile, logoutUser } from "../services/authService";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

import GuestHomeScreen from "../screens/guest/GuestHomeScreen";
import HostHomeScreen from "../screens/host/HostHomeScreen";
import ModeratorHomeScreen from "../screens/moderator/ModeratorHomeScreen";

const Stack = createNativeStackNavigator();

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
        Your account exists, but your user profile could not be loaded.
      </Text>

      <Pressable style={styles.logoutButton} onPress={logoutUser}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

async function loadProfileWithRetry(userId) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const profile = await getUserProfile(userId);

    if (profile) {
      return profile;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return null;
}

export default function RootNavigator() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!firebaseUser ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : !profile ? (
          <Stack.Screen name="ProfileError" component={ProfileErrorScreen} />
        ) : profile.role === "host" ? (
          <Stack.Screen name="HostHome" component={HostHomeScreen} />
        ) : profile.role === "moderator" ? (
          <Stack.Screen name="ModeratorHome" component={ModeratorHomeScreen} />
        ) : (
          <Stack.Screen name="GuestHome" component={GuestHomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
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
