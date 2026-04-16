const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/aerorisk")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

// Flight analysis schema
const FlightSchema = new mongoose.Schema({
  email: { type: String, default: "" },
  weather: String,
  visibility: String,
  fuelLevel: String,
  engineStatus: String,
  windSpeed: String,
  turbulence: String,
  routeZone: String,
  flightType: String,
  nightFlight: Boolean,
  landingPhase: Boolean,
  score: Number,
  riskLevel: String,
  confidence: Number,
  recommendation: String,
  createdAt: { type: Date, default: Date.now },
});

const Flight = mongoose.model("Flight", FlightSchema);

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    res.json({
      message: "Signup successful",
      user: { email: newUser.email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: { email: user.email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Analyze and save to DB
app.post("/analyze", async (req, res) => {
  try {
    const {
      email = "",
      weather,
      visibility,
      fuelLevel,
      engineStatus,
      windSpeed,
      turbulence,
      routeZone,
      flightType,
      nightFlight,
      landingPhase,
    } = req.body;

    const weatherScore = weather === "Clear" ? 5 : weather === "Rain" ? 20 : 30;
    const visibilityScore =
      visibility === "High" ? 5 : visibility === "Medium" ? 15 : 25;
    const fuelScore = fuelLevel === "High" ? 5 : fuelLevel === "Medium" ? 10 : 20;
    const engineScore =
      engineStatus === "Nominal" ? 8 : engineStatus === "Minor Issue" ? 15 : 25;
    const windScore =
      windSpeed === "10 knots" ? 4 : windSpeed === "25 knots" ? 6 : 14;
    const turbulenceScore =
      turbulence === "Low" ? 4 : turbulence === "Moderate" ? 6 : 15;

    let score =
      weatherScore +
      visibilityScore +
      fuelScore +
      engineScore +
      windScore +
      turbulenceScore;

    if (routeZone === "Conflict Zone") score += 12;
    if (nightFlight) score += 5;
    if (landingPhase) score += 6;
    if (flightType === "Cargo") score += 3;
    if (flightType === "Private") score += 2;

    if (score > 100) score = 100;

    let riskLevel = "Low Risk";
    let confidence = 93;
    let recommendation =
      "Safe to proceed. Conditions are favorable for flight operations.";

    if (score >= 40 && score <= 70) {
      riskLevel = "Medium Risk";
      confidence = 85;
      recommendation =
        "Proceed with caution. Consider alternate routes to avoid storm zones and ensure fuel reserves are sufficient.";
    } else if (score > 70) {
      riskLevel = "High Risk";
      confidence = 74;
      recommendation =
        "Avoid departure. Significant safety risks detected. Immediate review is recommended.";
    }

    const savedFlight = new Flight({
      email,
      weather,
      visibility,
      fuelLevel,
      engineStatus,
      windSpeed,
      turbulence,
      routeZone,
      flightType,
      nightFlight,
      landingPhase,
      score,
      riskLevel,
      confidence,
      recommendation,
    });

    await savedFlight.save();

    res.json({
      score,
      riskLevel,
      confidence,
      recommendation,
      createdAt: savedFlight.createdAt,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error during analysis" });
  }
});

// Get history
app.get("/history/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const history = await Flight.find({ email }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error while fetching history" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});