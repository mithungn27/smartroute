import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.55.120.228:5000";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing Details",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      console.log(
        "LOGIN: Connecting to:",
        `${API_URL}/auth/login`
      );

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      console.log(
        "LOGIN: Response status:",
        response.status
      );

      const responseText = await response.text();

      console.log(
        "LOGIN: Raw response:",
        responseText
      );

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        Alert.alert(
          "Server Response Error",
          `Server returned an invalid response.\n\nStatus: ${response.status}\n\nResponse:\n${responseText}`
        );
        return;
      }

      if (!response.ok || !data.success) {
        Alert.alert(
          "Login Failed",
          data.message ||
            `Server returned status ${response.status}.`
        );
        return;
      }

      console.log("LOGIN SUCCESS:", data);

      // =====================================================
      // SAVE USER INFORMATION
      // =====================================================

      if (data.user) {
        if (data.user._id) {
          await AsyncStorage.setItem(
            "userId",
            String(data.user._id)
          );
        }

        if (data.user.id) {
          await AsyncStorage.setItem(
            "userId",
            String(data.user.id)
          );
        }

        if (data.user.name) {
          await AsyncStorage.setItem(
            "userName",
            String(data.user.name)
          );
        }

        if (data.user.email) {
          await AsyncStorage.setItem(
            "userEmail",
            String(data.user.email)
          );
        }

        // Store the complete user object
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      // =====================================================
      // SAVE LOGIN STATUS
      // =====================================================

      await AsyncStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // =====================================================
      // SUCCESS MESSAGE
      // =====================================================

      Alert.alert(
        "Login Successful 🎉",
        `Welcome back, ${
          data.user?.name || "Traveler"
        }!`,
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      let errorMessage =
        "Unable to connect to the server.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Alert.alert(
        "Login Connection Error",
        `${errorMessage}\n\nServer:\n${API_URL}\n\nMake sure your backend server is running.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContainer
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* =====================================================
            LOGO
        ===================================================== */}

        <View style={styles.logoCircle}>
          <Text style={styles.logo}>
            ✈️
          </Text>
        </View>

        {/* =====================================================
            APP NAME
        ===================================================== */}

        <Text style={styles.title}>
          SMART-ROUTE
        </Text>

        <Text style={styles.subtitle}>
          Your intelligent travel companion
        </Text>

        {/* =====================================================
            LOGIN CARD
        ===================================================== */}

        <View style={styles.card}>
          <Text style={styles.heading}>
            Welcome Back 👋
          </Text>

          {/* =================================================
              EMAIL
          ================================================= */}

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {/* =================================================
              PASSWORD
          ================================================= */}

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />

          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.loginButton,
              loading &&
                styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.loginButtonText
                }
              >
                LOGIN
              </Text>
            )}
          </TouchableOpacity>

          {/* =================================================
              SIGN UP
          ================================================= */}

          <View style={styles.signupRow}>
            <Text
              style={styles.normalText}
            >
              Don't have an account?{" "}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push("/signup")
              }
            >
              <Text
                style={styles.signupText}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <Text style={styles.footer}>
          Travel smarter • Travel safer •
          Explore better
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef8fb",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#287a9d",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  logo: {
    fontSize: 38,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#176b8c",
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    marginBottom: 25,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 7,
    marginTop: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#d5e1e6",
    borderRadius: 13,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#f8fbfc",
  },

  loginButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: "#287a9d",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  normalText: {
    color: "#666",
    fontSize: 14,
  },

  signupText: {
    color: "#176b8c",
    fontWeight: "bold",
    fontSize: 14,
  },

  footer: {
    marginTop: 25,
    color: "#777",
    fontSize: 12,
    textAlign: "center",
  },
});