import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import MapView, {
  Marker,
  Polyline,
} from "react-native-maps";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

// ======================================================
// API
// ======================================================

const API = "http://10.55.120.228:5000";

// ======================================================
// TYPES
// ======================================================

type Message = {
  sender: "user" | "ai";
  text: string;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

// ======================================================
// COMPONENT
// ======================================================

export default function TripDashboard() {
  const params = useLocalSearchParams<{
    source?: string;
    destination?: string;
    days?: string;
    budget?: string;
    travelers?: string;
    travelType?: string;
    plan?: string;
  }>();

  const source = String(params.source || "");
  const destination = String(params.destination || "");
  const days = String(params.days || "");
  const budget = String(params.budget || "");
  const travelers = String(params.travelers || "");
  const travelType = String(params.travelType || "Family");

  // ====================================================
  // STATES
  // ====================================================

  const [plan, setPlan] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [transport, setTransport] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [sustainability, setSustainability] =
    useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saved, setSaved] = useState(false);

  // ====================================================
  // MAP
  // ====================================================

  const [sourceLocation, setSourceLocation] =
    useState<Coordinate>({
      latitude: 12.9716,
      longitude: 77.5946,
    });

  const [destinationLocation, setDestinationLocation] =
    useState<Coordinate>({
      latitude: 12.2958,
      longitude: 76.6394,
    });

  const [region, setRegion] = useState({
    latitude: 12.6337,
    longitude: 77.117,
    latitudeDelta: 0.8,
    longitudeDelta: 0.8,
  });

  // ====================================================
  // INDIA CITY COORDINATES
  // ====================================================

  const getCoordinates = (place: string): Coordinate => {
    const name = String(place || "").toLowerCase();

    const locations: Record<string, Coordinate> = {
      bengaluru: {
        latitude: 12.9716,
        longitude: 77.5946,
      },

      bangalore: {
        latitude: 12.9716,
        longitude: 77.5946,
      },

      mysore: {
        latitude: 12.2958,
        longitude: 76.6394,
      },

      mysuru: {
        latitude: 12.2958,
        longitude: 76.6394,
      },

      goa: {
        latitude: 15.2993,
        longitude: 74.124,
      },

      mumbai: {
        latitude: 19.076,
        longitude: 72.8777,
      },

      delhi: {
        latitude: 28.6139,
        longitude: 77.209,
      },

      hyderabad: {
        latitude: 17.385,
        longitude: 78.4867,
      },

      chennai: {
        latitude: 13.0827,
        longitude: 80.2707,
      },

      kochi: {
        latitude: 9.9312,
        longitude: 76.2673,
      },

      jaipur: {
        latitude: 26.9124,
        longitude: 75.7873,
      },

      kolkata: {
        latitude: 22.5726,
        longitude: 88.3639,
      },

      pune: {
        latitude: 18.5204,
        longitude: 73.8567,
      },

      ahmedabad: {
        latitude: 23.0225,
        longitude: 72.5714,
      },

      varanasi: {
        latitude: 25.3176,
        longitude: 82.9739,
      },

      agra: {
        latitude: 27.1767,
        longitude: 78.0081,
      },
    };

    for (const key of Object.keys(locations)) {
      if (name.includes(key)) {
        return locations[key];
      }
    }

    return {
      latitude: 20.5937,
      longitude: 78.9629,
    };
  };

  // ====================================================
  // LOAD DASHBOARD
  // ====================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // ==================================================
      // PLAN
      // ==================================================

      if (params.plan) {
        try {
          const parsedPlan = JSON.parse(
            String(params.plan)
          );

          setPlan(parsedPlan);
        } catch (error) {
          console.log("Plan parsing error:", error);
          setPlan(null);
        }
      } else {
        try {
          const response = await fetch(`${API}/plan`, {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              source,
              city: destination,
              days: Number(days),
              budget: Number(budget),
              travelers: Number(travelers),
              travelType,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setPlan(data);
          }
        } catch (error) {
          console.log("Plan loading error:", error);
        }
      }

      // ==================================================
      // MAP
      // ==================================================

      const src = getCoordinates(source);
      const dest = getCoordinates(destination);

      setSourceLocation(src);
      setDestinationLocation(dest);

      setRegion({
        latitude: (src.latitude + dest.latitude) / 2,
        longitude: (src.longitude + dest.longitude) / 2,
        latitudeDelta: 5,
        longitudeDelta: 5,
      });

      // ==================================================
      // HOTELS
      // ==================================================

      try {
        const response = await fetch(
          `${API}/hotels?city=${encodeURIComponent(
            destination
          )}`
        );

        if (response.ok) {
          const data = await response.json();

          setHotels(
            Array.isArray(data)
              ? data
              : data.hotels || []
          );
        }
      } catch (error) {
        console.log("Hotel error:", error);
      }

      // ==================================================
      // TRANSPORT
      // ==================================================

      try {
        const response = await fetch(
          `${API}/transport?source=${encodeURIComponent(
            source
          )}&city=${encodeURIComponent(destination)}`
        );

        if (response.ok) {
          const data = await response.json();

          setTransport(
            data.transportOptions || []
          );
        }
      } catch (error) {
        console.log("Transport error:", error);
      }

      // ==================================================
      // ATTRACTIONS
      // ==================================================

      try {
        const response = await fetch(
          `${API}/attractions?city=${encodeURIComponent(
            destination
          )}`
        );

        if (response.ok) {
          const data = await response.json();

          setAttractions(
            data.attractions || []
          );
        }
      } catch (error) {
        console.log("Attractions error:", error);
      }

      // ==================================================
      // SUSTAINABILITY
      // ==================================================

      try {
        const response = await fetch(
          `${API}/sustainability?source=${encodeURIComponent(
            source
          )}&city=${encodeURIComponent(destination)}`
        );

        if (response.ok) {
          const data = await response.json();

          setSustainability(data);
        }
      } catch (error) {
        console.log("Sustainability error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Logout",
          style: "destructive",

          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "token",
                "authToken",
                "user",
              ]);

              console.log(
                "LOGOUT: Login data cleared"
              );

              router.replace("/login");
            } catch (error) {
              console.log("Logout error:", error);

              Alert.alert(
                "Logout Error",
                "Unable to logout. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // ======================================================
  // GOOGLE MAPS DIRECTIONS
  // ======================================================

  const openDirections = async (
    destinationName: string
  ) => {
    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${encodeURIComponent(
        destinationName
      )}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Maps",
        "Unable to open Google Maps."
      );
    }
  };

  // ======================================================
  // GOOGLE MAPS PLACE
  // ======================================================

  const openPlace = async (
    name: string,
    city: string
  ) => {
    const query = `${name}, ${city}`;

    const url =
      `https://www.google.com/maps/search/?api=1` +
      `&query=${encodeURIComponent(query)}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Maps",
        "Unable to open Google Maps."
      );
    }
  };

  // ======================================================
  // FLIGHT SEARCH
  // ======================================================

  const searchFlights = async () => {
    if (!source || !destination) {
      Alert.alert(
        "Flight Search",
        "Please enter both source and destination."
      );

      return;
    }

    const url =
      `https://www.google.com/travel/flights?q=` +
      encodeURIComponent(
        `Flights from ${source} to ${destination}`
      );

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Flight Search",
        "Unable to open flight search."
      );
    }
  };

  // ======================================================
  // SAVE TRIP
  // ======================================================

  const saveTrip = () => {
    setSaved(true);

    Alert.alert(
      "Trip Saved ⭐",
      `Your ${days}-day trip from ${source} to ${destination} has been saved.`
    );
  };

  // ======================================================
  // HOTEL
  // ======================================================

  const viewHotel = async (hotel: any) => {
    Alert.alert(
      hotel.name || "Hotel",

      `⭐ ${hotel.rating || "N/A"}

💰 ₹${hotel.price || "N/A"}/night

📍 ${
        hotel.distance ||
        "Distance unavailable"
      }`,

      [
        {
          text: "Open Map",

          onPress: () =>
            openPlace(
              hotel.name,
              destination
            ),
        },

        {
          text: "Booking",

          onPress: () => {
            if (hotel.bookingUrl) {
              Linking.openURL(
                hotel.bookingUrl
              );
            } else {
              Alert.alert(
                "Booking",
                "Booking link is not available."
              );
            }
          },
        },

        {
          text: "Close",
          style: "cancel",
        },
      ]
    );
  };

  // ======================================================
  // TRANSPORT
  // ======================================================

  const selectTransport = (item: any) => {
    Alert.alert(
      "Transport Selected",

      `${item.type} selected.

Price: ₹${item.price}

Duration: ${item.duration}`,

      [
        {
          text: "Navigate",

          onPress: () =>
            openDirections(destination),
        },

        {
          text: "Close",
          style: "cancel",
        },
      ]
    );
  };

  // ======================================================
  // SEARCH
  // ======================================================

  const performSearch = () => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      Alert.alert(
        "Search",
        "Enter something to search."
      );

      return;
    }

    if (
      query.includes("flight") ||
      query.includes("plane") ||
      query.includes("air")
    ) {
      searchFlights();
      return;
    }

    if (query.includes("hotel")) {
      Alert.alert(
        "Hotels",
        `${hotels.length} hotel options are available below.`
      );

      return;
    }

    if (
      query.includes("transport") ||
      query.includes("vehicle")
    ) {
      Alert.alert(
        "Transport",
        `${transport.length} transport options are available below.`
      );

      return;
    }

    if (
      query.includes("attraction") ||
      query.includes("places") ||
      query.includes("visit")
    ) {
      Alert.alert(
        "Attractions",
        `${attractions.length} attractions are available below.`
      );

      return;
    }

    if (query.includes("hospital")) {
      emergency(
        "Hospital",
        "/hospital"
      );

      return;
    }

    if (query.includes("police")) {
      emergency(
        "Police",
        "/police"
      );

      return;
    }

    if (query.includes("fuel")) {
      emergency(
        "Emergency Fuel",
        "/fuel"
      );

      return;
    }

    if (query.includes("mechanic")) {
      emergency(
        "Mechanic",
        "/mechanic"
      );

      return;
    }

    Alert.alert(
      "Search",
      `Search results for "${search}" are available in your trip information.`
    );
  };

  // ======================================================
  // EMERGENCY
  // ======================================================

  const emergency = async (
    title: string,
    endpoint: string
  ) => {
    try {
      const response = await fetch(
        `${API}${endpoint}`
      );

      const data = await response.json();

      const services =
        data.services || [];

      if (!services.length) {
        Alert.alert(
          title,
          "No services found."
        );

        return;
      }

      const service = services[0];

      Alert.alert(
        `🚨 ${title}`,

        `${service.name}

📞 ${service.phone}

📍 ${service.distance}

⏰ ${service.availability}`,

        [
          {
            text: "Call",

            onPress: () =>
              Linking.openURL(
                `tel:${service.phone}`
              ),
          },

          {
            text: "Close",
            style: "cancel",
          },
        ]
      );
    } catch {
      Alert.alert(
        title,
        "Unable to load emergency service."
      );
    }
  };

  // ======================================================
  // AI ASSISTANT
  // ======================================================

  const askAI = async (
    question?: string
  ) => {
    const text = (
      question || chatInput
    ).trim();

    if (!text) {
      Alert.alert(
        "AI Assistant",
        "Please enter a question."
      );

      return;
    }

    setMessages((previous) => [
      ...previous,

      {
        sender: "user",
        text,
      },
    ]);

    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch(
        `${API}/ai-assistant`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            question: text,
            source,
            destination,
            days: Number(days),
            travelers: Number(travelers),
            travelType,
            budget: Number(budget),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "AI request failed"
        );
      }

      setMessages((previous) => [
        ...previous,

        {
          sender: "ai",
          text:
            data.answer ||
            "No answer available.",
        },
      ]);
    } catch (error) {
      console.log(
        "AI error:",
        error
      );

      setMessages((previous) => [
        ...previous,

        {
          sender: "ai",
          text:
            "Unable to connect to SMART-ROUTE AI.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingIcon}>
          ✈️
        </Text>

        <ActivityIndicator
          size="large"
          color="#176B8C"
        />

        <Text style={styles.loadingText}>
          Preparing your smart trip...
        </Text>
      </View>
    );
  }

  // ======================================================
  // DASHBOARD
  // ======================================================

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={styles.backText}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text
              style={styles.headerTitle}
            >
              SMART-ROUTE
            </Text>

            <Text
              style={styles.headerSubtitle}
            >
              Your Smart Travel Dashboard
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>
              🚪
            </Text>

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </TouchableOpacity>

        </View>

        {/* SUMMARY */}

        <View
          style={styles.summaryCard}
        >
          <Text
            style={styles.summaryTitle}
          >
            ✈️ {source} →{" "}
            {destination}
          </Text>

          <View
            style={styles.summaryRow}
          >
            <Text
              style={styles.summaryItem}
            >
              📅 {days} Days
            </Text>

            <Text
              style={styles.summaryItem}
            >
              👥 {travelers}
            </Text>

            <Text
              style={styles.summaryItem}
            >
              💰 ₹{budget}
            </Text>
          </View>
        </View>

        {/* SEARCH */}

        <View
          style={
            styles.searchContainer
          }
        >
          <TextInput
            style={
              styles.searchInput
            }
            placeholder="🔍 Search flights, hotels, places..."
            placeholderTextColor="#82939C"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={
              performSearch
            }
          />

          <TouchableOpacity
            style={
              styles.searchButton
            }
            onPress={
              performSearch
            }
          >
            <Text
              style={
                styles.searchButtonText
              }
            >
              🔍
            </Text>
          </TouchableOpacity>
        </View>

        {/* FLIGHT */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            ✈️ Flight Details
          </Text>

          <Text
            style={styles.routeText}
          >
            {source} →{" "}
            {destination}
          </Text>

          <Text
            style={styles.description}
          >
            Search available flights between your selected Indian cities.
          </Text>

          <TouchableOpacity
            style={
              styles.flightButton
            }
            onPress={
              searchFlights
            }
          >
            <Text
              style={
                styles.flightButtonText
              }
            >
              ✈️ Search Live Flights
            </Text>
          </TouchableOpacity>

          <Text
            style={styles.demoText}
          >
            Flight search opens Google Flights for the selected route.
          </Text>
        </View>

        {/* MAP */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            🗺️ Your Route
          </Text>

          <Text
            style={styles.routeText}
          >
            {source} →{" "}
            {destination}
          </Text>

          <MapView
            style={styles.map}
            region={region}
            showsCompass
            showsScale
            showsBuildings
            showsPointsOfInterest
          >
            <Marker
              coordinate={
                sourceLocation
              }
              title={source}
              pinColor="green"
            />

            <Marker
              coordinate={
                destinationLocation
              }
              title={destination}
              pinColor="red"
            />

            <Polyline
              coordinates={[
                sourceLocation,
                destinationLocation,
              ]}
              strokeWidth={5}
            />
          </MapView>

          <TouchableOpacity
            style={
              styles.navigationButton
            }
            onPress={() =>
              openDirections(
                destination
              )
            }
          >
            <Text
              style={
                styles.navigationText
              }
            >
              🧭 Navigate to Destination
            </Text>
          </TouchableOpacity>

          <Text
            style={styles.demoText}
          >
            Navigation opens Google Maps using your device.
          </Text>
        </View>

        {/* GENERATED TRIP */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            📅 Your Generated Trip
          </Text>

          {plan?.itinerary ? (
            Array.isArray(
              plan.itinerary
            ) ? (
              plan.itinerary.map(
                (
                  day: any,
                  index: number
                ) => (
                  <View
                    key={index}
                    style={
                      styles.dayCard
                    }
                  >
                    <Text
                      style={
                        styles.dayTitle
                      }
                    >
                      Day {day.day}
                    </Text>

                    <Text
                      style={
                        styles.dayHeading
                      }
                    >
                      {day.title}
                    </Text>

                    {Array.isArray(
                      day.activities
                    ) &&
                      day.activities.map(
                        (
                          activity: string,
                          i: number
                        ) => (
                          <Text
                            key={i}
                            style={
                              styles.activity
                            }
                          >
                            • {activity}
                          </Text>
                        )
                      )}
                  </View>
                )
              )
            ) : (
              <Text
                style={
                  styles.description
                }
              >
                {String(
                  plan.itinerary
                )}
              </Text>
            )
          ) : (
            <Text
              style={
                styles.description
              }
            >
              Your personalized itinerary has been generated successfully.
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              saved &&
                styles.savedButton,
            ]}
            onPress={
              saveTrip
            }
          >
            <Text
              style={
                styles.secondaryText
              }
            >
              {saved
                ? "✅ Trip Saved"
                : "⭐ Save My Trip"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* BUDGET */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            💰 Trip Budget
          </Text>

          <Text
            style={styles.bigAmount}
          >
            ₹
            {plan?.estimatedBudget ||
              plan?.budget?.total ||
              budget}
          </Text>

          <Text
            style={styles.description}
          >
            Estimated travel budget based on your selected preferences.
          </Text>
        </View>

        {/* HOTELS */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            🏨 Hotels
          </Text>

          {hotels.length === 0 ? (
            <Text
              style={
                styles.description
              }
            >
              No hotel data available.
            </Text>
          ) : (
            hotels.map(
              (
                hotel,
                index
              ) => (
                <View
                  key={
                    hotel.id ||
                    index
                  }
                  style={
                    styles.itemCard
                  }
                >
                  <Text
                    style={
                      styles.itemTitle
                    }
                  >
                    🏨{" "}
                    {hotel.name}
                  </Text>

                  <Text
                    style={
                      styles.itemText
                    }
                  >
                    ⭐{" "}
                    {hotel.rating ||
                      "N/A"}
                  </Text>

                  <Text
                    style={
                      styles.itemText
                    }
                  >
                    💰 ₹
                    {hotel.price ||
                      "N/A"}
                    /night
                  </Text>

                  <Text
                    style={
                      styles.itemText
                    }
                  >
                    📍{" "}
                    {hotel.distance ||
                      "Distance unavailable"}
                  </Text>

                  <Text
                    style={
                      styles.itemText
                    }
                  >
                    🛏️{" "}
                    {hotel.type ||
                      "Hotel"}
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.smallButton
                    }
                    onPress={() =>
                      viewHotel(
                        hotel
                      )
                    }
                  >
                    <Text
                      style={
                        styles.smallButtonText
                      }
                    >
                      View Hotel
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )
          )}
        </View>

        {/* ATTRACTIONS */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            📍 Attractions & Places
          </Text>

          {attractions.length ===
          0 ? (
            <Text
              style={
                styles.description
              }
            >
              No attraction data available.
            </Text>
          ) : (
            attractions.map(
              (
                place,
                index
              ) => (
                <View
                  key={
                    place.id ||
                    index
                  }
                  style={
                    styles.itemCard
                  }
                >
                  <Text
                    style={
                      styles.itemTitle
                    }
                  >
                    📍{" "}
                    {place.name}
                  </Text>

                  <Text
                    style={
                      styles.itemText
                    }
                  >
                    🏷️{" "}
                    {place.category ||
                      "Attraction"}
                  </Text>

                  <Text
                    style={
                      styles.itemText
                    }
                  >
                    ⭐{" "}
                    {place.rating ||
                      "N/A"}
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.smallButton
                    }
                    onPress={() =>
                      openPlace(
                        place.name,
                        destination
                      )
                    }
                  >
                    <Text
                      style={
                        styles.smallButtonText
                      }
                    >
                      Open in Maps
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )
          )}
        </View>

        {/* TRANSPORT */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            🚗 Transport
          </Text>

          {transport.length ===
          0 ? (
            <Text
              style={
                styles.description
              }
            >
              No transport data available.
            </Text>
          ) : (
            transport.map(
              (
                item,
                index
              ) => (
                <View
                  key={
                    item.id ||
                    index
                  }
                  style={
                    styles.itemCard
                  }
                >
                  <Text
                    style={
                      styles.itemTitle
                    }
                  >
                    {item.icon ||
                      "🚗"}{" "}
                    {item.type}
                  </Text>

                  <Text
                    style={
                      styles.itemText
                    }
                  >
                    💰 ₹
                    {item.price}
                  </Text>

                  <Text
                    style={
                      styles.itemText
                    }
                  >
                    ⏱️{" "}
                    {item.duration}
                  </Text>

                  <Text
                    style={
                      styles.itemText
                    }
                  >
                    {
                      item.description
                    }
                  </Text>

                  {item.sustainable && (
                    <Text
                      style={
                        styles.greenText
                      }
                    >
                      🌱 Sustainable option
                    </Text>
                  )}

                  <TouchableOpacity
                    style={
                      styles.smallButton
                    }
                    onPress={() =>
                      selectTransport(
                        item
                      )
                    }
                  >
                    <Text
                      style={
                        styles.smallButtonText
                      }
                    >
                      Select
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )
          )}
        </View>

        {/* SUSTAINABILITY */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            🌱 Sustainable Travel
          </Text>

          {sustainability ? (
            <>
              <Text
                style={
                  styles.itemTitle
                }
              >
                🌍{" "}
                {
                  sustainability.sdg
                }
              </Text>

              <Text
                style={
                  styles.description
                }
              >
                {
                  sustainability
                    .recommendation
                    ?.reason
                }
              </Text>

              <Text
                style={
                  styles.greenText
                }
              >
                🌱 Recommended:{" "}
                {
                  sustainability
                    .recommendation
                    ?.recommendedMode
                }
              </Text>

              <Text
                style={
                  styles.description
                }
              >
                {
                  sustainability
                    .recommendation
                    ?.estimatedSavings
                }
              </Text>
            </>
          ) : (
            <Text
              style={
                styles.description
              }
            >
              Choose sustainable transport and support local businesses.
            </Text>
          )}
        </View>

        {/* EMERGENCY */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            🚨 Emergency Assistance
          </Text>

          <Text
            style={
              styles.description
            }
          >
            Quick access to emergency services while travelling in India.
          </Text>

          <View
            style={
              styles.emergencyGrid
            }
          >
            <TouchableOpacity
              style={
                styles.emergencyButton
              }
              onPress={() =>
                emergency(
                  "Hospital",
                  "/hospital"
                )
              }
            >
              <Text
                style={
                  styles.emergencyIcon
                }
              >
                🏥
              </Text>

              <Text
                style={
                  styles.emergencyText
                }
              >
                Hospital
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.emergencyButton
              }
              onPress={() =>
                emergency(
                  "Police",
                  "/police"
                )
              }
            >
              <Text
                style={
                  styles.emergencyIcon
                }
              >
                👮
              </Text>

              <Text
                style={
                  styles.emergencyText
                }
              >
                Police
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.emergencyButton
              }
              onPress={() =>
                emergency(
                  "Fuel",
                  "/fuel"
                )
              }
            >
              <Text
                style={
                  styles.emergencyIcon
                }
              >
                ⛽
              </Text>

              <Text
                style={
                  styles.emergencyText
                }
              >
                Fuel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.emergencyButton
              }
              onPress={() =>
                emergency(
                  "Mechanic",
                  "/mechanic"
                )
              }
            >
              <Text
                style={
                  styles.emergencyIcon
                }
              >
                🔧
              </Text>

              <Text
                style={
                  styles.emergencyText
                }
              >
                Mechanic
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI ASSISTANT */}

        <View style={styles.card}>
          <Text
            style={styles.title}
          >
            🤖 SMART-ROUTE AI
          </Text>

          <Text
            style={
              styles.description
            }
          >
            Ask about your destination, itinerary, hotels, flights, transport or anything related to your trip.
          </Text>

          {messages.map(
            (
              message,
              index
            ) => (
              <View
                key={index}
                style={[
                  styles.message,
                  message.sender ===
                  "user"
                    ? styles.userMessage
                    : styles.aiMessage,
                ]}
              >
                <Text
                  style={
                    styles.messageText
                  }
                >
                  {message.sender ===
                  "user"
                    ? "You: "
                    : "🤖 AI: "}
                  {message.text}
                </Text>
              </View>
            )
          )}

          <TextInput
            style={
              styles.chatInput
            }
            placeholder="Ask your travel question..."
            placeholderTextColor="#82939C"
            value={chatInput}
            onChangeText={
              setChatInput
            }
            multiline
          />

          <TouchableOpacity
            style={
              styles.aiButton
            }
            onPress={() =>
              askAI()
            }
            disabled={
              chatLoading
            }
          >
            {chatLoading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.aiButtonText
                }
              >
                🤖 ASK AI
              </Text>
            )}
          </TouchableOpacity>

          <View
            style={
              styles.questionRow
            }
          >
            <TouchableOpacity
              style={
                styles.questionButton
              }
              onPress={() =>
                askAI(
                  "What should I visit on Day 2?"
                )
              }
            >
              <Text>
                Day 2?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.questionButton
              }
              onPress={() =>
                askAI(
                  "What is the best transport option?"
                )
              }
            >
              <Text>
                Transport?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PLAN ANOTHER TRIP */}

        <TouchableOpacity
          style={
            styles.homeButton
          }
          onPress={() =>
            router.replace(
              "/(tabs)"
            )
          }
        >
          <Text
            style={
              styles.homeButtonText
            }
          >
            🏠 Plan Another Trip
          </Text>
        </TouchableOpacity>

        <View
          style={{ height: 50 }}
        />

      </ScrollView>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EDF7FB",
  },

  container: {
    padding: 18,
    paddingTop: 45,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF7FB",
  },

  loadingIcon: {
    fontSize: 55,
    marginBottom: 20,
  },

  loadingText: {
    marginTop: 15,
    color: "#174A70",
    fontSize: 16,
    fontWeight: "600",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  headerInfo: {
    flex: 1,
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

  logoutButton: {
    backgroundColor: "#FDECEC",
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  logoutIcon: {
    fontSize: 17,
  },

  logoutText: {
    color: "#C0392B",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  summaryCard: {
    backgroundColor: "#176B8C",
    borderRadius: 22,
    padding: 20,
    marginBottom: 15,
    elevation: 5,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryItem: {
    color: "#E7F7FC",
    fontSize: 13,
    fontWeight: "600",
  },

  searchContainer: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 5,
    marginBottom: 15,
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 14,
    color: "#222",
  },

  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#287A9D",
    alignItems: "center",
    justifyContent: "center",
  },

  searchButtonText: {
    fontSize: 19,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 19,
    marginBottom: 16,
    elevation: 4,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#174A70",
    marginBottom: 10,
  },

  routeText: {
    color: "#536871",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },

  description: {
    color: "#596A72",
    fontSize: 14,
    lineHeight: 21,
  },

  map: {
    width: "100%",
    height: 300,
    borderRadius: 17,
  },

  flightButton: {
    backgroundColor: "#176B8C",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 14,
  },

  flightButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  navigationButton: {
    backgroundColor: "#176B8C",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 12,
  },

  navigationText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  demoText: {
    color: "#82939C",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  dayCard: {
    backgroundColor: "#F4FAFC",
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DCE8EE",
  },

  dayTitle: {
    color: "#176B8C",
    fontSize: 18,
    fontWeight: "800",
  },

  dayHeading: {
    color: "#293B44",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 7,
  },

  activity: {
    color: "#4A5A61",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 3,
  },

  bigAmount: {
    color: "#176B8C",
    fontSize: 30,
    fontWeight: "900",
    marginVertical: 5,
  },

  itemCard: {
    backgroundColor: "#F5FAFC",
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DCE8EE",
  },

  itemTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#174A70",
    marginBottom: 5,
  },

  itemText: {
    color: "#53656D",
    fontSize: 14,
    marginTop: 5,
  },

  smallButton: {
    backgroundColor: "#287A9D",
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  smallButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#EAF6FA",
    paddingVertical: 13,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 15,
  },

  savedButton: {
    backgroundColor: "#DFF4E8",
  },

  secondaryText: {
    color: "#176B8C",
    fontWeight: "700",
  },

  greenText: {
    color: "#25834F",
    fontWeight: "700",
    marginTop: 10,
    lineHeight: 21,
  },

  emergencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  emergencyButton: {
    width: "48%",
    backgroundColor: "#F8FBFC",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DCE8EE",
  },

  emergencyIcon: {
    fontSize: 30,
    marginBottom: 6,
  },

  emergencyText: {
    color: "#174A70",
    fontWeight: "700",
  },

  message: {
    padding: 13,
    borderRadius: 14,
    marginTop: 8,
    maxWidth: "92%",
  },

  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCEFF7",
  },

  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F7F9",
    borderWidth: 1,
    borderColor: "#DCE8EE",
  },

  messageText: {
    color: "#344A55",
    fontSize: 14,
    lineHeight: 21,
  },

  chatInput: {
    minHeight: 55,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: "#CFDEE5",
    borderRadius: 14,
    backgroundColor: "#F8FBFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 15,
    color: "#222",
    textAlignVertical: "top",
  },

  aiButton: {
    backgroundColor: "#176B8C",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  aiButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },

  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  questionButton: {
    width: "48%",
    backgroundColor: "#EEF7FA",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },

  homeButton: {
    backgroundColor: "#174A70",
    borderRadius: 16,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});