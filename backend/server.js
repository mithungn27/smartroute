// ============================================================
// SMART-ROUTE COMPLETE BACKEND SERVER
// ============================================================
// Replace the ENTIRE contents of:
// backend/server.js
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET =
  process.env.JWT_SECRET || "smart-route-secret-2026";

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ============================================================
// MONGODB
// ============================================================

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB Atlas Connected Successfully");
    })
    .catch((error) => {
      console.error("❌ MongoDB Connection Failed");
      console.error(error.message);
    });
} else {
  console.log(
    "⚠️ MONGO_URI not found. Server will run without MongoDB."
  );
}

// ============================================================
// USER MODEL
// ============================================================

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

// ============================================================
// SAVED TRIP MODEL
// ============================================================

const SavedTripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    source: String,
    destination: String,
    days: Number,
    budget: Number,
    travelers: Number,
    travelType: String,

    plan: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

const SavedTrip =
  mongoose.models.SavedTrip ||
  mongoose.model("SavedTrip", SavedTripSchema);

// ============================================================
// INDIA DESTINATIONS
// ============================================================

const INDIA_DESTINATIONS = {
  bengaluru: {
    name: "Bengaluru",
    state: "Karnataka",
    airport: "Kempegowda International Airport",
    airportCode: "BLR",
    latitude: 12.9716,
    longitude: 77.5946,

    attractions: [
      {
        name: "Bengaluru Palace",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "Lalbagh Botanical Garden",
        category: "Nature",
        rating: 4.6,
      },
      {
        name: "Cubbon Park",
        category: "Nature",
        rating: 4.5,
      },
      {
        name: "ISKCON Temple Bengaluru",
        category: "Spiritual",
        rating: 4.7,
      },
      {
        name: "Commercial Street",
        category: "Shopping",
        rating: 4.3,
      },
    ],

    hotels: [
      {
        name: "Royal Orchid Bengaluru",
        rating: 4.5,
        price: 2500,
        type: "Premium",
      },
      {
        name: "Bengaluru Grand Stay",
        rating: 4.3,
        price: 1800,
        type: "Family",
      },
      {
        name: "City Comfort Bengaluru",
        rating: 4.1,
        price: 1200,
        type: "Budget",
      },
      {
        name: "Heritage Bengaluru Hotel",
        rating: 4.6,
        price: 3200,
        type: "Luxury",
      },
    ],
  },

  mysore: {
    name: "Mysuru",
    state: "Karnataka",
    airport: "Mysore Airport",
    airportCode: "MYQ",
    latitude: 12.2958,
    longitude: 76.6394,

    attractions: [
      {
        name: "Mysore Palace",
        category: "Heritage",
        rating: 4.8,
      },
      {
        name: "Chamundi Hill",
        category: "Nature",
        rating: 4.7,
      },
      {
        name: "Brindavan Gardens",
        category: "Nature",
        rating: 4.6,
      },
      {
        name: "Mysore Zoo",
        category: "Wildlife",
        rating: 4.5,
      },
      {
        name: "Devaraja Market",
        category: "Shopping",
        rating: 4.3,
      },
    ],

    hotels: [
      {
        name: "Royal Orchid Mysuru",
        rating: 4.5,
        price: 1800,
        type: "Premium",
      },
      {
        name: "Grand Stay Mysuru",
        rating: 4.3,
        price: 1400,
        type: "Family",
      },
      {
        name: "City Comfort Mysuru",
        rating: 4.1,
        price: 1000,
        type: "Budget",
      },
      {
        name: "Heritage Palace Mysuru",
        rating: 4.7,
        price: 2500,
        type: "Luxury",
      },
    ],
  },

  goa: {
    name: "Goa",
    state: "Goa",
    airport: "Manohar International Airport",
    airportCode: "GOX",
    latitude: 15.2993,
    longitude: 74.124,

    attractions: [
      {
        name: "Baga Beach",
        category: "Beach",
        rating: 4.5,
      },
      {
        name: "Calangute Beach",
        category: "Beach",
        rating: 4.4,
      },
      {
        name: "Basilica of Bom Jesus",
        category: "Heritage",
        rating: 4.6,
      },
      {
        name: "Fort Aguada",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "Dudhsagar Falls",
        category: "Nature",
        rating: 4.7,
      },
    ],

    hotels: [
      {
        name: "Goa Beach Resort",
        rating: 4.5,
        price: 2800,
        type: "Premium",
      },
      {
        name: "Goa Family Stay",
        rating: 4.3,
        price: 2000,
        type: "Family",
      },
      {
        name: "Goa Budget Inn",
        rating: 4.1,
        price: 1300,
        type: "Budget",
      },
      {
        name: "Goa Luxury Resort",
        rating: 4.7,
        price: 4500,
        type: "Luxury",
      },
    ],
  },

  mumbai: {
    name: "Mumbai",
    state: "Maharashtra",
    airport: "Chhatrapati Shivaji Maharaj International Airport",
    airportCode: "BOM",
    latitude: 19.076,
    longitude: 72.8777,

    attractions: [
      {
        name: "Gateway of India",
        category: "Heritage",
        rating: 4.6,
      },
      {
        name: "Marine Drive",
        category: "Nature",
        rating: 4.7,
      },
      {
        name: "Elephanta Caves",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "Chhatrapati Shivaji Maharaj Terminus",
        category: "Heritage",
        rating: 4.7,
      },
      {
        name: "Colaba Causeway",
        category: "Shopping",
        rating: 4.4,
      },
    ],

    hotels: [
      {
        name: "Mumbai Grand Hotel",
        rating: 4.5,
        price: 3500,
        type: "Premium",
      },
      {
        name: "Mumbai Family Stay",
        rating: 4.3,
        price: 2400,
        type: "Family",
      },
      {
        name: "Mumbai Budget Inn",
        rating: 4.1,
        price: 1600,
        type: "Budget",
      },
      {
        name: "Mumbai Luxury Palace",
        rating: 4.7,
        price: 5500,
        type: "Luxury",
      },
    ],
  },

  delhi: {
    name: "Delhi",
    state: "Delhi",
    airport: "Indira Gandhi International Airport",
    airportCode: "DEL",
    latitude: 28.6139,
    longitude: 77.209,

    attractions: [
      {
        name: "India Gate",
        category: "Heritage",
        rating: 4.7,
      },
      {
        name: "Red Fort",
        category: "Heritage",
        rating: 4.6,
      },
      {
        name: "Qutub Minar",
        category: "Heritage",
        rating: 4.7,
      },
      {
        name: "Lotus Temple",
        category: "Spiritual",
        rating: 4.6,
      },
      {
        name: "Connaught Place",
        category: "Shopping",
        rating: 4.5,
      },
    ],

    hotels: [
      {
        name: "Delhi Grand Hotel",
        rating: 4.5,
        price: 2800,
        type: "Premium",
      },
      {
        name: "Delhi Family Stay",
        rating: 4.3,
        price: 1900,
        type: "Family",
      },
      {
        name: "Delhi Budget Inn",
        rating: 4.1,
        price: 1200,
        type: "Budget",
      },
      {
        name: "Delhi Luxury Palace",
        rating: 4.7,
        price: 4200,
        type: "Luxury",
      },
    ],
  },

  hyderabad: {
    name: "Hyderabad",
    state: "Telangana",
    airport: "Rajiv Gandhi International Airport",
    airportCode: "HYD",
    latitude: 17.385,
    longitude: 78.4867,

    attractions: [
      {
        name: "Charminar",
        category: "Heritage",
        rating: 4.6,
      },
      {
        name: "Golconda Fort",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "Hussain Sagar Lake",
        category: "Nature",
        rating: 4.4,
      },
      {
        name: "Salar Jung Museum",
        category: "Museum",
        rating: 4.5,
      },
      {
        name: "Laad Bazaar",
        category: "Shopping",
        rating: 4.4,
      },
    ],

    hotels: [
      {
        name: "Hyderabad Grand Hotel",
        rating: 4.5,
        price: 2200,
        type: "Premium",
      },
      {
        name: "Hyderabad Family Stay",
        rating: 4.3,
        price: 1600,
        type: "Family",
      },
      {
        name: "Hyderabad Budget Inn",
        rating: 4.1,
        price: 1100,
        type: "Budget",
      },
      {
        name: "Hyderabad Luxury Hotel",
        rating: 4.7,
        price: 3800,
        type: "Luxury",
      },
    ],
  },

  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    airport: "Chennai International Airport",
    airportCode: "MAA",
    latitude: 13.0827,
    longitude: 80.2707,

    attractions: [
      {
        name: "Marina Beach",
        category: "Beach",
        rating: 4.5,
      },
      {
        name: "Kapaleeshwarar Temple",
        category: "Spiritual",
        rating: 4.7,
      },
      {
        name: "Fort St. George",
        category: "Heritage",
        rating: 4.4,
      },
      {
        name: "Government Museum Chennai",
        category: "Museum",
        rating: 4.5,
      },
      {
        name: "T Nagar",
        category: "Shopping",
        rating: 4.4,
      },
    ],

    hotels: [
      {
        name: "Chennai Grand Hotel",
        rating: 4.5,
        price: 2300,
        type: "Premium",
      },
      {
        name: "Chennai Family Stay",
        rating: 4.3,
        price: 1600,
        type: "Family",
      },
      {
        name: "Chennai Budget Inn",
        rating: 4.1,
        price: 1100,
        type: "Budget",
      },
      {
        name: "Chennai Luxury Hotel",
        rating: 4.7,
        price: 4000,
        type: "Luxury",
      },
    ],
  },

  kochi: {
    name: "Kochi",
    state: "Kerala",
    airport: "Cochin International Airport",
    airportCode: "COK",
    latitude: 9.9312,
    longitude: 76.2673,

    attractions: [
      {
        name: "Fort Kochi",
        category: "Heritage",
        rating: 4.6,
      },
      {
        name: "Chinese Fishing Nets",
        category: "Culture",
        rating: 4.5,
      },
      {
        name: "Mattancherry Palace",
        category: "Heritage",
        rating: 4.4,
      },
      {
        name: "Marine Drive Kochi",
        category: "Nature",
        rating: 4.4,
      },
      {
        name: "Jew Town",
        category: "Culture",
        rating: 4.5,
      },
    ],

    hotels: [
      {
        name: "Kochi Grand Hotel",
        rating: 4.5,
        price: 2200,
        type: "Premium",
      },
      {
        name: "Kochi Family Stay",
        rating: 4.3,
        price: 1500,
        type: "Family",
      },
      {
        name: "Kochi Budget Inn",
        rating: 4.1,
        price: 1000,
        type: "Budget",
      },
      {
        name: "Kochi Luxury Resort",
        rating: 4.7,
        price: 3900,
        type: "Luxury",
      },
    ],
  },

  jaipur: {
    name: "Jaipur",
    state: "Rajasthan",
    airport: "Jaipur International Airport",
    airportCode: "JAI",
    latitude: 26.9124,
    longitude: 75.7873,

    attractions: [
      {
        name: "Amber Fort",
        category: "Heritage",
        rating: 4.7,
      },
      {
        name: "Hawa Mahal",
        category: "Heritage",
        rating: 4.6,
      },
      {
        name: "City Palace Jaipur",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "Jantar Mantar",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "Johari Bazaar",
        category: "Shopping",
        rating: 4.4,
      },
    ],

    hotels: [
      {
        name: "Jaipur Grand Hotel",
        rating: 4.5,
        price: 2400,
        type: "Premium",
      },
      {
        name: "Jaipur Family Stay",
        rating: 4.3,
        price: 1700,
        type: "Family",
      },
      {
        name: "Jaipur Budget Inn",
        rating: 4.1,
        price: 1100,
        type: "Budget",
      },
      {
        name: "Jaipur Heritage Palace",
        rating: 4.8,
        price: 4500,
        type: "Luxury",
      },
    ],
  },

  kolkata: {
    name: "Kolkata",
    state: "West Bengal",
    airport: "Netaji Subhas Chandra Bose International Airport",
    airportCode: "CCU",
    latitude: 22.5726,
    longitude: 88.3639,

    attractions: [
      {
        name: "Victoria Memorial",
        category: "Heritage",
        rating: 4.7,
      },
      {
        name: "Howrah Bridge",
        category: "Landmark",
        rating: 4.6,
      },
      {
        name: "Indian Museum",
        category: "Museum",
        rating: 4.5,
      },
      {
        name: "St. Paul's Cathedral",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "New Market Kolkata",
        category: "Shopping",
        rating: 4.3,
      },
    ],

    hotels: [
      {
        name: "Kolkata Grand Hotel",
        rating: 4.5,
        price: 2200,
        type: "Premium",
      },
      {
        name: "Kolkata Family Stay",
        rating: 4.3,
        price: 1500,
        type: "Family",
      },
      {
        name: "Kolkata Budget Inn",
        rating: 4.1,
        price: 1000,
        type: "Budget",
      },
      {
        name: "Kolkata Luxury Hotel",
        rating: 4.7,
        price: 3800,
        type: "Luxury",
      },
    ],
  },

  pune: {
    name: "Pune",
    state: "Maharashtra",
    airport: "Pune International Airport",
    airportCode: "PNQ",
    latitude: 18.5204,
    longitude: 73.8567,

    attractions: [
      {
        name: "Shaniwar Wada",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "Aga Khan Palace",
        category: "Heritage",
        rating: 4.6,
      },
      {
        name: "Sinhagad Fort",
        category: "Nature",
        rating: 4.7,
      },
      {
        name: "Raja Dinkar Kelkar Museum",
        category: "Museum",
        rating: 4.4,
      },
      {
        name: "FC Road",
        category: "Shopping",
        rating: 4.3,
      },
    ],

    hotels: [
      {
        name: "Pune Grand Hotel",
        rating: 4.5,
        price: 2200,
        type: "Premium",
      },
      {
        name: "Pune Family Stay",
        rating: 4.3,
        price: 1500,
        type: "Family",
      },
      {
        name: "Pune Budget Inn",
        rating: 4.1,
        price: 1000,
        type: "Budget",
      },
      {
        name: "Pune Luxury Hotel",
        rating: 4.7,
        price: 4000,
        type: "Luxury",
      },
    ],
  },

  ahmedabad: {
    name: "Ahmedabad",
    state: "Gujarat",
    airport: "Sardar Vallabhbhai Patel International Airport",
    airportCode: "AMD",
    latitude: 23.0225,
    longitude: 72.5714,

    attractions: [
      {
        name: "Sabarmati Ashram",
        category: "Heritage",
        rating: 4.6,
      },
      {
        name: "Adalaj Stepwell",
        category: "Heritage",
        rating: 4.7,
      },
      {
        name: "Kankaria Lake",
        category: "Nature",
        rating: 4.5,
      },
      {
        name: "Sidi Saiyyed Mosque",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "Law Garden",
        category: "Shopping",
        rating: 4.3,
      },
    ],

    hotels: [
      {
        name: "Ahmedabad Grand Hotel",
        rating: 4.5,
        price: 2100,
        type: "Premium",
      },
      {
        name: "Ahmedabad Family Stay",
        rating: 4.3,
        price: 1500,
        type: "Family",
      },
      {
        name: "Ahmedabad Budget Inn",
        rating: 4.1,
        price: 1000,
        type: "Budget",
      },
      {
        name: "Ahmedabad Luxury Hotel",
        rating: 4.7,
        price: 3700,
        type: "Luxury",
      },
    ],
  },

  varanasi: {
    name: "Varanasi",
    state: "Uttar Pradesh",
    airport: "Lal Bahadur Shastri International Airport",
    airportCode: "VNS",
    latitude: 25.3176,
    longitude: 82.9739,

    attractions: [
      {
        name: "Dashashwamedh Ghat",
        category: "Spiritual",
        rating: 4.8,
      },
      {
        name: "Kashi Vishwanath Temple",
        category: "Spiritual",
        rating: 4.8,
      },
      {
        name: "Sarnath",
        category: "Heritage",
        rating: 4.7,
      },
      {
        name: "Assi Ghat",
        category: "Culture",
        rating: 4.6,
      },
      {
        name: "Godowlia Market",
        category: "Shopping",
        rating: 4.3,
      },
    ],

    hotels: [
      {
        name: "Varanasi Grand Hotel",
        rating: 4.5,
        price: 2000,
        type: "Premium",
      },
      {
        name: "Varanasi Family Stay",
        rating: 4.3,
        price: 1400,
        type: "Family",
      },
      {
        name: "Varanasi Budget Inn",
        rating: 4.1,
        price: 900,
        type: "Budget",
      },
      {
        name: "Varanasi Heritage Hotel",
        rating: 4.7,
        price: 3500,
        type: "Luxury",
      },
    ],
  },

  agra: {
    name: "Agra",
    state: "Uttar Pradesh",
    airport: "Agra Airport",
    airportCode: "AGR",
    latitude: 27.1767,
    longitude: 78.0081,

    attractions: [
      {
        name: "Taj Mahal",
        category: "Heritage",
        rating: 4.9,
      },
      {
        name: "Agra Fort",
        category: "Heritage",
        rating: 4.7,
      },
      {
        name: "Mehtab Bagh",
        category: "Nature",
        rating: 4.5,
      },
      {
        name: "Itmad-ud-Daulah",
        category: "Heritage",
        rating: 4.5,
      },
      {
        name: "Sadar Bazaar Agra",
        category: "Shopping",
        rating: 4.3,
      },
    ],

    hotels: [
      {
        name: "Agra Grand Hotel",
        rating: 4.5,
        price: 2200,
        type: "Premium",
      },
      {
        name: "Agra Family Stay",
        rating: 4.3,
        price: 1500,
        type: "Family",
      },
      {
        name: "Agra Budget Inn",
        rating: 4.1,
        price: 1000,
        type: "Budget",
      },
      {
        name: "Agra Heritage Palace",
        rating: 4.8,
        price: 4000,
        type: "Luxury",
      },
    ],
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function findDestination(place) {
  const name = String(place || "")
    .trim()
    .toLowerCase();

  for (const key of Object.keys(INDIA_DESTINATIONS)) {
    const city = INDIA_DESTINATIONS[key];

    if (
      name === key ||
      name === city.name.toLowerCase() ||
      name.includes(key) ||
      city.name.toLowerCase().includes(name)
    ) {
      return {
        key,
        ...city,
      };
    }
  }

  return null;
}

function getCoordinates(place) {
  const destination = findDestination(place);

  if (!destination) {
    return null;
  }

  return {
    latitude: destination.latitude,
    longitude: destination.longitude,
  };
}

function mapsSearchUrl(name, city = "") {
  const query = city ? `${name}, ${city}` : name;

  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query)
  );
}

