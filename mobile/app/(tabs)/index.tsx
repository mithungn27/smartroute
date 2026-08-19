import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";

// IMPORTANT:
// Use the IP address of the computer running your backend.
const API = "http://10.55.120.228:5000";

export default function HomeScreen() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("");
  const [travelType, setTravelType] = useState("Family");

  const [loading, setLoading] = useState(false);

  const generateTrip = async () => {
    // -----------------------------
    // 1. CHECK INPUTS
    // -----------------------------
    if (
      !source.trim() ||
      !destination.trim() ||
      !days.trim() ||
      !budget.trim() ||
      !travelers.trim()
    ) {
      Alert.alert(
        "Missing Details",
        "Please fill in all travel details."
      );
      return;
    }

    // Convert numbers safely
    const daysNumber = Number(days);
    const budgetNumber = Number(budget);
    const travelersNumber = Number(travelers);

    if (
      !Number.isFinite(daysNumber) ||
      !Number.isFinite(budgetNumber) ||
      !Number.isFinite(travelersNumber) ||
      daysNumber <= 0 ||
      budgetNumber <= 0 ||
      travelersNumber <= 0
    ) {
      Alert.alert(
        "Invalid Details",
        "Please enter valid numbers for days, budget and travelers."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("=================================");
      console.log("GENERATING TRIP");
      console.log("Source:", source);
      console.log("Destination:", destination);
      console.log("Days:", daysNumber);
      console.log("Budget:", budgetNumber);
      console.log("Travelers:", travelersNumber);
      console.log("Travel Type:", travelType);
      console.log("API:", `${API}/plan`);
      console.log("=================================");

      // -----------------------------
      // 2. CALL BACKEND
      // -----------------------------
      const response = await fetch(`${API}/plan`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          source: source.trim(),
          city: destination.trim(),
          days: daysNumber,
          budget: budgetNumber,
          travelers: travelersNumber,
          travelType: travelType,
        }),
      });

      console.log("Backend status:", response.status);

      // -----------------------------
      // 3. READ RESPONSE SAFELY
      // -----------------------------
      const responseText = await response.text();

      console.log(
        "Backend response received:",
        responseText.substring(0, 500)
      );

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log("JSON parsing error:", parseError);

        throw new Error(
          "The backend returned an invalid response."
        );
      }

      // -----------------------------
      // 4. CHECK BACKEND ERROR
      // -----------------------------
      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Server error: ${response.status}`
        );
      }

      // Make sure we actually received data
      if (!data) {
        throw new Error(
          "No trip data was received from the backend."
        );
      }

      console.log("Trip generated successfully.");

      // -----------------------------
      // 5. CONVERT TRIP DATA
      // -----------------------------
      let planString = "";

      try {
        planString = JSON.stringify(data);
      } catch (jsonError) {
        console.log(
          "Trip JSON conversion error:",
          jsonError
        );

        throw new Error(
          "Unable to process the generated trip."
        );
      }

      // -----------------------------
      // 6. NAVIGATE TO DASHBOARD
      // -----------------------------
      console.log("Opening Trip Dashboard...");

      router.push({
        pathname: "/trip-dashboard",
        params: {
          source: source.trim(),
          destination: destination.trim(),
          days: String(daysNumber),
          budget: String(budgetNumber),
          travelers: String(travelersNumber),
          travelType: travelType,
          plan: planString,
        },
      });

      console.log("Navigation completed.");
    } catch (error: unknown) {
      // -----------------------------
      // 7. SAFE ERROR HANDLING
      // -----------------------------
      console.log("=================================");
      console.log("GENERATE TRIP ERROR");
      console.log(error);
      console.log("=================================");

      let errorMessage =
        "Unable to generate your trip.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert(
        "Unable to Generate Trip",
        `${errorMessage}\n\nMake sure:\n• Backend is running\n• Phone and computer are on the same Wi-Fi\n• Backend IP address is correct`
      );
    } finally {
      // -----------------------------
      // 8. STOP LOADING
      // -----------------------------
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* =========================
            HERO SECTION
        ========================= */}

        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>
              ✈️
            </Text>
          </View>

          <Text style={styles.logo}>
            SMART-ROUTE
          </Text>

          <Text style={styles.subtitle}>
            Your Intelligent Travel Companion
          </Text>

          <Text style={styles.description}>
            Plan smarter • Travel safer • Explore
            better
          </Text>
        </View>

        {/* =========================
            TRAVEL FORM
        ========================= */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Plan Your Journey
          </Text>

          {/* Starting Location */}

          <Text style={styles.label}>
            📍 Starting Location
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: Bengaluru"
            placeholderTextColor="#8A9AA5"
            value={source}
            onChangeText={setSource}
            editable={!loading}
          />

          {/* Destination */}

          <Text style={styles.label}>
            📍 Destination
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: Mysore"
            placeholderTextColor="#8A9AA5"
            value={destination}
            onChangeText={setDestination}
            editable={!loading}
          />

          {/* Days + Travelers */}

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>
                📅 Days
              </Text>

              <TextInput
                style={styles.input}
                placeholder="3"
                placeholderTextColor="#8A9AA5"
                keyboardType="numeric"
                value={days}
                onChangeText={setDays}
                editable={!loading}
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>
                👥 Travelers
              </Text>

              <TextInput
                style={styles.input}
                placeholder="2"
                placeholderTextColor="#8A9AA5"
                keyboardType="numeric"
                value={travelers}
                onChangeText={setTravelers}
                editable={!loading}
              />
            </View>
          </View>

          {/* Budget */}

          <Text style={styles.label}>
            💰 Budget
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: 10000"
            placeholderTextColor="#8A9AA5"
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
            editable={!loading}
          />

          {/* Travel Type */}

          <Text style={styles.label}>
            👨‍👩‍👧 Travel Type
          </Text>

          <View style={styles.options}>
            {[
              "Family",
              "Friends",
              "Couple",
              "Solo",
            ].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.option,
                  travelType === type &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  setTravelType(type)
                }
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionText,
                    travelType === type &&
                      styles.selectedOptionText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* =========================
              GENERATE BUTTON
          ========================= */}

          <TouchableOpacity
            style={[
              styles.generateButton,
              loading &&
                styles.generateButtonDisabled,
            ]}
            onPress={generateTrip}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />

                <Text
                  style={[
                    styles.generateText,
                    { marginLeft: 10 },
                  ]}
                >
                  GENERATING...
                </Text>
              </>
            ) : (
              <Text style={styles.generateText}>
                ✨ GENERATE MY TRIP
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* =========================
            FEATURES
        ========================= */}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            SMART-ROUTE includes
          </Text>

          <View style={styles.featureRow}>
            <Text style={styles.feature}>
              🗺️ Smart Maps
            </Text>

            <Text style={styles.feature}>
              🤖 AI Assistant
            </Text>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.feature}>
              🏨 Hotels
            </Text>

            <Text style={styles.feature}>
              🚗 Transport
            </Text>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.feature}>
              🚨 Emergency
            </Text>

            <Text style={styles.feature}>
              🌱 Sustainable
            </Text>
          </View>
        </View>

        {/* Footer */}

        <Text style={styles.footer}>
          SMART-ROUTE • Travel Smarter
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ==================================================
   STYLES
================================================== */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EDF7FB",
  },

  container: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  hero: {
    alignItems: "center",
    marginBottom: 25,
  },

  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#176B8C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 5,
  },

  logoIcon: {
    fontSize: 38,
  },

  logo: {
    fontSize: 30,
    fontWeight: "900",
    color: "#174A70",
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#287A9D",
    marginTop: 5,
    textAlign: "center",
  },

  description: {
    color: "#6B7D87",
    fontSize: 13,
    marginTop: 7,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 22,
    elevation: 6,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#173F59",
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374A54",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D7E4EA",
    borderRadius: 14,
    backgroundColor: "#F8FBFC",
    paddingHorizontal: 15,
    color: "#222222",
    fontSize: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  half: {
    width: "48%",
  },

  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  option: {
    borderWidth: 1,
    borderColor: "#C9DCE5",
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#F8FBFC",
  },

  selectedOption: {
    backgroundColor: "#287A9D",
    borderColor: "#287A9D",
  },

  optionText: {
    color: "#40545E",
    fontWeight: "600",
  },

  selectedOptionText: {
    color: "#FFFFFF",
  },

  generateButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#176B8C",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    elevation: 4,
    flexDirection: "row",
  },

  generateButtonDisabled: {
    opacity: 0.7,
  },

  generateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  infoCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    elevation: 3,
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#174A70",
    marginBottom: 12,
  },

  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  feature: {
    width: "48%",
    backgroundColor: "#F4FAFC",
    padding: 12,
    borderRadius: 12,
    color: "#31515F",
    fontWeight: "600",
  },

  footer: {
    textAlign: "center",
    color: "#80919A",
    marginTop: 22,
    fontSize: 12,
  },
});