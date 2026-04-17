import React, { useEffect, useMemo, useState } from "react";
import {
  FaPlane,
  FaGoogle,
  FaGithub,
  FaShieldAlt,
  FaExclamationTriangle,
  FaUsers,
} from "react-icons/fa";
import {
  FiHome,
  FiBarChart2,
  FiClock,
  FiFileText,
  FiSettings,
  FiMail,
  FiLock,
} from "react-icons/fi";
import { IoSunny, IoMoon } from "react-icons/io5";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("dark");
  const [authMode, setAuthMode] = useState("login");
  const [activePage, setActivePage] = useState("dashboard");

  const [email, setEmail] = useState("your@email.com");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [authMessage, setAuthMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState("");

  const [weather, setWeather] = useState("Rain");
  const [visibility, setVisibility] = useState("Medium");
  const [fuel, setFuel] = useState("Medium");
  const [engine, setEngine] = useState("Nominal");
  const [wind, setWind] = useState("25 knots");
  const [turbulence, setTurbulence] = useState("Moderate");
  const [routeZone, setRouteZone] = useState("Oceanic");
  const [flightType, setFlightType] = useState("Commercial");
  const [nightFlight, setNightFlight] = useState(true);
  const [landingPhase, setLandingPhase] = useState(false);

  const [history, setHistory] = useState([]);

  const [result, setResult] = useState({
    score: 65,
    level: "Medium Risk",
    confidence: 85,
    analyzedAt: "12 Apr, 2026 • 17:25",
    recommendation:
      "Proceed with caution. Consider alternate routes to avoid storm zones and ensure fuel reserves are sufficient.",
    breakdown: {
      weather: 20,
      visibility: 15,
      fuel: 10,
      engine: 8,
      wind: 6,
      turbulence: 6,
    },
  });

  const stats = {
    totalFlights: 128,
    safeFlights: "89%",
    highRisk: 11,
    avgRisk: 42.7,
    incidents: 2,
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("aerorisk_theme");
    const savedUser = localStorage.getItem("aerorisk_logged_user");
    const savedHistory = JSON.parse(
      localStorage.getItem("aerorisk_history") || "[]"
    );

    if (savedTheme) setTheme(savedTheme);
    if (savedUser) setLoggedInUser(savedUser);
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("aerorisk_theme", theme);
  }, [theme]);

  const scoreRange = useMemo(() => {
    if (result.score <= 30) return "0 - 30";
    if (result.score <= 70) return "40 - 70";
    return "70 - 100";
  }, [result.score]);

  function handleAuth() {
    setAuthMessage("");

    if (!email.trim() || !password.trim()) {
      setAuthMessage("Please enter email and password.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("aerorisk_users") || "{}");

    if (authMode === "signup") {
      if (users[email]) {
        setAuthMessage("Account already exists.");
        return;
      }

      users[email] = password;
      localStorage.setItem("aerorisk_users", JSON.stringify(users));
      localStorage.setItem("aerorisk_logged_user", email);
      setLoggedInUser(email);
      setAuthMessage("Account created successfully.");
      return;
    }

    if (!users[email]) {
      setAuthMessage("Account not found.");
      return;
    }

    if (users[email] !== password) {
      setAuthMessage("Incorrect password.");
      return;
    }

    localStorage.setItem("aerorisk_logged_user", email);
    setLoggedInUser(email);
    setAuthMessage("Login successful.");
  }

  function handleLogout() {
    localStorage.removeItem("aerorisk_logged_user");
    setLoggedInUser("");
    setAuthMessage("Logged out successfully.");
  }

  function handleSocial(name) {
    setAuthMessage(`${name} login demo clicked.`);
  }

  function handleAnalyze() {
    const weatherScore = weather === "Clear" ? 5 : weather === "Rain" ? 20 : 30;
    const visibilityScore =
      visibility === "High" ? 5 : visibility === "Medium" ? 15 : 25;
    const fuelScore = fuel === "High" ? 5 : fuel === "Medium" ? 10 : 20;
    const engineScore =
      engine === "Nominal" ? 8 : engine === "Minor Issue" ? 15 : 25;
    const windScore = wind === "10 knots" ? 4 : wind === "25 knots" ? 6 : 14;
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

    let level = "Low Risk";
    let confidence = 93;
    let recommendation =
      "Safe to proceed. Conditions are favorable for flight operations.";

    if (score >= 40 && score <= 70) {
      level = "Medium Risk";
      confidence = 85;
      recommendation =
        "Proceed with caution. Consider alternate routes to avoid storm zones and ensure fuel reserves are sufficient.";
    } else if (score > 70) {
      level = "High Risk";
      confidence = 74;
      recommendation =
        "Avoid departure. Significant safety risks detected. Immediate review is recommended.";
    }

    const newResult = {
      score,
      level,
      confidence,
      analyzedAt: new Date().toLocaleString(),
      recommendation,
      breakdown: {
        weather: weatherScore,
        visibility: visibilityScore,
        fuel: fuelScore,
        engine: engineScore,
        wind: windScore,
        turbulence: turbulenceScore,
      },
    };

    setResult(newResult);

    const updatedHistory = [
      {
        id: Date.now(),
        time: new Date().toLocaleString(),
        score,
        level,
      },
      ...history,
    ];

    setHistory(updatedHistory);
    localStorage.setItem("aerorisk_history", JSON.stringify(updatedHistory));
    setActivePage("dashboard");
  }

  function clearHistory() {
    localStorage.removeItem("aerorisk_history");
    setHistory([]);
  }

  function renderMain() {
    if (activePage === "history") {
      return (
        <section className="panel glass full-panel">
          <div className="panelHead">
            <h2>History</h2>
            <p>Saved analysis records</p>
          </div>
          {history.length === 0 ? (
            <div className="simpleBox">No saved history yet.</div>
          ) : (
            <div className="historyList">
              {history.map((item) => (
                <div className="historyCard" key={item.id}>
                  <h3>{item.level}</h3>
                  <p>Score: {item.score}</p>
                  <p>{item.time}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    if (activePage === "reports") {
      return (
        <section className="panel glass full-panel">
          <div className="panelHead">
            <h2>Reports</h2>
            <p>Latest generated report</p>
          </div>
          <div className="simpleBox">
            <p><strong>Risk Level:</strong> {result.level}</p>
            <p><strong>Risk Score:</strong> {result.score}</p>
            <p><strong>Confidence:</strong> {result.confidence}%</p>
            <p><strong>Recommendation:</strong> {result.recommendation}</p>
          </div>
        </section>
      );
    }

    if (activePage === "settings") {
      return (
        <section className="panel glass full-panel">
          <div className="panelHead">
            <h2>Settings</h2>
            <p>Manage app preferences</p>
          </div>
          <div className="simpleBox">
            <p><strong>Current Theme:</strong> {theme}</p>
            <p><strong>User:</strong> {loggedInUser || "Not logged in"}</p>
            <p><strong>Saved History:</strong> {history.length}</p>
            <button className="viewBtn" onClick={clearHistory}>
              Clear History
            </button>
          </div>
        </section>
      );
    }

    return (
      <>
        <section className="panel glass inputPanel">
          <div className="panelTitleRow">
            <div className="panelIcon purple">
              <FaPlane />
            </div>
            <div className="panelHead">
              <h2>Flight Conditions</h2>
              <p>Provide current flight parameters</p>
            </div>
          </div>

          <div className="grid2">
            <Field label="Weather">
              <select value={weather} onChange={(e) => setWeather(e.target.value)}>
                <option>Clear</option>
                <option>Rain</option>
                <option>Storm</option>
              </select>
            </Field>

            <Field label="Visibility">
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </Field>

            <Field label="Fuel Level">
              <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </Field>

            <Field label="Engine Status">
              <select value={engine} onChange={(e) => setEngine(e.target.value)}>
                <option>Nominal</option>
                <option>Minor Issue</option>
                <option>Critical</option>
              </select>
            </Field>

            <Field label="Wind Speed">
              <select value={wind} onChange={(e) => setWind(e.target.value)}>
                <option>10 knots</option>
                <option>25 knots</option>
                <option>40 knots</option>
              </select>
            </Field>

            <Field label="Turbulence">
              <select
                value={turbulence}
                onChange={(e) => setTurbulence(e.target.value)}
              >
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </Field>

            <Field label="Route Zone">
              <select
                value={routeZone}
                onChange={(e) => setRouteZone(e.target.value)}
              >
                <option>Oceanic</option>
                <option>Safe</option>
                <option>Conflict Zone</option>
              </select>
            </Field>

            <Field label="Flight Type">
              <select
                value={flightType}
                onChange={(e) => setFlightType(e.target.value)}
              >
                <option>Commercial</option>
                <option>Cargo</option>
                <option>Private</option>
              </select>
            </Field>
          </div>

          <div className="switchRow">
            <Toggle
              label="Night Flight"
              checked={nightFlight}
              onClick={() => setNightFlight(!nightFlight)}
            />
            <Toggle
              label="Landing Phase"
              checked={landingPhase}
              onClick={() => setLandingPhase(!landingPhase)}
            />
          </div>

          <button className="primaryAction" onClick={handleAnalyze}>
            ✈ Analyze Flight Risk
          </button>
        </section>

        <section className="panel glass resultPanel">
          <div className="resultTop">
            <div className="panelTitleRow">
              <div className="panelIcon pink">
                <FiBarChart2 />
              </div>
              <div className="panelHead">
                <h2>Analysis Result</h2>
                <p>Computed risk based on provided data</p>
              </div>
            </div>
            <div className="statusChip">Completed</div>
          </div>

          <div className="heroResult">
            <div className="ring">
              <div className="ringInner">
                <strong>{result.score}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="heroText">
              <div className="smallLabel">Risk Level</div>
              <div
                className={`riskLevel ${
                  result.level.includes("Medium")
                    ? "medium"
                    : result.level.includes("High")
                    ? "high"
                    : "low"
                }`}
              >
                {result.level}
              </div>
              <p className="heroDesc">
                {result.level === "Medium Risk"
                  ? "Conditions are acceptable but require caution. Monitor closely."
                  : result.recommendation}
              </p>
            </div>
          </div>

          <div className="metricGrid">
            <Metric label="Score Range" value={scoreRange} />
            <Metric label="Confidence" value={`${result.confidence}%`} />
            <Metric label="Analyzed At" value={result.analyzedAt} />
          </div>

          <div className="bottomGrid">
            <div className="subCard">
              <h3>Risk Breakdown</h3>
              {Object.entries(result.breakdown).map(([key, value]) => (
                <div className="barItem" key={key}>
                  <div className="barLabel">
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span>{value}</span>
                  </div>
                  <div className="barTrack">
                    <div
                      className="barFill"
                      style={{ width: `${Math.min(value * 5, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="subCard recommendCard">
              <h3>Recommendation</h3>
              <p>{result.recommendation}</p>
              <button className="viewBtn" onClick={() => setActivePage("reports")}>
                View Details →
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <div className={`page ${theme}`}>
      <div className="backgroundScene">
        <div className="skyGlow left" />
        <div className="skyGlow right" />
        <div className="airportTerminal" />
        <div className="airportTower" />
        <div className="runwayLine" />
        <div className="planeTrail" />
        <div className="planeBody" />
      </div>

      <header className="topbar">
        <div className="brand">
          <div className="brandIcon">
            <FaPlane />
          </div>
          <div>
            <h1>AeroRisk</h1>
            <p>Flight Safety Risk Analyzer</p>
          </div>
        </div>

        <div className="topActions">
          <div className="themeTabs">
            <button
              className={theme === "dark" ? "active" : ""}
              onClick={() => setTheme("dark")}
            >
              <IoMoon /> Dark
            </button>
            <button
              className={theme === "light" ? "active" : ""}
              onClick={() => setTheme("light")}
            >
              <IoSunny /> Light
            </button>
          </div>

          <div className="userChip">
            <div className="avatar">A</div>
            <span>{loggedInUser ? loggedInUser.split("@")[0] : "Aviator"}</span>
          </div>
        </div>
      </header>

      <main className="mainLayout">
        <aside className="panel glass sidebar">
          <h2>Welcome Back!</h2>
          <p className="muted">Sign in to continue your journey</p>

          {!loggedInUser ? (
            <>
              <div className="authTabs">
                <button
                  className={authMode === "login" ? "active" : ""}
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  className={authMode === "signup" ? "active" : ""}
                  onClick={() => setAuthMode("signup")}
                >
                  Sign Up
                </button>
              </div>

              <label>Email</label>
              <div className="inputBox">
                <FiMail />
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <label>Password</label>
              <div className="inputBox">
                <FiLock />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="rememberRow">
                <label className="rememberCheck">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  className="ghostLink"
                  onClick={() => setAuthMessage("Password recovery demo only.")}
                >
                  Forgot?
                </button>
              </div>

              <button className="primaryAction" onClick={handleAuth}>
                {authMode === "login" ? "Login" : "Create Account"}
              </button>

              {authMessage && <div className="message">{authMessage}</div>}

              <div className="divider">or continue with</div>

              <div className="socialRow">
                <button onClick={() => handleSocial("Google")}>
                  <FaGoogle /> Google
                </button>
                <button onClick={() => handleSocial("GitHub")}>
                  <FaGithub /> GitHub
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="message success">Logged in as {loggedInUser}</div>
              <button className="primaryAction" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          <nav className="menu">
            <button
              className={activePage === "dashboard" ? "menuBtn active" : "menuBtn"}
              onClick={() => setActivePage("dashboard")}
            >
              <FiHome /> Dashboard
            </button>
            <button className="menuBtn" onClick={() => setActivePage("dashboard")}>
              <FiBarChart2 /> Analyze Risk
            </button>
            <button
              className={activePage === "history" ? "menuBtn active" : "menuBtn"}
              onClick={() => setActivePage("history")}
            >
              <FiClock /> History
            </button>
            <button
              className={activePage === "reports" ? "menuBtn active" : "menuBtn"}
              onClick={() => setActivePage("reports")}
            >
              <FiFileText /> Reports
            </button>
            <button
              className={activePage === "settings" ? "menuBtn active" : "menuBtn"}
              onClick={() => setActivePage("settings")}
            >
              <FiSettings /> Settings
            </button>
          </nav>

          <div className="copyright">© 2026 AeroRisk. All rights reserved.</div>
        </aside>

        {renderMain()}
      </main>

      <section className="statsRow">
        <StatCard
          icon={<FaPlane />}
          color="blue"
          label="Total Flights"
          value={stats.totalFlights}
          note="+12% vs last month"
        />
        <StatCard
          icon={<FaShieldAlt />}
          color="green"
          label="Safe Flights"
          value={stats.safeFlights}
          note="+5% vs last month"
        />
        <StatCard
          icon={<FaExclamationTriangle />}
          color="red"
          label="High Risk"
          value={stats.highRisk}
          note="-2 vs last month"
        />
        <StatCard
          icon={<FiBarChart2 />}
          color="cyan"
          label="Avg. Risk Score"
          value={stats.avgRisk}
          note="-3.1 vs last month"
        />
        <StatCard
          icon={<FaUsers />}
          color="orange"
          label="Incidents"
          value={stats.incidents}
          note="No change"
        />
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="fieldBlock">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onClick }) {
  return (
    <div className="toggleItem">
      <span>{label}</span>
      <button className={checked ? "toggle active" : "toggle"} onClick={onClick}>
        <span />
      </button>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metricCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatCard({ icon, color, label, value, note }) {
  return (
    <div className="statCard">
      <div className={`statIcon ${color}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}

export default App;