import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API =
  process.env.EXPO_PUBLIC_API_URL || "http://10.41.70.228:5000";

type SavedTripItem = {
  _id: string;
  source: string;
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  travelType: string;
  plan: any;
  createdAt: string;
};

export default function SavedTrips() {
  const [trips, setTrips] = useState<SavedTripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedTrips = useCallback(async () => {
    try {
      const token =
        (await AsyncStorage.getItem("token")) ||
        (await AsyncStorage.getItem("authToken"));

      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(`${API}/saved-trips`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.trips)) {
        setTrips(data.trips);
      } else {
        setTrips([]);
      }
    } catch (error: any) {
      console.error("Failed to load saved trips:", error);
      Alert.alert(
        "Saved Trips",
        "Unable to load your saved trips from the server. Please check your connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedTrips();
  }, [fetchSavedTrips]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedTrips();
  };

  const openTrip = (trip: SavedTripItem) => {
    let planString = "";
    try {
      planString =
        typeof trip.plan === "object"
          ? JSON.stringify(trip.plan)
          : String(trip.plan || "");
    } catch {
      planString = "";
    }

    router.push({
      pathname: "/trip-dashboard",
      params: {
        source: trip.source,
        destination: trip.destination,
        days: String(trip.days),
        budget: String(trip.budget),
        travelers: String(trip.travelers),
        travelType: trip.travelType || "Family",
        plan: planString,
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#176B8C"]}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>MY SAVED TRIPS</Text>
            <Text style={styles.headerSubtitle}>
              {trips.length > 0
                ? `${trips.length} plan${trips.length > 1 ? "s" : ""} saved in MongoDB Atlas`
                : "Your saved travel plans"}
            </Text>
          </View>
        </View>

        {/* LOADING INDICATOR */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#176B8C" />
            <Text style={styles.loadingText}>Loading your trips...</Text>
          </View>
        ) : trips.length === 0 ? (
          /* EMPTY STATE */
          <View style={styles.emptyCard}>
            <Text style={styles.icon}>⭐</Text>
            <Text style={styles.title}>No Saved Trips Yet</Text>
            <Text style={styles.description}>
              Your saved trips will appear here once you save a trip from the
              SMART-ROUTE dashboard.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.buttonText}>🏠 Plan a New Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* TRIPS LIST */
          <View style={styles.tripsList}>
            {trips.map((item, index) => {
              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <View key={item._id || index} style={styles.tripCard}>
                  {/* Route Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.routeContainer}>
                      <Text style={styles.routeText}>
                        {item.source} ➔ {item.destination}
                      </Text>
                    </View>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {item.travelType || "Trip"}
                      </Text>
                    </View>
                  </View>

                  {/* Trip Details Grid */}
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Duration</Text>
                      <Text style={styles.detailValue}>📅 {item.days} Days</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Budget</Text>
                      <Text style={styles.detailValue}>
                        💰 ₹{Number(item.budget || 0).toLocaleString("en-IN")}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Travelers</Text>
                      <Text style={styles.detailValue}>
                        👥 {item.travelers} {item.travelers === 1 ? "Person" : "People"}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Saved On</Text>
                      <Text style={styles.detailValue}>🕒 {formattedDate}</Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <TouchableOpacity
                    style={styles.viewPlanButton}
                    onPress={() => openTrip(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewPlanText}>
                      🗺️ View Full Trip Itinerary
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Plan another trip footer button */}
            <TouchableOpacity
              style={styles.planAnotherButton}
              onPress={() => router.push("/(tabs)")}
              activeOpacity={0.8}
            >
              <Text style={styles.planAnotherText}>✨ Plan Another Trip</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: 35,
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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

  headerTitles: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#174A70",
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    color: "#6E8089",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },

  centerBox: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#176B8C",
    fontWeight: "600",
    fontSize: 14,
  },

  tripsList: {
    gap: 16,
  },

  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#E3EEF3",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F5F8",
    paddingBottom: 10,
  },

  routeContainer: {
    flex: 1,
    marginRight: 10,
  },

  routeText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#174A70",
  },

  typeBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  typeBadgeText: {
    color: "#0369A1",
    fontSize: 12,
    fontWeight: "700",
  },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
    marginBottom: 16,
  },

  detailItem: {
    width: "48%",
    backgroundColor: "#F7FBFC",
    padding: 10,
    borderRadius: 12,
  },

  detailLabel: {
    fontSize: 11,
    color: "#7E909A",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: 13,
    color: "#174A70",
    fontWeight: "700",
  },

  viewPlanButton: {
    backgroundColor: "#176B8C",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  viewPlanText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  planAnotherButton: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#176B8C",
  },

  planAnotherText: {
    color: "#176B8C",
    fontSize: 15,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    elevation: 4,
    marginTop: 30,
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