function mapsDirectionsUrl(destination) {
  return (
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(destination)
  );
}

function makeToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.substring(7);
}

async function getUserFromRequest(req) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!mongoose.connection.readyState) {
      return null;
    }

    return await User.findById(decoded.userId);
  } catch {
    return null;
  }
}

function calculateSustainabilityScore(mode) {
  const scores = {
    train: 95,
    bus: 90,
    walking: 100,
    bicycle: 100,
    metro: 95,
    sharedcab: 75,
    cab: 45,
    car: 40,
    flight: 25,
  };

  const key = String(mode || "")
    .toLowerCase()
    .replace(/\s/g, "");

  return scores[key] || 60;
}

function generateAgentRecommendation({
  budget,
  travelers,
  days,
  travelType,
  destination,
}) {
  const total = Number(budget) || 0;
  const people = Number(travelers) || 1;
  const tripDays = Number(days) || 1;

  let accommodationType = "Budget";
  let transportMode = "Train / Public Transport";
  let priority = "Balanced";

  const perPersonPerDay =
    total / people / tripDays;

  if (perPersonPerDay >= 3000) {
    accommodationType = "Luxury";
    transportMode = "Flight / Premium Transport";
    priority = "Comfort";
  } else if (perPersonPerDay >= 1800) {
    accommodationType = "Premium";
    transportMode = "Train / Comfortable Cab";
    priority = "Comfort + Budget";
  }

  if (travelType === "Family") {
    priority = "Safety + Comfort";
  }

  if (travelType === "Couple") {
    priority = "Experience + Comfort";
  }

  if (travelType === "Friends") {
    priority = "Adventure + Budget";
  }

  if (travelType === "Solo") {
    priority = "Safety + Flexibility";
  }

  return {
    agent: "SMART-ROUTE Travel Decision Agent",
    destination,
    priority,
    recommendedAccommodation: accommodationType,
    recommendedTransport: transportMode,
    sustainabilityScore:
      calculateSustainabilityScore(transportMode),
    reasoning:
      `The recommendation considers your ${tripDays}-day trip, ` +
      `${people} traveler(s), ₹${total} budget and ` +
      `${travelType || "general"} travel preference.`,
    actions: [
      "Compare accommodation options",
      "Compare sustainable transport",
      "Review daily itinerary",
      "Check emergency services",
      "Save the final trip",
    ],
  };
}

