const mongoose = require("mongoose");

const savedTripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    source: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    days: {
      type: Number,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    travelers: {
      type: Number,
      required: true,
    },

    travelType: {
      type: String,
      default: "Family",
    },

    plan: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SavedTrip", savedTripSchema);