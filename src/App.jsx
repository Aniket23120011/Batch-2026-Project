/**
 * App.jsx
 * Root component. Holds shared mix state (sla, tla, ifa).
 */
import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Cost from "./pages/Cost";
import Compare from "./pages/Compare";
import Physical from "./pages/Physical";
import Chemical from "./pages/Chemical";
import Sustainability from "./pages/Sustainability";
import About from "./pages/About";


const NAV_GOLD = "#c9a227";

/* ── IS CODE DATA ── */
const IS_SECTIONS = [
  {
    tag: "IS 456 : 2000", tagBg: undefined,
    name: "Plain & Reinforced Concrete — Code of Practice",
    rows: [
      ["Cl⁻ ion content",               "Table 1",          "≤ 0.10%"],
      ["Max SCM replacement (OPC)",      "Table 5, Cl. 5.2", "≤ 30%"],
      ["MgO in blended cement",          "Cl. 5.2",          "≤ 6%"],
      ["Min. cement content (M25)",      "Table 5",          "300 kg/m³"],
      ["Max w/c ratio (M25)",            "Table 5",          "≤ 0.50"],
    ],
  },
  {
    tag: "IS 269 : 2015", name: "Ordinary Portland Cement — Specification",
    rows: [
      ["MgO content",              "Cl. 5.2.1", "≤ 6%"],
      ["SO₃ (C₃A > 5%)",          "Cl. 5.2.3", "≤ 3.5%"],
      ["SO₃ (C₃A ≤ 5%)",          "Cl. 5.2.3", "≤ 2.5%"],
      ["Loss on Ignition",         "Cl. 5.2.5", "≤ 5%"],
      ["Insoluble Residue",        "Cl. 5.2.6", "≤ 4%"],
      ["28-day strength (OPC 53)", "Cl. 7.2",   "≥ 53 MPa"],
      ["Initial Setting Time",     "Cl. 7.3",   "≥ 30 min"],
      ["Final Setting Time",       "Cl. 7.3",   "≤ 600 min"],
      ["Soundness (Le Chatelier)", "Cl. 7.4",   "≤ 10 mm"],
    ],
  },
  {
    tag: "IS 4032 : 1985", name: "Chemical Analysis of Hydraulic Cement",
    rows: [
      ["SiO₂+Al₂O₃+Fe₂O₃ (pozzolan)", "Cl. 3.1", "≥ 70%"],
      ["SO₃ in cement (C₃A > 5%)",     "Cl. 3.3", "≤ 3.5%"],
      ["Chloride content",              "Cl. 3.5", "≤ 0.10%"],
      ["Loss on Ignition",              "Cl. 3.6", "≤ 5%"],
      ["MgO",                           "Cl. 3.7", "≤ 6%"],
      ["Insoluble Residue",             "Cl. 3.8", "≤ 3%"],
    ],
  },
  {
    tag: "IS 3812 : 2003", name: "Pulverised Fuel Ash — reference for IFA",
    rows: [
      ["SiO₂+Al₂O₃+Fe₂O₃", "Cl. 4.1.1", "≥ 70%"],
      ["SO₃",                "Cl. 4.1.2", "≤ 3%"],
      ["MgO",                "Cl. 4.1.3", "≤ 5%"],
      ["Total Chloride",     "Cl. 4.1.4", "≤ 0.05%"],
      ["Loss on Ignition",   "Cl. 4.1.5", "≤ 5%"],
      ["Lime Reactivity",    "Cl. 4.2.3", "≥ 4.5 MPa"],
    ],
  },
  {
    tag: "IS 4031 : 1988", name: "Physical Tests for Hydraulic Cement",
    rows: [
      ["Fineness (Blaine)",        "Part 2", "≥ 225 m²/kg"],
      ["Soundness (Le Chatelier)", "Part 3", "≤ 10 mm"],
      ["Standard Consistency",     "Part 4", "Vicat apparatus"],
      ["Initial Setting Time",     "Part 5", "≥ 30 min"],
      ["Final Setting Time",       "Part 5", "≤ 600 min"],
      ["Comp. Strength (3 days)",  "Part 6", "≥ 27 MPa"],
      ["Comp. Strength (7 days)",  "Part 6", "≥ 37 MPa"],
      ["Comp. Strength (28 days)", "Part 6", "≥ 53 MPa"],
    ],
  },
  {
    tag: "ASTM C618", tagBg: "#1a3a6e",
    name: "Natural Pozzolan for Concrete — Class F criteria applied to SLA",
    rows: [
      ["SiO₂+Al₂O₃+Fe₂O₃",   "§6.1.1", "≥ 70%"],
      ["SO₃",                  "§6.1.2", "≤ 5%"],
      ["Moisture content",     "§6.1.3", "≤ 3%"],
      ["Loss on Ignition",     "§6.1.4", "≤ 6%"],
      ["Strength activity idx","§8.2",   "≥ 75% of control"],
    ],
  },
];

