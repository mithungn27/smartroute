import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

export default function SavedTrips() {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>
              Saved Trips
            </Text>

            <Text style={styles.headerSubtitle}>
              Your saved travel plans
            </Text>
          </View>
        </View>

        {/* EMPTY STATE */}
        <View style={styles.emptyCard}>
          <Text style={styles.icon}>⭐</Text>

          <Text style={styles.title}>
            No Saved Trips Yet
          </Text>

          <Text style={styles.description}>
            Your saved trips will appear here when you
            save a trip from the SMART-ROUTE dashboard.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.buttonText}>
              🏠 Plan a New Trip
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EDF7FB",
  },

  container: {
    padding: 18,
    paddingTop: 45,
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    elevation: 3,
  },

  backText: {
    fontSize: 34,
    color: "#176B8C",
    marginTop: -5,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#174A70",
  },

  headerSubtitle: {
    color: "#6E8089",
    fontSize: 12,
    marginTop: 2,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    elevation: 4,
    marginTop: 20,
  },

  icon: {
    fontSize: 55,
    marginBottom: 15,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#174A70",
    marginBottom: 10,
    textAlign: "center",
  },

  description: {
    color: "#596A72",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },

  button: {
    width: "100%",
    backgroundColor: "#176B8C",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});