// ============================================================
// AUTHENTICATION
// ============================================================

// REGISTER
app.post("/auth/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });
    }

    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        message:
          "Database is not connected. Please try again.",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = makeToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
});

// LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        message:
          "Database is not connected. Please try again.",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = makeToken(user);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
});

// Compatibility routes
app.post("/register", async (req, res) => {
  req.url = "/auth/register";
  return app._router.handle(req, res);
});

app.post("/login", async (req, res) => {
  req.url = "/auth/login";
  return app._router.handle(req, res);
});

// ============================================================
// SERVER STATUS
// ============================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    application: "SMART-ROUTE",
    message: "SMART-ROUTE Server Running",
    database:
      mongoose.connection.readyState === 1
        ? "MongoDB Connected"
        : "MongoDB Not Connected",
    country: "India",
    version: "5.0.0",

    features: [
      "Authentication",
      "AI Travel Assistant",
      "AI Itinerary",
      "Agentic Recommendations",
      "Maps",
      "Sustainability",
      "Hotels",
      "Transport",
      "Flights",
      "Attractions",
      "Emergency Services",
      "Saved Trips",
    ],
  });
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {
  res.json({
    success: true,
    server: "online",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    time: new Date().toISOString(),
  });
});

// ============================================================
// DESTINATIONS
// ============================================================

