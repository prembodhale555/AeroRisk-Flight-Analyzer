const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/aerorisk")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

const analysisSchema = new mongoose.Schema(
  {
    sourceCity: String,
    destinationCity: String,
    fuelLevel: String,
    engineStatus: String,
    routeZone: String,
    flightType: String,
    nightFlight: Boolean,
    landingPhase: Boolean,
    liveWeather: {
      source: String,
      midpoint: String,
      destination: String,
      visibility: String,
      wind: String,
    },
    breakdown: {
      weather: Number,
      visibility: Number,
      fuel: Number,
      engine: Number,
      wind: Number,
      turbulence: Number,
    },
    score: Number,
    level: String,
    confidence: String,
    recommendation: String,
    analyzedAt: String,
  },
  { timestamps: true }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

function midpoint(lat1, lon1, lat2, lon2) {
  return {
    latitude: (lat1 + lat2) / 2,
    longitude: (lon1 + lon2) / 2,
  };
}

async function geocodeCity(city) {
  const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
    params: {
      name: city,
      count: 1,
      language: "en",
      format: "json",
    },
  });

  if (!response.data.results || response.data.results.length === 0) {
    throw new Error(`City not found: ${city}`);
  }

  const place = response.data.results[0];
  return {
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

async function getWeather(lat, lon) {
  const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude: lat,
      longitude: lon,
      current: "weather_code,wind_speed_10m",
      hourly: "visibility,precipitation_probability",
      forecast_days: 1,
      timezone: "auto",
    },
  });

  const data = response.data;
  const currentTime = data.current?.time;
  const hourlyTimes = data.hourly?.time || [];
  const hourlyIndex = hourlyTimes.indexOf(currentTime);

  return {
    weatherCode: data.current?.weather_code ?? 0,
    windSpeed: data.current?.wind_speed_10m ?? 0,
    visibility:
      hourlyIndex >= 0 && data.hourly?.visibility
        ? data.hourly.visibility[hourlyIndex]
        : 10000,
    precipitationProbability:
      hourlyIndex >= 0 && data.hourly?.precipitation_probability
        ? data.hourly.precipitation_probability[hourlyIndex]
        : 0,
  };
}

