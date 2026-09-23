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

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.41.70.228:5000";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert(
        "Missing Details",
        "Please fill in all the fields."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Password and confirm password do not match."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("Connecting to:", `${API_URL}/auth/register`);

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

      console.log("Signup response:", data);

      if (!response.ok || !data.success) {
        Alert.alert(
          "Sign Up Failed",
          data.message || "Unable to create account."
        );
        return;
      }

      Alert.alert(
        "Account Created 🎉",
        `Welcome to SMART-ROUTE, ${data.user.name}!`,
        [
          {
            text: "Continue to Login",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      console.error("Signup error:", error);

      Alert.alert(
        "Connection Error",
        "Unable to connect to SMART-ROUTE server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>✈️</Text>
        </View>

        <Text style={styles.title}>SMART-ROUTE</Text>

        <Text style={styles.subtitle}>
          Plan smarter. Travel better.
        </Text>

        <View style={styles.card}>
          <Text style={styles.heading}>
            Create Account 🚀
          </Text>

          <Text style={styles.label}>Full Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>

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

          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Create a password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>
            Confirm Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#888"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[
              styles.signupButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>
                CREATE ACCOUNT
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.normalText}>
              Already have an account?{" "}
            </Text>

            <TouchableOpacity
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.loginText}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          Travel smarter • Travel safer • Explore better
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#287a9d",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  logo: {
    fontSize: 36,
  },

  title: {
    fontSize: 29,
    fontWeight: "bold",
    color: "#176b8c",
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    marginBottom: 22,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    elevation: 5,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 7,
    marginTop: 8,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#d5e1e6",
    borderRadius: 13,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#f8fbfc",
  },

  signupButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: "#287a9d",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  disabledButton: {
    opacity: 0.7,
  },

  signupButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  normalText: {
    color: "#666",
    fontSize: 14,
  },

  loginText: {
    color: "#176b8c",
    fontWeight: "bold",
    fontSize: 14,
  },

  footer: {
    marginTop: 22,
    color: "#777",
    fontSize: 12,
    textAlign: "center",
  },
});