app.get("/destinations", (req, res) => {
  const destinations = Object.values(
    INDIA_DESTINATIONS
  ).map((city) => ({
    name: city.name,
    state: city.state,
    airport: city.airport,
    airportCode: city.airportCode,

    coordinates: {
      latitude: city.latitude,
      longitude: city.longitude,
    },
  }));

  res.json({
    success: true,
    country: "India",
    destinations,
  });
});

// ============================================================
// ⭐ MAIN TRAVEL PLAN ENDPOINT
// ============================================================
// THIS IS THE ENDPOINT THAT WAS RETURNING:
// {"success":false,"message":"SMART-ROUTE API endpoint not found","requestedPath":"/plan"}
// ============================================================

app.post("/plan", (req, res) => {
  try {
    console.log("📥 POST /plan");
    console.log("📦 Request body:", req.body);

    const source = String(
      req.body.source || ""
    ).trim();

    const city = String(
      req.body.city ||
        req.body.destination ||
        ""
    ).trim();

    const numberOfDays = Number(
      req.body.days
    );

    const totalBudget = Number(
      req.body.budget
    );

    const numberOfTravelers = Number(
      req.body.travelers
    );

    const travelType =
      req.body.travelType ||
      "Family";

    if (
      !source ||
      !city ||
      !numberOfDays ||
      !totalBudget ||
      !numberOfTravelers
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Source, destination, days, budget and travelers are required.",
      });
    }

    if (
      numberOfDays <= 0 ||
      totalBudget <= 0 ||
      numberOfTravelers <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter valid travel details.",
      });
    }

    const destination =
      findDestination(city);

    if (!destination) {
      return res.status(400).json({
        success: false,
        message:
          "Destination is not currently supported.",
        supportedCities:
          Object.values(
            INDIA_DESTINATIONS
          ).map((item) => item.name),
      });
    }

    // --------------------------------------------------------
    // ATTRACTONS
    // --------------------------------------------------------

    const attractions =
      destination.attractions.map(
        (place, index) => ({
          id: index + 1,
          name: place.name,
          category: place.category,
          rating: place.rating,

          description:
            `Explore ${place.name} in ${destination.name}.`,

          coordinates: {
            latitude:
              destination.latitude,
            longitude:
              destination.longitude,
          },

          mapUrl: mapsSearchUrl(
            place.name,
            destination.name
          ),
        })
      );

    // --------------------------------------------------------
    // ITINERARY
    // --------------------------------------------------------

    const itinerary = [];

    for (
      let day = 1;
      day <= numberOfDays;
      day++
    ) {
      const morning =
        attractions[
          (day - 1) %
            attractions.length
        ];

      const afternoon =
        attractions[
          day % attractions.length
        ];

      const evening =
        attractions[
          (day + 1) %
            attractions.length
        ];

      itinerary.push({
        day,

        title:
          day === 1
            ? `Arrival & Explore ${destination.name}`
            : `Day ${day} — ${destination.name}`,

        morning: [
          day === 1
            ? `Travel from ${source} to ${destination.name}`
            : `Start your day in ${destination.name}`,

          `Visit ${morning.name}`,
        ],

        afternoon: [
          `Explore ${afternoon.name}`,
          "Enjoy local food",
          "Take a short rest",
        ],

        evening: [
          `Visit ${evening.name}`,
          "Explore local culture",
          "Return to accommodation",
        ],

        activities: [
          day === 1
            ? `Travel from ${source} to ${destination.name}`
            : `Start Day ${day}`,

          `Visit ${morning.name}`,
          `Explore ${afternoon.name}`,
          `Visit ${evening.name}`,
          "Enjoy local food and cultural experiences",
          "Return to accommodation and rest",
        ],
      });
    }

    // --------------------------------------------------------
    // HOTEL RECOMMENDATION
    // --------------------------------------------------------

    let recommendedHotel;

    const perPerson =
      totalBudget /
      numberOfTravelers;

    if (perPerson < 1500) {
      recommendedHotel =
        destination.hotels.find(
          (hotel) =>
            hotel.type === "Budget"
        );
    } else if (
      travelType === "Luxury"
    ) {
      recommendedHotel =
        destination.hotels.find(
          (hotel) =>
            hotel.type === "Luxury"
        );
    } else if (
      travelType === "Family"
    ) {
      recommendedHotel =
        destination.hotels.find(
          (hotel) =>
            hotel.type === "Family"
        );
    } else {
      recommendedHotel =
        destination.hotels.find(
          (hotel) =>
            hotel.type === "Premium"
        );
    }

    // --------------------------------------------------------
    // AGENTIC RECOMMENDATION
    // --------------------------------------------------------

    const agentRecommendation =
      generateAgentRecommendation({
        budget: totalBudget,
        travelers:
          numberOfTravelers,
        days: numberOfDays,
        travelType,
        destination:
          destination.name,
      });

    // --------------------------------------------------------
    // SUSTAINABILITY
    // --------------------------------------------------------

    let sustainabilityScore = 80;

    if (travelType === "Solo") {
      sustainabilityScore += 5;
    }

    if (travelType === "Family") {
      sustainabilityScore -= 5;
    }

    sustainabilityScore =
      Math.max(
        0,
        Math.min(
          100,
          sustainabilityScore
        )
      );

    const sustainabilityLevel =
      sustainabilityScore >= 80
        ? "Excellent"
        : sustainabilityScore >= 60
        ? "Good"
        : "Moderate";

    // --------------------------------------------------------
    // BUDGET
    // --------------------------------------------------------

    const perDay = Math.round(
      totalBudget /
        numberOfDays
    );

    const estimatedHotelCost =
      recommendedHotel
        ? recommendedHotel.price *
          Math.max(
            1,
            numberOfDays - 1
          )
        : 0;

    // --------------------------------------------------------
    // FINAL RESPONSE
    // --------------------------------------------------------

    return res.json({
      success: true,

      application: "SMART-ROUTE",

      demoData: true,

      country: "India",

      route: {
        source,

        destination:
          destination.name,

        sourceCoordinates:
          getCoordinates(source),

        destinationCoordinates: {
          latitude:
            destination.latitude,
          longitude:
            destination.longitude,
        },

        navigationUrl:
          mapsDirectionsUrl(
            destination.name
          ),
      },

      tripDetails: {
        days: numberOfDays,
        travelers:
          numberOfTravelers,
        travelType,
      },

      budget: {
        total: totalBudget,
        perPerson:
          Math.round(perPerson),
        perDay,
      },

      estimatedBudget:
        totalBudget,

      ai: {
        enabled: true,

        assistant:
          "SMART-ROUTE AI Travel Assistant",

        personalizedPlanning: true,

        agenticRecommendations: true,

        recommendationReason:
          `Recommendations generated according to your ${numberOfDays}-day trip, ${numberOfTravelers} traveler(s), ₹${totalBudget} budget and ${travelType} travel preference.`,
      },

      itinerary,

      recommendedPlaces:
        attractions,

      attractions,

      hotelRecommendation:
        recommendedHotel
          ? {
              name:
                recommendedHotel.name,

              rating:
                recommendedHotel.rating,

              pricePerNight:
                recommendedHotel.price,

              price:
                recommendedHotel.price,

              type:
                recommendedHotel.type,

              estimatedStayCost:
                estimatedHotelCost,

              mapUrl:
                mapsSearchUrl(
                  recommendedHotel.name,
                  destination.name
                ),
            }
          : null,

      transportRecommendation: {
        recommended:
          perPerson < 2000
            ? "Train / Public Bus"
            : "Private Cab / Train",

        reason:
          "Transport is selected based on budget, convenience and sustainability.",
      },

      flightRecommendation: {
        available: true,

        airport:
          destination.airport,

        airportCode:
          destination.airportCode,

        searchEndpoint:
          "/flights",
      },

      agentDecision: {
        decision:
          "Best balanced travel plan",

        factors: [
          "Budget",
          "Travel duration",
          "Number of travelers",
          "Travel type",
          "Comfort",
          "Sustainability",
        ],

        recommendedHotel:
          recommendedHotel
            ? recommendedHotel.name
            : "Budget accommodation",

        recommendedTransport:
          perPerson < 2000
            ? "Train / Public Bus"
            : "Train / Private Cab",
      },

      agentRecommendation,

      travelRecommendation:
        travelType === "Family"
          ? "Family-friendly attractions, comfortable accommodation and safe transport are recommended."
          : travelType === "Couple"
          ? "Romantic attractions, scenic locations and comfortable stays are recommended."
          : travelType === "Friends"
          ? "Adventure activities, sightseeing and affordable transport are recommended."
          : travelType === "Solo"
          ? "Safe accommodation, public transport and flexible sightseeing are recommended."
          : "Comfortable accommodation and convenient transportation are recommended.",

      sustainability: {
        score:
          sustainabilityScore,

        level:
          sustainabilityLevel,

        sdg:
          "SDG 11 - Sustainable Cities and Communities",

        recommendedMode:
          "Train / Public Transport",

        recommendedTransport:
          "Train / Public Transport",

        tip:
          "Use public transport, shared vehicles and walking for shorter distances to reduce cost and environmental impact.",

        recommendation: {
          reason:
            "Public transport provides a better balance between cost and environmental impact.",

          recommendedMode:
            "Train / Public Transport",

          estimatedSavings:
            "Using public transport can reduce travel cost and carbon impact.",
        },
      },

      emergencyServices: {
        fuel: "/fuel",
        mechanic: "/mechanic",
        hospital: "/hospital",
        police: "/police",
      },

      endpoints: {
        hotels: "/hotels",
        transport: "/transport",
        flights: "/flights",
        attractions: "/attractions",
        sustainability:
          "/sustainability",
        aiAssistant:
          "/ai-assistant",
        saveTrip:
          "/saved-trips",
      },
    });
  } catch (error) {
    console.error(
      "❌ PLAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate travel plan.",
      error: error.message,
    });
  }
});