/* ── IS CODE PANEL COMPONENT ── */
function ISCodePanel() {
  const [open, setOpen] = useState(false);

  const navy   = "#0f2340";
  const navy3  = "#1e3a5f";
  const gold2  = "#c9a227";
  const border = "rgba(15,35,64,0.09)";
  const muted  = "#4a5468";

  return (
    <>
      {/* FAB button — fixed right side */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", right: 0, top: "50%",
          transform: "translateY(-50%)", zIndex: 900,
          background: navy, color: "#fff", border: "none",
          borderRadius: "12px 0 0 12px",
          padding: "1rem 0.75rem",
          cursor: "pointer", display: "flex",
          flexDirection: "column", alignItems: "center", gap: "0.4rem",
          boxShadow: "-4px 0 20px rgba(15,35,64,0.2)",
          borderLeft: `3px solid ${gold2}`,
          borderTop: `1px solid rgba(201,162,39,0.3)`,
          borderBottom: `1px solid rgba(201,162,39,0.3)`,
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.paddingRight = "1rem"}
        onMouseLeave={e => e.currentTarget.style.paddingRight = "0.75rem"}
      >
        <span style={{ fontSize: "1.3rem" }}>📋</span>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "0.6rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.06em",
          lineHeight: 1.3, textAlign: "center", color: gold2,
        }}>
          IS Code<br />Reference
        </span>
      </button>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(10,20,40,0.5)",
          zIndex: 1000,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.3s",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Sliding panel */}
      <div style={{
        position: "fixed", top: 0,
        right: open ? 0 : -520,
        width: "min(500px, 95vw)", height: "100vh",
        background: "#f8f9fb", zIndex: 1001,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        transition: "right 0.35s cubic-bezier(.4,0,.2,1)",
        boxShadow: "-8px 0 40px rgba(15,35,64,0.2)",
      }}>
        {/* Panel header */}
        <div style={{
          background: navy, padding: "1.4rem 1.5rem",
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", gap: "1rem",
          flexShrink: 0, borderBottom: `3px solid ${gold2}`,
        }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: gold2, marginBottom: "0.3rem" }}>
              Indian Standard Code Reference
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginBottom: "0.2rem" }}>
              IS Code Limits &amp; Clauses
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
              All parameters used in this project
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)",
              borderRadius: 8, width: 32, height: 32,
              cursor: "pointer", fontSize: "0.85rem",
              flexShrink: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* Panel body — scrollable */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: "scroll",
          padding: "1.2rem 1.3rem 3rem",
          display: "flex", flexDirection: "column", gap: "1.1rem",
        }}>
          {IS_SECTIONS.map(sec => (
            <div key={sec.tag} style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 12 }}>
              {/* Section header */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.7rem",
                padding: "0.75rem 1rem",
                background: "rgba(15,35,64,0.03)",
                borderBottom: `1px solid ${border}`,
              }}>
                <span style={{
                  background: sec.tagBg || navy3, color: "#fff",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.65rem", fontWeight: 600,
                  padding: "3px 8px", borderRadius: 5, whiteSpace: "nowrap", flexShrink: 0,
                }}>{sec.tag}</span>
                <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#0f1b2d", lineHeight: 1.3 }}>
                  {sec.name}
                </span>
              </div>
              {/* Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.74rem" }}>
                <thead>
                  <tr>
                    {["Parameter", "Clause", "Limit"].map(h => (
                      <th key={h} style={{
                        background: "rgba(15,35,64,0.04)",
                        padding: "0.45rem 0.75rem", textAlign: "left",
                        fontSize: "0.63rem", fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        color: muted, borderBottom: `1px solid ${border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sec.rows.map(([param, clause, limit], i) => (
                    <tr key={i}>
                      <td style={{ padding: "0.5rem 0.75rem", borderBottom: i < sec.rows.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", color: "#0f1b2d", lineHeight: 1.4 }}>{param}</td>
                      <td style={{ padding: "0.5rem 0.75rem", borderBottom: i < sec.rows.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", fontFamily: "'DM Mono', monospace", color: "#0f1b2d" }}>{clause}</td>
                      <td style={{ padding: "0.5rem 0.75rem", borderBottom: i < sec.rows.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: navy3 }}>{limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AnimatedRoutes({ sla, tla, ifa, setSla, setTla, setIfa }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home sla={sla} tla={tla} ifa={ifa} setSla={setSla} setTla={setTla} setIfa={setIfa} /></PageTransition>} />
        <Route path="/cost" element={<PageTransition><Cost sla={sla} tla={tla} ifa={ifa} /></PageTransition>} />
        <Route path="/chemical" element={<PageTransition><Chemical /></PageTransition>} />
        <Route path="/physical" element={<PageTransition><Physical /></PageTransition>} />
        <Route path="/compare" element={<PageTransition><Compare /></PageTransition>} />
        <Route path="/sustainability" element={<PageTransition><Sustainability /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [sla, setSla] = useState(10);
  const [tla, setTla] = useState(5);
  const [ifa, setIfa] = useState(5);

  return (
    <>
      <BrowserRouter>
        <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e0dbd4", fontFamily: "'Source Sans 3', sans-serif" }}>
          <div style={{ background: "#6b1212", padding: "0.45rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.88)" }}>
              Department of Civil Engineering &nbsp;·&nbsp; An Autonomous Institute
            </span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>
              B.Tech Project-I &nbsp;·&nbsp; 6CV491 &nbsp;·&nbsp; March 2026
            </span>
          </div>
          <div style={{ padding: "1.2rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.8rem" }}>
            <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,transparent,#c9a227)", maxWidth: 150 }} />
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Walchand_College_of_Engineering_Sangli_logo.png/120px-Walchand_College_of_Engineering_Sangli_logo.png"
              alt="WCE"
              style={{ width: 70, height: 70, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))" }}
              onError={e => e.target.style.display = "none"}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.9rem", fontWeight: 800, color: "#0f1e30", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                Walchand College of <span style={{ color: "#6b1212" }}>Engineering</span>
              </div>
              <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "#7a7068", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.35rem" }}>
                Sangli &nbsp;·&nbsp; Government Colony, Vishrambag &nbsp;·&nbsp; Est. 1947
              </div>
            </div>
            <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,#c9a227,transparent)", maxWidth: 150 }} />
          </div>
          <div style={{ height: 4, background: "linear-gradient(90deg,#6b1212 0%,#c9a227 25%,#e8d090 50%,#c9a227 75%,#6b1212 100%)" }} />
        </div>

        <nav style={{ background: "#0f2340", display: "flex", alignItems: "center", gap: 0, padding: "0 1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
          {[
            { to: "/",               label: "🏠 Home" },
            { to: "/chemical",       label: "⚗️ Chemical Testing" },
            { to: "/physical",       label: "🔬 Physical Testing" },
            { to: "/compare",        label: "📊 Comparative Analysis" },
            { to: "/cost",           label: "💰 Cost Analysis" },
            { to: "/sustainability", label: "🌿 Sustainability Aspect" },
            { to: "/about",          label: "ℹ️ About Us" },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === "/"}
              style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none", position: "relative", whiteSpace: "nowrap" }}
            >
              {({ isActive }) => (
                <>
                  <span style={{ color: isActive ? NAV_GOLD : "rgba(255,255,255,0.65)", transition: "color 0.2s" }}>{label}</span>
                  {isActive && (
                    <motion.div layoutId="nav-underline"
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: NAV_GOLD }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <AnimatedRoutes sla={sla} tla={tla} ifa={ifa} setSla={setSla} setTla={setTla} setIfa={setIfa} />
    </BrowserRouter>
    </>
  );
}