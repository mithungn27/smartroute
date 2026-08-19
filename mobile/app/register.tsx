import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

// ======================================================
// API CONFIGURATION
// ======================================================

const API_URL = "http://10.55.120.228:5000";

// ======================================================
// REGISTER SCREEN
// ======================================================

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ====================================================
  // VALIDATE FORM
  // ====================================================

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email.");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email.");
      return false;
    }

    if (!password) {
      Alert.alert("Missing Password", "Please enter a password.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must contain at least 6 characters."
      );
      return false;
    }

    if (!confirmPassword) {
      Alert.alert(
        "Confirm Password",
        "Please confirm your password."
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Passwords do not match."
      );
      return false;
    }

    return true;
  };

  // ====================================================
  // REGISTER
  // ====================================================

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Register response:", data);

      if (!response.ok) {
        Alert.alert(
          "Registration Failed",
          data.message || "Unable to create account."
        );

        return;
      }

      Alert.alert(
        "Registration Successful",
        "Your SMART-ROUTE account has been created successfully.",
        [
          {
            text: "Continue to Login",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Registration error:", error);

      Alert.alert(
        "Connection Error",
        "Unable to connect to the SMART-ROUTE server.\n\nMake sure the backend server is running and your device is connected to the same network."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOGIN
  // ====================================================

  const goToLogin = () => {
    router.replace("/login");
  };

  // ====================================================
  // SCREEN
  // ====================================================

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
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>

          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🌍</Text>
          </View>

          {/* TITLE */}
          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Join SMART-ROUTE and plan smarter journeys
          </Text>

          {/* NAME */}
          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
          />

          {/* EMAIL */}
          <Text style={styles.label}>
            Email Address
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {/* PASSWORD */}
          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {/* CONFIRM PASSWORD */}
          <Text style={styles.label}>
            Confirm Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {/* PASSWORD INFORMATION */}
          <Text style={styles.passwordInfo}>
            Password must contain at least 6 characters.
          </Text>

          {/* REGISTER BUTTON */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.registerButtonText}>
                  Creating Account...
                </Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginQuestion}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={goToLogin}
              disabled={loading}
            >
              <Text style={styles.loginText}>
                Login
              </Text>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <Text style={styles.footer}>
            SMART-ROUTE
          </Text>

          <Text style={styles.footerSubtitle}>
            Unified Intelligent Travel Planning System
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FA",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 25,
    paddingVertical: 30,

    elevation: 5,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },

  logo: {
    fontSize: 55,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 11,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  passwordInfo: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 7,
  },

  registerButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.7,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  loginQuestion: {
    fontSize: 14,
    color: "#6B7280",
  },

  loginText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "700",
    marginLeft: 5,
  },

  footer: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 30,
  },

  footerSubtitle: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
});