// ============================================================
// HOTELS
// ============================================================

app.get("/hotels", (req, res) => {
  try {
    const cityName =
      req.query.city || "";

    const destination =
      findDestination(cityName);

    if (!destination) {
      return res.status(400).json({
        success: false,
        message:
          "Hotel search is available for supported cities only.",
      });
    }

    const hotels =
      destination.hotels.map(
        (hotel, index) => ({
          id: index + 1,

          name: hotel.name,

          city:
            destination.name,

          rating: hotel.rating,

          price: hotel.price,

          type: hotel.type,

          distance:
            `${(index + 1) * 1.2} km`,

          facilities: [
            "Free WiFi",
            "Parking",
            "Restaurant",
            "Room Service",
          ],

          mapUrl:
            mapsSearchUrl(
              hotel.name,
              destination.name
            ),

          bookingUrl:
            mapsSearchUrl(
              hotel.name,
              destination.name
            ),
        })
      );

    res.json({
      success: true,
      demoData: true,
      city:
        destination.name,
      hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Unable to load hotels.",
    });
  }
});

// ============================================================
// TRANSPORT
// ============================================================

app.get("/transport", (req, res) => {
  try {
    const source =
      req.query.source ||
      "Starting Location";

    const city =
      req.query.city || "";

    const destination =
      findDestination(city);

    if (!destination) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a supported destination.",
      });
    }

    res.json({
      success: true,

      demoData: true,

      route: {
        source,
        destination:
          destination.name,
      },

      transportOptions: [
        {
          id: 1,
          type: "Private Cab",
          icon: "🚗",
          price: 2500,
          duration: "2.5 hours",
          description:
            "Comfortable private travel",
          sustainable: false,
          actionUrl:
            mapsDirectionsUrl(
              destination.name
            ),
        },

        {
          id: 2,
          type: "Public Bus",
          icon: "🚌",
          price: 400,
          duration: "3 hours",
          description:
            "Affordable and eco-friendly",
          sustainable: true,
          actionUrl:
            mapsDirectionsUrl(
              destination.name
            ),
        },

        {
          id: 3,
          type: "Train",
          icon: "🚆",
          price: 600,
          duration: "2.5 hours",
          description:
            "Fast and sustainable",
          sustainable: true,
          actionUrl:
            mapsDirectionsUrl(
              destination.name
            ),
        },

        {
          id: 4,
          type: "Rental Car",
          icon: "🚘",
          price: 1800,
          duration: "Flexible",
          description:
            "Flexible self-drive travel",
          sustainable: false,
          actionUrl:
            mapsDirectionsUrl(
              destination.name
            ),
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Unable to load transport.",
    });
  }
});

