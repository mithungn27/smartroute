const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ======================================================
// REGISTER / SIGNUP
// Supports both:
// POST /auth/register
// POST /auth/signup
// ======================================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name.",
      });
    }

    if (!cleanEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "This email is already registered. Please login instead.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      cleanPassword,
      10
    );

    // Create user
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log(
      `✅ New user registered: ${user.email}`
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:");
    console.error(error);

    // Duplicate email protection
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This email is already registered. Please login instead.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
};

// Both URLs work
router.post("/register", registerUser);
router.post("/signup", registerUser);

// ======================================================
// LOGIN
// ======================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const cleanPassword = String(password);

    // Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      cleanPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log(
      `✅ User logged in: ${user.email}`
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login error:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
});

// ======================================================
// TEST AUTH
// ======================================================

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Authentication route is working.",
    endpoints: {
      register: "POST /auth/register",
      signup: "POST /auth/signup",
      login: "POST /auth/login",
    },
  });
});

module.exports = router;