function weatherCodeToText(code) {
  if ([0].includes(code)) return "Clear";
  if ([1, 2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown";
}

function weatherRisk(code) {
  if ([0].includes(code)) return 4;
  if ([1, 2, 3].includes(code)) return 8;
  if ([45, 48].includes(code)) return 15;
  if ([51, 53, 55, 56, 57].includes(code)) return 14;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 20;
  if ([95, 96, 99].includes(code)) return 28;
  return 10;
}

function visibilityRisk(vis) {
  if (vis >= 10000) return 4;
  if (vis >= 6000) return 8;
  if (vis >= 3000) return 14;
  return 20;
}

function windRisk(wind) {
  if (wind < 10) return 4;
  if (wind < 20) return 8;
  if (wind < 30) return 14;
  return 20;
}

function turbulenceRiskFromWind(wind) {
  if (wind < 10) return 4;
  if (wind < 20) return 8;
  if (wind < 30) return 12;
  return 18;
}

function fuelRisk(level) {
  if (level === "High") return 4;
  if (level === "Medium") return 10;
  return 18;
}

function engineRisk(status) {
  if (status === "Nominal") return 4;
  if (status === "Warning") return 12;
  return 20;
}

function routeRisk(zone, nightFlight, landingPhase) {
  let risk = 4;

  if (zone === "Urban") risk += 4;
  if (zone === "Mountain") risk += 8;
  if (zone === "Restricted") risk += 12;
  if (zone === "Oceanic") risk += 6;

  if (nightFlight) risk += 5;
  if (landingPhase) risk += 7;

  return risk;
}

function confidenceFromScore(score) {
  if (score <= 25) return "92%";
  if (score <= 55) return "85%";
  if (score <= 85) return "74%";
  return "68%";
}

function runCppEngine(values) {
  return new Promise((resolve, reject) => {
    const exePath = path.join(__dirname, "..", "cpp-engine", "analysis.exe");
    const cpp = spawn(exePath);

    let output = "";
    let errorOutput = "";

    cpp.stdout.on("data", (data) => {
      output += data.toString();
    });

    cpp.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    cpp.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(errorOutput || "C++ process failed"));
      }

      const lines = output.trim().split("\n");
      if (lines.length < 3) {
        return reject(new Error("Invalid C++ output"));
      }

      resolve({
        score: Number(lines[0]),
        level: lines[1],
        recommendation: lines.slice(2).join(" "),
      });
    });

    cpp.stdin.write(values.join(" ") + "\n");
    cpp.stdin.end();
  });
}

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.post("/analyze", async (req, res) => {
  try {
    const {
      sourceCity,
      destinationCity,
      fuelLevel,
      engineStatus,
      routeZone,
      flightType,
      nightFlight,
      landingPhase,
    } = req.body;

    if (!sourceCity || !destinationCity) {
      return res.status(400).json({ message: "Source and destination city are required" });
    }

    const source = await geocodeCity(sourceCity);
    const destination = await geocodeCity(destinationCity);
    const mid = midpoint(
      source.latitude,
      source.longitude,
      destination.latitude,
      destination.longitude
    );

    const [sourceW, midW, destinationW] = await Promise.all([
      getWeather(source.latitude, source.longitude),
      getWeather(mid.latitude, mid.longitude),
      getWeather(destination.latitude, destination.longitude),
    ]);

    const weatherValue = Math.max(
      weatherRisk(sourceW.weatherCode),
      weatherRisk(midW.weatherCode),
      weatherRisk(destinationW.weatherCode)
    );

    const visibilityValue = Math.max(
      visibilityRisk(sourceW.visibility),
      visibilityRisk(midW.visibility),
      visibilityRisk(destinationW.visibility)
    );

    const windValue = Math.max(
      windRisk(sourceW.windSpeed),
      windRisk(midW.windSpeed),
      windRisk(destinationW.windSpeed)
    );

    const turbulenceValue = Math.max(
      turbulenceRiskFromWind(sourceW.windSpeed),
      turbulenceRiskFromWind(midW.windSpeed),
      turbulenceRiskFromWind(destinationW.windSpeed)
    );

    const fuelValue = fuelRisk(fuelLevel);
    const engineValue = engineRisk(engineStatus);
    const routeValue = routeRisk(routeZone, nightFlight, landingPhase);

    const cppResult = await runCppEngine([
      weatherValue,
      visibilityValue,
      windValue,
      fuelValue,
      engineValue,
      routeValue,
    ]);

    const analyzedAt = new Date().toLocaleString();

    const responseData = {
      score: cppResult.score,
      level: cppResult.level,
      confidence: confidenceFromScore(cppResult.score),
      analyzedAt,
      recommendation: cppResult.recommendation,
      breakdown: {
        weather: weatherValue,
        visibility: visibilityValue,
        fuel: fuelValue,
        engine: engineValue,
        wind: windValue,
        turbulence: turbulenceValue,
      },
      liveWeather: {
        source: weatherCodeToText(sourceW.weatherCode),
        midpoint: weatherCodeToText(midW.weatherCode),
        destination: weatherCodeToText(destinationW.weatherCode),
        visibility:
          sourceW.visibility >= 10000 && midW.visibility >= 10000 && destinationW.visibility >= 10000
            ? "High"
            : sourceW.visibility >= 6000 && midW.visibility >= 6000 && destinationW.visibility >= 6000
            ? "Medium"
            : "Low",
        wind: `${Math.max(sourceW.windSpeed, midW.windSpeed, destinationW.windSpeed)} km/h`,
      },
    };

    await Analysis.create({
      sourceCity,
      destinationCity,
      fuelLevel,
      engineStatus,
      routeZone,
      flightType,
      nightFlight,
      landingPhase,
      ...responseData,
    });

    res.json(responseData);
  } catch (err) {
    console.error("ANALYZE ERROR:", err.message);
    res.status(500).json({
      message: err.message || "Server error while analyzing route",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});