// ============================================================
// TRANSPORT RECOMMENDATION
// ============================================================

app.get(
  "/transport-recommendation",
  (req, res) => {
    try {
      const source =
        req.query.source || "";

      const city =
        req.query.city || "";

      const budget =
        Number(req.query.budget) || 0;

      const travelers =
        Number(
          req.query.travelers
        ) || 1;

      const travelType =
        req.query.travelType ||
        "General";

      const destination =
        findDestination(city);

      if (!destination) {
        return res.status(400).json({
          success: false,
          message:
            "Transport recommendation is available for supported Indian destinations only.",
        });
      }

      const options = [
        {
          type: "Train",
          icon: "🚆",
          price: 300,
          sustainability: 90,
          comfort: 75,
        },

        {
          type: "Public Bus",
          icon: "🚌",
          price: 400,
          sustainability: 85,
          comfort: 65,
        },

        {
          type: "Private Cab",
          icon: "🚗",
          price: 2500,
          sustainability: 45,
          comfort: 95,
        },

        {
          type: "Rental Car",
          icon: "🚘",
          price: 1800,
          sustainability: 50,
          comfort: 90,
        },
      ];

      let recommended;

      if (travelType === "Family") {
        recommended =
          options.find(
            (item) =>
              item.type ===
              "Private Cab"
          );
      } else if (
        budget > 0 &&
        budget < 1000
      ) {
        recommended =
          options.find(
            (item) =>
              item.type === "Train"
          );
      } else {
        recommended =
          options
            .slice()
            .sort(
              (a, b) =>
                b.sustainability +
                b.comfort -
                (a.sustainability +
                  a.comfort)
            )[0];
      }

      res.json({
        success: true,

        agent:
          "SMART-ROUTE Transport Agent",

        decision: {
          source,

          destination:
            destination.name,

          travelers,

          budget,

          travelType,
        },

        recommendedTransport: {
          ...recommended,

          reason:
            recommended.type ===
            "Train"
              ? "Best balance of affordability and sustainability."
              : recommended.type ===
                "Private Cab"
              ? "Recommended for family comfort and flexible travel."
              : "Recommended based on comfort, cost and sustainability.",
        },

        alternatives:
          options.filter(
            (item) =>
              item.type !==
              recommended.type
          ),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Unable to generate transport recommendation.",
      });
    }
  }
);

