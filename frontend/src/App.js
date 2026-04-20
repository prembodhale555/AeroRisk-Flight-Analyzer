import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useState("dark");

  const [sourceCity, setSourceCity] = useState("Pune");
  const [destinationCity, setDestinationCity] = useState("Mumbai");
  const [fuelLevel, setFuelLevel] = useState("Medium");
  const [engineStatus, setEngineStatus] = useState("Nominal");
  const [routeZone, setRouteZone] = useState("Oceanic");
  const [flightType, setFlightType] = useState("Commercial");
  const [nightFlight, setNightFlight] = useState(true);
  const [landingPhase, setLandingPhase] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState({
    score: 65,
    level: "Medium Risk",
    confidence: "85%",
    analyzedAt: "12 Apr, 2026 • 17:25",
    recommendation:
      "Proceed with caution. Consider alternate routes to avoid storm zones and ensure fuel reserves are sufficient.",
    breakdown: {
      weather: 20,
      visibility: 15,
      fuel: 10,
      engine: 8,
      wind: 14,
      turbulence: 15,
    },
    liveWeather: {
      source: "Not fetched yet",
      midpoint: "Not fetched yet",
      destination: "Not fetched yet",
      visibility: "Not fetched yet",
      wind: "Not fetched yet",
    },
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceCity,
          destinationCity,
          fuelLevel,
          engineStatus,
          routeZone,
          flightType,
          nightFlight,
          landingPhase,
        }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Backend returned HTML instead of JSON. Restart backend and check server.js.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to analyze route");
      }

      setResult({
        score: data.score ?? 65,
        level: data.level ?? "Medium Risk",
        confidence: data.confidence ?? "85%",
        analyzedAt: data.analyzedAt ?? new Date().toLocaleString(),
        recommendation:
          data.recommendation ??
          "Proceed with caution. Monitor route conditions closely.",
        breakdown: {
          weather: data.breakdown?.weather ?? 20,
          visibility: data.breakdown?.visibility ?? 15,
          fuel: data.breakdown?.fuel ?? 10,
          engine: data.breakdown?.engine ?? 8,
          wind: data.breakdown?.wind ?? 14,
          turbulence: data.breakdown?.turbulence ?? 15,
        },
        liveWeather: {
          source: data.liveWeather?.source ?? "No data",
          midpoint: data.liveWeather?.midpoint ?? "No data",
          destination: data.liveWeather?.destination ?? "No data",
          visibility: data.liveWeather?.visibility ?? "No data",
          wind: data.liveWeather?.wind ?? "No data",
        },
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Backend not connected yet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app ${theme}`}>
      <div className="app-bg"></div>

      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-icon">✈</div>
          <div className="brand-text">
            <h1>AeroRisk</h1>
            <p>Flight Safety Risk Analyzer</p>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="theme-switch">
            <button
              className={theme === "dark" ? "active" : ""}
              onClick={() => setTheme("dark")}
            >
              ☾ Dark
            </button>
            <button
              className={theme === "light" ? "active" : ""}
              onClick={() => setTheme("light")}
            >
              ☀ Light
            </button>
          </div>

          <div className="profile-pill">
            <div className="avatar">A</div>
            <span>prembodhale555</span>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <aside className="sidebar glass">
          <h2>Welcome Back!</h2>
          <p className="muted">Sign in to continue your journey</p>

          <div className="session-box">
            <p>Logged in as</p>
            <strong>prembodhale555@gmail.com</strong>
          </div>

          <button className="gradient-btn logout-btn">Logout</button>

          <div className="menu-list">
            <button className="menu-btn active">Dashboard</button>
            <button className="menu-btn">Analyze Risk</button>
            <button className="menu-btn">History</button>
            <button className="menu-btn">Reports</button>
            <button className="menu-btn">Settings</button>
          </div>

          <p className="copyright">© 2026 AeroRisk. All rights reserved.</p>
        </aside>
        <section className="conditions glass">
          <div className="panel-title-row">
            <div className="panel-icon">✈</div>
            <div>
              <h2>Flight Conditions</h2>
              <p>Provide current flight parameters</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Source City</label>
              <input
                type="text"
                value={sourceCity}
                onChange={(e) => setSourceCity(e.target.value)}
                placeholder="Enter source city"
              />
            </div>

            <div className="field">
              <label>Destination City</label>
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="Enter destination city"
              />
            </div>

            <div className="field">
              <label>Fuel Level</label>
              <select
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="field">
              <label>Engine Status</label>
              <select
                value={engineStatus}
                onChange={(e) => setEngineStatus(e.target.value)}
              >
                <option>Nominal</option>
                <option>Warning</option>
                <option>Critical</option>
              </select>
            </div>

            <div className="field">
              <label>Route Zone</label>
              <select
                value={routeZone}
                onChange={(e) => setRouteZone(e.target.value)}
              >
                <option>Oceanic</option>
                <option>Urban</option>
                <option>Mountain</option>
                <option>Restricted</option>
              </select>
            </div>

            <div className="field">
              <label>Flight Type</label>
              <select
                value={flightType}
                onChange={(e) => setFlightType(e.target.value)}
              >
                <option>Commercial</option>
                <option>Cargo</option>
                <option>Private</option>
                <option>Military</option>
              </select>
            </div>
          </div>

          <div className="toggle-row">
            <div className="toggle-item">
              <span>Night Flight</span>
              <button
                className={`toggle ${nightFlight ? "on" : ""}`}
                onClick={() => setNightFlight(!nightFlight)}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>

            <div className="toggle-item">
              <span>Landing Phase</span>
              <button
                className={`toggle ${landingPhase ? "on" : ""}`}
                onClick={() => setLandingPhase(!landingPhase)}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>
          </div>

          <div className="live-weather-card">
            <h3>Live Route Weather</h3>
            <div className="live-weather-grid">
              <div className="live-weather-item">
                <span>Source</span>
                <strong>
                  {sourceCity}: {result.liveWeather.source}
                </strong>
              </div>

              <div className="live-weather-item">
                <span>Midpoint</span>
                <strong>{result.liveWeather.midpoint}</strong>
              </div>

              <div className="live-weather-item">
                <span>Destination</span>
                <strong>
                  {destinationCity}: {result.liveWeather.destination}
                </strong>
              </div>

              <div className="live-weather-item">
                <span>Visibility</span>
                <strong>{result.liveWeather.visibility}</strong>
              </div>

              <div className="live-weather-item full">
                <span>Wind</span>
                <strong>{result.liveWeather.wind}</strong>
              </div>
            </div>
          </div>

          {error && <p style={{ color: "#ff6b6b", marginTop: "14px" }}>{error}</p>}

          <button className="gradient-btn analyze-btn" onClick={handleAnalyze}>
            {loading ? "Analyzing..." : "✈ Analyze Flight Risk"}
          </button>
        </section>

        <section className="results glass">
          <div className="results-top">
            <div className="panel-title-row">
              <div className="panel-icon purple">◔</div>
              <div>
                <h2>Analysis Result</h2>
                <p>Computed risk based on provided data</p>
              </div>
            </div>

            <div className="status-tag">Completed</div>
          </div>

          <div className="hero-result">
            <div className="score-ring">
              <div className="score-ring-inner">
                <h1>{result.score}</h1>
                <span>/100</span>
              </div>
            </div>

            <div className="hero-text">
              <span>Risk Level</span>
              <h2>{result.level}</h2>
              <p>
                Conditions are acceptable but require caution. Monitor closely.
              </p>
            </div>
          </div>

          <div className="mini-stats">
            <div className="mini-stat">
              <span>Score Range</span>
              <strong>40 - 70</strong>
            </div>
            <div className="mini-stat">
              <span>Confidence</span>
              <strong>{result.confidence}</strong>
            </div>
            <div className="mini-stat">
              <span>Analyzed At</span>
              <strong>{result.analyzedAt}</strong>
            </div>
          </div>

          <div className="results-bottom">
            <div className="breakdown-card">
              <h3>Risk Breakdown</h3>

              <div className="risk-row">
                <span>Weather</span>
                <div className="bar">
                  <div style={{ width: "80%" }}></div>
                </div>
                <strong>{result.breakdown.weather}</strong>
              </div>

              <div className="risk-row">
                <span>Visibility</span>
                <div className="bar">
                  <div style={{ width: "60%" }}></div>
                </div>
                <strong>{result.breakdown.visibility}</strong>
              </div>

              <div className="risk-row">
                <span>Fuel</span>
                <div className="bar">
                  <div style={{ width: "40%" }}></div>
                </div>
                <strong>{result.breakdown.fuel}</strong>
              </div>

              <div className="risk-row">
                <span>Engine</span>
                <div className="bar">
                  <div style={{ width: "32%" }}></div>
                </div>
                <strong>{result.breakdown.engine}</strong>
              </div>

              <div className="risk-row">
                <span>Wind</span>
                <div className="bar">
                  <div style={{ width: "56%" }}></div>
                </div>
                <strong>{result.breakdown.wind}</strong>
              </div>

              <div className="risk-row">
                <span>Turbulence</span>
                <div className="bar">
                  <div style={{ width: "58%" }}></div>
                </div>
                <strong>{result.breakdown.turbulence}</strong>
              </div>
            </div>

            <div className="recommend-card">
              <h3>Recommendation</h3>
              <p>{result.recommendation}</p>
              <button className="details-btn">View Details →</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}