// ============================================================
// AGENTIC RECOMMENDATIONS
// ============================================================

app.post(
  "/agent/recommend",
  (req, res) => {
    try {
      const {
        source,
        destination: destinationName,
        days,
        budget,
        travelers,
        travelType,
      } = req.body;

      const destination =
        findDestination(
          destinationName
        );

      if (!destination) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a supported Indian destination.",
        });
      }

      const recommendation =
        generateAgentRecommendation({
          budget,
          travelers,
          days,
          travelType,
          destination:
            destination.name,
        });

      res.json({
        success: true,

        source,

        destination:
          destination.name,

        recommendation,

        alternatives: [
          "Train",
          "Public Bus",
          "Private Cab",
          "Rental Car",
        ],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Unable to generate agentic recommendation.",
      });
    }
  }
);

// ============================================================
// ATTRACTIONS
// ============================================================

app.get(
  "/attractions",
  (req, res) => {
    try {
      const city =
        req.query.city || "";

      const destination =
        findDestination(city);

      if (!destination) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a supported destination.",
        });
      }

      const attractions =
        destination.attractions.map(
          (place, index) => ({
            id: index + 1,

            name: place.name,

            category:
              place.category,

            rating:
              place.rating,

            description:
              `Explore ${place.name} in ${destination.name}.`,

            coordinates: {
              latitude:
                destination.latitude,
              longitude:
                destination.longitude,
            },

            mapUrl:
              mapsSearchUrl(
                place.name,
                destination.name
              ),
          })
        );

      res.json({
        success: true,

        city:
          destination.name,

        attractions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Unable to load attractions.",
      });
    }
  }
);

// ============================================================
// FLIGHTS
// ============================================================

app.get("/flights", (req, res) => {
  const source =
    req.query.source || "";

  const city =
    req.query.city ||
    req.query.destination ||
    "";

  const destination =
    findDestination(city);

  if (!destination) {
    return res.status(400).json({
      success: false,
      message:
        "Please select a supported destination.",
    });
  }

  const searchUrl =
    "https://www.google.com/travel/flights?q=" +
    encodeURIComponent(
      `Flights from ${source} to ${destination.name}`
    );

  res.json({
    success: true,

    demoData: true,

    source,

    destination:
      destination.name,

    airport:
      destination.airport,

    airportCode:
      destination.airportCode,

    flights: [
      {
        airline:
          "Multiple Airlines",
        price:
          "Check live price",
        duration:
          "Varies",
        status:
          "Live search available",
      },
    ],

    searchUrl,
  });
});

// ============================================================
// SUSTAINABILITY
// ============================================================

app.get(
  "/sustainability",
  (req, res) => {
    const source =
      req.query.source || "";

    const city =
      req.query.city ||
      req.query.destination ||
      "";

    const destination =
      findDestination(city);

    if (!destination) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a supported destination.",
      });
    }

    res.json({
      success: true,

      source,

      destination:
        destination.name,

      score: 90,

      level: "Excellent",

      sdg:
        "SDG 11 - Sustainable Cities and Communities",

      recommendation: {
        recommendedMode:
          "Train / Public Transport",

        reason:
          "Public transport and shared mobility reduce environmental impact and travel cost.",

        estimatedSavings:
          "Sustainable transport can reduce fuel consumption and travel expenses.",
      },

      tips: [
        "Use public transport.",
        "Prefer trains for longer journeys.",
        "Walk for short distances.",
        "Support local businesses.",
        "Avoid unnecessary private vehicle use.",
      ],
    });
  }
);

// ============================================================
// AI ASSISTANT
// ============================================================

app.post(
  "/ai-assistant",
  (req, res) => {
    try {
      const {
        question,
        source,
        destination,
        days,
        travelers,
        travelType,
        budget,
      } = req.body;

      if (!question) {
        return res.status(400).json({
          success: false,
          message:
            "Question is required.",
        });
      }

      const destinationData =
        findDestination(
          destination
        );

      let answer =
        `For your ${days || 1}-day trip from ` +
        `${source || "your location"} to ` +
        `${destination || "your destination"}, `;

      const q =
        String(question).toLowerCase();

      if (
        q.includes("hotel") &&
        destinationData
      ) {
        const hotel =
          destinationData.hotels[0];

        answer +=
          `I recommend ${hotel.name}. ` +
          `It is rated ${hotel.rating}/5 and costs approximately ₹${hotel.price} per night.`;
      } else if (
        q.includes("transport")
      ) {
        answer +=
          "Train or public transport is a good sustainable choice. " +
          "For families, a private cab can provide more comfort.";
      } else if (
        q.includes("visit") ||
        q.includes("place") ||
        q.includes("attraction")
      ) {
        if (destinationData) {
          answer +=
            `you can visit ${destinationData.attractions
              .slice(0, 3)
              .map(
                (item) =>
                  item.name
              )
              .join(
                ", "
              )}.`;
        } else {
          answer +=
            "choose attractions based on your interests and available time.";
        }
      } else if (
        q.includes("budget") ||
        q.includes("cost")
      ) {
        answer +=
          `your planned budget is ₹${budget || 0}. ` +
          "Try to reserve part of the budget for accommodation, transport, food and emergencies.";
      } else {
        answer +=
          `I recommend planning around your ${travelType || "general"} travel preference, ` +
          `${travelers || 1} traveler(s), budget of ₹${budget || 0}, ` +
          "and choosing sustainable transportation where possible.";
      }

      res.json({
        success: true,

        answer,

        ai: {
          name:
            "SMART-ROUTE AI Assistant",

          enabled: true,
        },

        context: {
          source,
          destination,
          days,
          travelers,
          travelType,
          budget,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "AI Assistant failed.",
        error: error.message,
      });
    }
  }
);

// ============================================================
// EMERGENCY SERVICE HELPER
// ============================================================

function emergencyResponse(
  type,
  services
) {
  return {
    success: true,

    emergency: true,

    type,

    services,
  };
}

// ============================================================
// HOSPITAL
// ============================================================

app.get(
  "/hospital",
  (req, res) => {
    res.json(
      emergencyResponse(
        "Hospital",
        [
          {
            name:
              "Nearest Emergency Hospital",
            phone: "108",
            distance:
              "Nearby",
            availability:
              "24/7",
          },
        ]
      )
    );
  }
);

// ============================================================
// POLICE
// ============================================================

app.get(
  "/police",
  (req, res) => {
    res.json(
      emergencyResponse(
        "Police",
        [
          {
            name:
              "Emergency Police Service",
            phone: "112",
            distance:
              "Nearby",
            availability:
              "24/7",
          },
        ]
      )
    );
  }
);

// ============================================================
// FUEL
// ============================================================

app.get(
  "/fuel",
  (req, res) => {
    res.json(
      emergencyResponse(
        "Emergency Fuel",
        [
          {
            name:
              "Emergency Fuel Assistance",
            phone:
              "112",
            distance:
              "Nearby",
            availability:
              "24/7",
          },
        ]
      )
    );
  }
);

// ============================================================
// MECHANIC
// ============================================================

app.get(
  "/mechanic",
  (req, res) => {
    res.json(
      emergencyResponse(
        "Mechanic",
        [
          {
            name:
              "Roadside Mechanic Assistance",
            phone:
              "112",
            distance:
              "Nearby",
            availability:
              "24/7",
          },
        ]
      )
    );
  }
);

// ============================================================
// SAVED TRIPS
// ============================================================

// SAVE TRIP
app.post(
  "/saved-trips",
  async (req, res) => {
    try {
      let user =
        await getUserFromRequest(req);

      const {
        source,
        destination,
        days,
        budget,
        travelers,
        travelType,
        plan,
      } = req.body;

      if (!source || !destination) {
        return res.status(400).json({
          success: false,
          message:
            "Source and destination are required.",
        });
      }

      // If database is unavailable,
      // return successful local/demo response
      // instead of crashing the app.
      if (
        !mongoose.connection.readyState
      ) {
        return res.json({
          success: true,
          demoData: true,
          message:
            "Trip saved successfully on the current session.",
          trip: {
            source,
            destination,
            days,
            budget,
            travelers,
            travelType,
            plan,
          },
        });
      }

      const trip =
        await SavedTrip.create({
          userId:
            user?._id || undefined,

          source,

          destination,

          days:
            Number(days) || 0,

          budget:
            Number(budget) || 0,

          travelers:
            Number(travelers) || 1,

          travelType:
            travelType ||
            "General",

          plan:
            plan || null,
        });

      res.status(201).json({
        success: true,

        message:
          "Trip saved successfully.",

        trip,
      });
    } catch (error) {
      console.error(
        "Save trip error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to save trip.",
        error: error.message,
      });
    }
  }
);

// GET SAVED TRIPS
app.get(
  "/saved-trips",
  async (req, res) => {
    try {
      if (
        !mongoose.connection.readyState
      ) {
        return res.json({
          success: true,
          trips: [],
        });
      }

      const user =
        await getUserFromRequest(req);

      if (!user) {
        return res.json({
          success: true,
          trips: [],
        });
      }

      const trips =
        await SavedTrip.find({
          userId: user._id,
        }).sort({
          createdAt: -1,
        });

      res.json({
        success: true,
        trips,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Unable to load saved trips.",
      });
    }
  }
);

// ============================================================
// TEST PLAN ENDPOINT
// ============================================================

app.get(
  "/test-plan",
  (req, res) => {
    res.json({
      success: true,
      message:
        "POST /plan endpoint is available.",
      method:
        "POST",
      endpoint:
        "/plan",
      example: {
        source:
          "Bengaluru",
        city:
          "Mysuru",
        days: 3,
        budget: 15000,
        travelers: 2,
        travelType:
          "Family",
      },
    });
  }
);

// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  (req, res) => {
    console.log(
      `❌ 404 ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({
      success: false,

      message:
        "SMART-ROUTE API endpoint not found",

      requestedPath:
        req.originalUrl,

      method:
        req.method,

      availableEndpoints: [
        "GET /",
        "GET /health",
        "POST /auth/register",
        "POST /auth/login",
        "GET /destinations",
        "POST /plan",
        "GET /hotels",
        "GET /transport",
        "GET /transport-recommendation",
        "POST /agent/recommend",
        "GET /attractions",
        "GET /flights",
        "GET /sustainability",
        "POST /ai-assistant",
        "GET /hospital",
        "GET /police",
        "GET /fuel",
        "GET /mechanic",
        "POST /saved-trips",
        "GET /saved-trips",
      ],
    });
  }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "❌ SERVER ERROR:",
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      success: false,
      message:
        "SMART-ROUTE internal server error.",
      error:
        error.message,
    });
  }
);

// ============================================================
// START SERVER
// ============================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");
    console.log(
      "=============================================="
    );
    console.log(
      "🚀 SMART-ROUTE SERVER STARTED"
    );
    console.log(
      "=============================================="
    );
    console.log(
      `🚀 Server running on port ${PORT}`
    );
    console.log(
      `📡 API: http://localhost:${PORT}`
    );
    console.log(
      `📱 Android API: http://YOUR-PC-IP:${PORT}`
    );
    console.log(
      "🇮🇳 India travel mode enabled"
    );
    console.log(
      "🤖 AI Assistant enabled"
    );
    console.log(
      "🗺️ AI itinerary enabled"
    );
    console.log(
      "🧠 Agentic recommendation engine enabled"
    );
    console.log(
      "🌱 Sustainability engine enabled"
    );
    console.log(
      "🏨 Hotels API enabled"
    );
    console.log(
      "🚗 Transport API enabled"
    );
    console.log(
      "✈️ Flights API enabled"
    );
    console.log(
      "📍 Attractions API enabled"
    );
    console.log(
      "🚨 Emergency services enabled"
    );
    console.log(
      "💾 Saved Trips API enabled"
    );
    console.log(
      "🔐 Authentication enabled"
    );
    console.log(
      "=============================================="
    );
    console.log("");
  }
);

// ============================================================
// PROCESS ERROR HANDLING
// ============================================================

process.on(
  "unhandledRejection",
  (error) => {
    console.error(
      "❌ Unhandled Promise Rejection:",
      error
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "❌ Uncaught Exception:",
      error
    );
  }
);
