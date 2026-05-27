import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── COLOUR TOKENS ──────────────────────────────────────────────────
const C = {
  navy: "#0f2340", navy2: "#172d50", navy3: "#1e3a5f",
  gold: "#9a7820", gold2: "#c9a227", goldLt: "#fdf6e3",
  teal: "#0d8f6f", tealLt: "#e3f5ef",
  red: "#6b1212", redLt: "#fdeaea",
  amber: "#b86010", ambLt: "#fdf0e0",
  bg: "#f5f3ef", surface: "#ffffff",
  border: "rgba(15,35,64,0.09)",
  text: "#0f1b2d", muted: "#4a5468", subtle: "#7a8498",
};

const MIX_COLORS = ["#4a4a5a", "#1e3a5f", "#2c5282", "#0d8f6f", "#b86010", "#6b1212"];
const MIX_SHORT  = ["M0(C)", "M1", "M2", "M3★", "M4", "M5"];
const MIX_FULL   = ["OPC Control", "Conservative", "Balanced", "Recommended", "High Repl.", "Upper Limit"];

// ── DATA ───────────────────────────────────────────────────────────
const DATA = {
  strength: {
    id: "strength",
    label: "Strength Activity Index", unit: "%", maxValue: 120, rawUnit: "MPa",
    icon: "📈",
    metrics: {
      60: {
        "7 Days":  [24.52, 32.12, 26.45, 24.18, 26.68, 27.71],
        "28 Days": [39.1,  35.4,  36.8,  40.2,  38.2,  33.1]
      },
      90: {
        "7 Days":  [23.15, 24.68, 24.88, 25.64, 23.47, 23.96],
        "28 Days": [43.2,  38.6,  40.1,  44.7,  41.8,  36.5]
      }
    },
    isRawStrength: true,
    insights: [
      { t: "Top Performer", v: "M3 (108.4%)", c: C.teal },
      { t: "ASTM C311 Limit", v: "Min 75%", c: C.navy3 },
      { t: "Late Age", v: "Gain at 28D", c: C.gold }
    ],
    info: "Strength Activity Index compares the compressive strength of blended cement cubes against a 100% OPC control mix. M3 exceeds the control at 28 days."
  },
  ist: {
    id: "ist",
    label: "Initial Setting Time", unit: "min", rawUnit: "min", maxValue: 220,
    icon: "⏱",
    metrics: {
      60: { "Initial Set": [35, 68, 75, 84, 78, 65] },
      90: { "Initial Set": [35, 62, 48, 38, 42, 46] }
    },
    insights: [
      { t: "IS 269 Safe Min", v: "30 mins", c: C.navy3 },
      { t: "Code Compliance", v: "All Pass", c: C.teal }
    ],
    info: "SCM blends delay setting, which is highly beneficial for hot climates and mass concreting."
  },
  fst: {
    id: "fst",
    label: "Final Setting Time", unit: "min", rawUnit: "min", maxValue: 650,
    icon: "⏳",
    metrics: {
      60: { "Final Set": [280, 235, 264, 222, 236, 250] },
      90: { "Final Set": [280, 157, 168, 185, 138, 120] }
    },
    insights: [
      { t: "IS 269 Boundary", v: "Max 600 mins", c: C.navy3 },
      { t: "Set Retardation", v: "Beneficial", c: C.gold }
    ],
    info: "Final setting time measurement ensures the concrete reaches adequate structural integrity within acceptable working hours."
  },
  consistency: {
    id: "consistency",
    label: "Standard Consistency", unit: "%", rawUnit: "%", maxValue: 40,
    icon: "💧",
    metrics: {
      60: { "Water Demand": [28.0, 33.0, 34.5, 36.6, 40.5, 42.5] },
      90: { "Water Demand": [28.0, 33.0, 37.0, 40.0, 42.0, 43.5] }
    },
    insights: [
      { t: "Average Demand", v: "≈ 30%", c: C.navy3 },
      { t: "High SSA effect", v: "Slight Increase", c: C.red }
    ],
    info: "SCM particles often have higher surface area than OPC, which can slightly increase water demand (Consistency) to reach a standard paste flow."
  },
  spgav: {
    id: "spgav",
    label: "Specific Gravity", unit: "g/cc", rawUnit: "g/cc", maxValue: 3.5,
    icon: "⚖️",
    metrics: {
      60: { "Density": [3.15, 3.02, 2.98, 2.92, 2.88, 2.82] },
      90: { "Density": [3.15, 3.02, 2.98, 2.92, 2.88, 2.82] }
    },
    insights: [
      { t: "Control Density", v: "3.15 g/cc", c: C.navy3 },
      { t: "Weight Saving", v: "≈ 8% lighter", c: C.teal }
    ],
    info: "The specific gravity of SCM is lower than OPC, leading to a lighter concrete volume for the same mass."
  }
};

const PROPS = Object.keys(DATA);

// ── AXES FOR RADAR ────────────────────────────────────────────────
const RADAR_AXES = (grind) => [
  { label: "28D Strength (MPa)", max: 60, valFn: i => DATA.strength.metrics[grind]["28 Days"][i] },
  { label: "Specific Gravity", max: 3.5, valFn: i => DATA.spgav.metrics[grind]["Density"][i] },
  { label: "Consistency (%)", max: 40, valFn: i => DATA.consistency.metrics[grind]["Water Demand"][i] },
  { label: "Initial Set (min)", max: 200, valFn: i => DATA.ist.metrics[grind]["Initial Set"][i] },
];

// Radar dimensions
const R_CX = 400; const R_CY = 230; const R_RADIUS = 160;

function getRadarPoint(angle, value, max) {
  const r = (value / max) * R_RADIUS;
  const rad = angle * (Math.PI / 180);
  return { x: R_CX + r * Math.sin(rad), y: R_CY - r * Math.cos(rad) };
}

// ── COMPONENT ──────────────────────────────────────────────────────
export default function Compare() {
  const [grind, setGrind] = useState(90); // 60 or 90
  const [activeProp, setActiveProp] = useState("strength");
  const propData = DATA[activeProp];
  
  const metricKeys = Object.keys(propData.metrics[grind]);
  const [activeSub, setActiveSub] = useState(metricKeys[metricKeys.length - 1]);
  const [compareMode, setCompareMode] = useState(false);
  const [viewMode, setViewMode] = useState("bar"); // "bar", "line", "radar", "table"

  const handlePropChange = (p) => {
    setActiveProp(p);
    const newKeys = Object.keys(DATA[p].metrics[grind]);
    setActiveSub(newKeys[newKeys.length - 1]);
    if (viewMode === "line" && p !== "strength") setViewMode("bar");
  };

  const rawValues = propData.metrics[grind][activeSub] || propData.metrics[grind][metricKeys[0]];
  
  const computedValues = useMemo(() => {
    const baseValue = rawValues[0];
    if (propData.isRawStrength && !compareMode) return rawValues.map(v => (v / baseValue) * 100);
    if (compareMode) return rawValues.map(v => ((v - baseValue) / baseValue) * 100);
    return rawValues;
  }, [rawValues, compareMode, propData.isRawStrength]);

  const topPerformerIdx = useMemo(() => {
    let maxVal = -Infinity;
    let maxIdx = 0;
    computedValues.forEach((v, i) => {
      if (v > maxVal) { maxVal = v; maxIdx = i; }
    });
    return maxIdx;
  }, [computedValues]);

  const dynamicInsights = useMemo(() => {
    let base = [...propData.insights];
    if (activeProp === "strength") {
       const maxVal = computedValues[topPerformerIdx];
       const topMix = MIX_SHORT[topPerformerIdx].replace("★", "").replace("(C)", "");
       let valStr = maxVal.toFixed(1) + "%";
       base[0] = { ...base[0], v: `${topMix} (${valStr})` };
    }
    return base;
  }, [propData, computedValues, activeProp, topPerformerIdx]);

  const displayUnit = compareMode ? "% Δ" : propData.unit;
  const isDelta = compareMode;

  const getGraphBounds = () => {
    if (isDelta) {
        let maxAbs = Math.max(...computedValues.map(Math.abs));
        if (maxAbs === 0) maxAbs = 10;
        const limit = Math.ceil(maxAbs * 1.2);
        return { min: -limit, max: limit, range: limit * 2 };
    }
    return { min: 0, max: propData.maxValue, range: propData.maxValue };
  }

  const { min: gMin, max: gMax, range: gRange } = getGraphBounds();

  // Radar Polygon Strings
  const getRadarPoly = (mixIndex) => {
    const axes = RADAR_AXES(grind);
    return axes.map((axis, i) => {
      const angle = i * (360 / axes.length);
      const val = axis.valFn(mixIndex);
      const pt = getRadarPoint(angle, val, axis.max);
      return `${pt.x},${pt.y}`;
    }).join(" ");
  }

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif", background: C.bg, minHeight: "100vh", paddingBottom: "5rem" }}>
      
      {/* ── HEADER ── */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.2rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.red, marginBottom: "0.2rem" }}>
              Analytic Dashboard
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 800, color: "#0f1e30" }}>
              Cross-Mix Comparative Analysis
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            {["IS 269", "IS 456", "ASTM C311"].map(tag => (
              <span key={tag} style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em", color: C.navy3, border: `1px solid ${C.border}`, background: C.bg, padding: "4px 10px", borderRadius: 6 }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <div style={{ maxWidth: 1200, margin: "2.5rem auto 0", padding: "0 2.5rem" }}>
        
        {/* VIEW SELECTOR TABS */}
        <div style={{ display: "flex", gap: "0.8rem", marginBottom: "2rem", borderBottom: `1px solid ${C.border}`, paddingBottom: "1.5rem", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.8rem" }}>
            {[
              { id: "bar", name: "Bar Analysis", icon: "📊" },
              { id: "line", name: "Trend Line (Strength)", icon: "📈", hidden: activeProp !== "strength" },
              { id: "radar", name: "Holistic Radar (M0 vs M3)", icon: "🕸️" },
              { id: "table", name: "Full Data Matrix", icon: "📋" }
            ].filter(t => !t.hidden).map(t => (
              <button
                key={t.id}
                onClick={() => setViewMode(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  background: viewMode === t.id ? C.navy : C.surface, color: viewMode === t.id ? "#fff" : C.muted,
                  border: viewMode === t.id ? `1px solid ${C.navy}` : `1px solid ${C.border}`,
                  padding: "0.6rem 1.2rem", borderRadius: 20, cursor: "pointer",
                  fontWeight: 700, fontSize: "0.8rem", transition: "0.2s"
                }}
              >
                <span>{t.icon}</span> {t.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(15,35,64,0.04)", padding: "4px", borderRadius: 8, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", color: C.muted, paddingLeft: "8px" }}>Fineness</span>
            {[60, 90].map(g => (
              <button
                key={g}
                onClick={() => setGrind(g)}
                style={{
                  padding: "6px 14px", border: "none", borderRadius: 6,
                  background: grind === g ? C.gold2 : "transparent",
                  color: grind === g ? "#fff" : C.muted,
                  fontSize: "0.74rem", fontWeight: 700, cursor: "pointer",
                  transition: "all 0.2s", fontFamily: "'DM Mono', monospace"
                }}
              >
                {g} Grind
              </button>
            ))}
          </div>
        </div>

        {viewMode !== "table" && viewMode !== "radar" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "2rem" }}>
            {/* ── LEFT SIDEBAR (Controls) ── */}
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.gold, marginBottom: "1rem" }}>
                Select Property
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "2rem" }}>
                {PROPS.map(p => {
                  const isActive = activeProp === p;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePropChange(p)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.8rem",
                        background: isActive ? C.navy : C.surface,
                        color: isActive ? "#fff" : C.text,
                        border: isActive ? `1px solid ${C.navy}` : `1px solid ${C.border}`,
                        padding: "0.8rem 1.2rem", borderRadius: 12, cursor: "pointer",
                        boxShadow: isActive ? "0 8px 20px rgba(15,35,64,0.15)" : "none",
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        textAlign: "left"
                      }}
                    >
                      <span style={{ fontSize: "1.2rem", opacity: isActive ? 1 : 0.6 }}>{DATA[p].icon}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: isActive ? 700 : 500 }}>{DATA[p].label}</span>
                    </button>
                  )
                })}
              </div>

              {metricKeys.length > 1 && viewMode !== "line" && (
                <AnimatePresence mode="popLayout">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.gold, marginBottom: "1rem" }}>
                      Curing Timeline
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {metricKeys.map(k => (
                        <button
                          key={k}
                          onClick={() => setActiveSub(k)}
                          style={{
                            background: activeSub === k ? C.teal : C.bg,
                            color: activeSub === k ? "#fff" : C.muted,
                            border: activeSub === k ? `1px solid ${C.teal}` : `1px solid ${C.border}`,
                            padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600,
                            cursor: "pointer", transition: "all 0.15s"
                          }}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>

            {/* ── MAIN DASHBOARD ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
                {/* KPI Cards */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: "flex", gap: "1rem", flex: 1 }}>
                  {dynamicInsights.map((ins, i) => (
                    <div key={i} style={{ flex: 1, background: C.surface, borderRadius: 14, padding: "1rem 1.2rem", border: `1px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginBottom: "0.3rem" }}>
                        {ins.t}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 800, color: ins.c }}>
                        {ins.v}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Dynamic Chart Container */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ background: C.surface, borderRadius: 16, padding: "2rem", border: `1px solid ${C.border}`, boxShadow: "0 12px 40px rgba(15,35,64,0.04)" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 700, color: C.navy }}>
                      {viewMode === "line" ? "Strength Development Curve" : propData.label}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: C.subtle, marginTop: "0.2rem" }}>
                      {viewMode === "line" ? "Progression from 7 to 56 Days" : `Displaying values for ${activeSub}`}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {viewMode === "bar" && (
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "6px 12px", background: compareMode ? C.navy : C.bg, borderRadius: 8, transition: "0.2s" }}>
                        <input type="checkbox" style={{ accentColor: C.gold2 }} checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} />
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: compareMode ? "#fff" : C.text }}>Compare vs Standard Cube</span>
                      </label>
                    )}
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.85rem", color: C.teal, fontWeight: 700, background: C.tealLt, padding: "4px 12px", borderRadius: 20 }}>
                      Unit: {displayUnit}
                    </div>
                  </div>
                </div>

                {/* VISUALIZATION: BAR CHART */}
                {viewMode === "bar" && (
                  <div style={{ width: "100%", height: 340, position: "relative", marginTop: "1rem" }}>
                    <svg viewBox="0 0 800 340" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                      {[0, 1, 2, 3, 4].map(line => {
                        const y = 300 - (line * (300 / 4));
                        const val = isDelta ? gMin + (line * (gRange / 4)) : (gMax / 4) * line;
                        return (
                          <g key={`grid-${line}`}>
                            <line x1="40" y1={y} x2="760" y2={y} stroke={val === 0 && isDelta ? C.text : C.border} strokeWidth={val === 0 && isDelta ? "2" : "1"} strokeDasharray={val === 0 ? "none" : "4 4"} />
                            <text x="30" y={y + 4} fontSize="11" fill={val === 0 && isDelta ? C.text : C.muted} textAnchor="end" fontFamily="'DM Mono', monospace">
                              {isDelta && val > 0 ? "+" : ""}{val.toFixed(1)}
                            </text>
                          </g>
                        )
                      })}
                      {computedValues.map((v, i) => {
                        let h, y;
                        if (isDelta) {
                            const zeroY = 300 - ((0 - gMin) / gRange) * 300;
                            const barY = 300 - ((v - gMin) / gRange) * 300;
                            h = Math.abs(zeroY - barY);
                            y = v >= 0 ? barY : zeroY;
                        } else {
                            h = Math.max(0, (v / gMax) * 300);
                            y = 300 - h;
                        }
                        const x = 70 + i * 115;
                        const isTop = i === topPerformerIdx;
                        const valColor = isDelta ? (v > 0 ? C.teal : v < 0 ? C.red : C.muted) : C.text;
                        return (
                          <g key={`bar-${activeProp}-${activeSub}-${compareMode}-${i}`}>
                            <motion.rect
                              initial={{ height: 0, y: isDelta ? 300 - ((0 - gMin) / gRange) * 300 : 300 }}
                              animate={{ height: h, y: y }}
                              transition={{ type: "spring", stiffness: 60, damping: 14, delay: i * 0.05 }}
                              x={x} width="55" fill={isTop && !isDelta ? "url(#m3-grad)" : MIX_COLORS[i]} rx="6"
                              style={{ filter: isTop && !isDelta ? "drop-shadow(0px 8px 16px rgba(13,143,111,0.3))" : "none" }}
                            />
                            <motion.text
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                              x={x + 27.5} y={v >= 0 ? y - 8 : y + h + 16} textAnchor="middle" fill={valColor} fontSize="12" fontWeight="700" fontFamily="'DM Mono', monospace"
                            >
                              {isDelta && v > 0 ? "+" : ""}{v.toFixed(1)}{isDelta ? "%" : ""}
                            </motion.text>
                            <text x={x + 27.5} y={325} textAnchor="middle" fill={C.navy3} fontSize="12" fontWeight="700" fontFamily="'Source Sans 3', sans-serif">{MIX_SHORT[i]}</text>
                            <text x={x + 27.5} y={340} textAnchor="middle" fill={C.subtle} fontSize="10" fontFamily="'Source Sans 3', sans-serif">{MIX_FULL[i]}</text>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                )}

                {viewMode === "line" && (
                  <div style={{ width: "100%", height: 340, position: "relative", marginTop: "1rem" }}>
                    <svg viewBox="0 0 800 340" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                      
                      {/* Fixed Y-Axis Zoom: 80 to 140 */}
                      {[80, 100, 120, 140].map(val => {
                        const y = 300 - ((val - 80) / 60) * 300;
                        return (
                          <g key={`lgrid-${val}`}>
                            <line x1="40" y1={y} x2="760" y2={y} stroke={C.border} strokeWidth="1" strokeDasharray="4 4" />
                            <text x="30" y={y + 4} fontSize="11" fill={C.muted} textAnchor="end" fontFamily="'DM Mono', monospace">{val}</text>
                          </g>
                        )
                      })}
                      
                      {/* Area Fill for top performer First */}
                      {(() => {
                        const topIdx = topPerformerIdx;
                        const points = ["7 Days", "28 Days"].map((day, dIdx) => {
                          const base = propData.metrics[grind][day][0]; // M0
                          const v = (propData.metrics[grind][day][topIdx] / base) * 100;
                          return { px: 100 + dIdx * 600, py: 300 - ((v - 80) / 60) * 300 };
                        });
                        const areaPath = `M 100,300 L ${points[0].px},${points[0].py} L ${points[1].px},${points[1].py} L 700,300 Z`;
                        return (
                          <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            d={areaPath}
                            fill="url(#m3-area-grad)"
                          />
                        )
                      })()}

                      {MIX_COLORS.map((color, mixIndex) => {
                        const points = ["7 Days", "28 Days"].map((day, dIdx) => {
                          const base = propData.metrics[grind][day][0]; // M0
                          const v = (propData.metrics[grind][day][mixIndex] / base) * 100;
                          const px = 100 + dIdx * 600;
                          const py = 300 - ((v - 80) / 60) * 300;
                          return { px, py, v };
                        });
                        
                        // Straight line for 2 points
                        const pt1 = points[0]; const pt2 = points[1];
                        const pathD = `M ${pt1.px},${pt1.py} L ${pt2.px},${pt2.py}`;
                        
                        return (
                          <g key={`lines-${mixIndex}`}>
                            <motion.path
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.5, ease: "easeInOut" }}
                              d={pathD}
                              fill="none"
                              stroke={mixIndex === 3 ? C.teal : color}
                              strokeWidth={mixIndex === 3 ? "4" : "2"}
                              strokeOpacity={mixIndex === 3 ? "1" : "0.5"}
                            />
                            {points.map((p, pIdx) => (
                              <motion.circle
                                key={`pt-${mixIndex}-${pIdx}`}
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 + pIdx * 0.1 }}
                                cx={p.px} cy={p.py} r={mixIndex === 3 ? 6 : 4}
                                fill={mixIndex === 3 ? C.teal : color}
                              />
                            ))}
                            {/* Data label for M3 */}
                            {mixIndex === 3 && points.map((p, pIdx) => (
                              <motion.text
                                key={`lbl-${pIdx}`}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}
                                x={p.px} y={p.py - 12}
                                textAnchor="middle" fill={C.teal} fontSize="12" fontWeight="700" fontFamily="'DM Mono', monospace"
                              >
                                {p.v.toFixed(1)}%
                              </motion.text>
                            ))}
                          </g>
                        )
                      })}
                      
                      {/* X-axis labels */}
                      {["7 Days", "28 Days"].map((day, dIdx) => (
                        <text key={day} x={100 + dIdx * 600} y={325} textAnchor="middle" fill={C.text} fontSize="13" fontWeight="700" fontFamily="'DM Mono', monospace">{day}</text>
                      ))}

                      {/* Horizontal Legend at top-center to prevent overlap */}
                      <g transform="translate(200, 20)">
                         {MIX_SHORT.map((m, i) => (
                           <g key={m} transform={`translate(${i * 65}, 0)`}>
                             <circle cx="0" cy="-3" r="4" fill={i === 3 ? C.teal : MIX_COLORS[i]} />
                             <text x="8" y="0" fontSize="10" fill={C.muted} fontFamily="'DM Mono', monospace">{m}</text>
                           </g>
                         ))}
                      </g>
                      
                      <defs>
                        <linearGradient id="m3-area-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0d8f6f" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#0d8f6f" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* VISUALIZATION: RADAR SCORECARD */}
        {viewMode === "radar" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: C.surface, borderRadius: 16, padding: "3rem 2rem", border: `1px solid ${C.border}`, boxShadow: "0 12px 40px rgba(15,35,64,0.04)" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.teal }}>Holistic Trade-off Analysis</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 800, color: C.navy, marginTop: "0.5rem" }}>
                Control (M0) vs Recommended Mix (M3)
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: C.muted, fontFamily: "'Playfair Display',serif", marginBottom: "1rem", textAlign: "right" }}>OPC Baseline</div>
                {RADAR_AXES(grind).map((ax, i) => (
                   <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem", borderBottom: `1px solid ${C.border}`, textAlign: "right" }}>
                     <span style={{ fontSize: "0.85rem", color: C.muted }}>{ax.label}</span>
                     <span style={{ fontSize: "1rem", fontFamily: "'DM Mono',monospace", fontWeight: 700, color: C.text }}>{ax.valFn(0)}</span>
                   </div>
                ))}
              </div>

              {/* RADAR SVG */}
              <div style={{ width: 440, height: 460, position: "relative" }}>
                 <svg viewBox="0 0 800 500" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                    {/* Spider Webb */}
                    {[0.2, 0.4, 0.6, 0.8, 1.0].map(scale => (
                      <polygon 
                        key={`web-${scale}`}
                        points={RADAR_AXES(grind).map((_, i) => {
                          const pt = getRadarPoint(i * (360 / RADAR_AXES(grind).length), scale, 1);
                          return `${pt.x},${pt.y}`;
                        }).join(" ")}
                        fill="none" stroke={C.border} strokeWidth="1"
                      />
                    ))}
                    {/* Axis Lines */}
                    {RADAR_AXES(grind).map((ax, i) => {
                      const pt = getRadarPoint(i * (360 / RADAR_AXES(grind).length), 1, 1);
                      return <line key={`ax-${i}`} x1={R_CX} y1={R_CY} x2={pt.x} y2={pt.y} stroke={C.border} strokeWidth="1.5" />
                    })}

                    {/* M0 Polygon */}
                    <motion.polygon
                      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: `${R_CX}px ${R_CY}px` }} transition={{ duration: 0.8 }}
                      points={getRadarPoly(0)} fill="rgba(74, 84, 104, 0.2)" stroke={C.muted} strokeWidth="2"
                    />

                    {/* M3 Polygon */}
                    <motion.polygon
                      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: `${R_CX}px ${R_CY}px` }} transition={{ duration: 0.8, delay: 0.4 }}
                      points={getRadarPoly(3)} fill="rgba(13, 143, 111, 0.3)" stroke={C.teal} strokeWidth="3"
                    />

                    {/* Radar Labels */}
                    {RADAR_AXES(grind).map((ax, i) => {
                      const pt = getRadarPoint(i * (360 / RADAR_AXES(grind).length), 1.15, 1);
                      return (
                        <text key={`lbl-${i}`} x={pt.x} y={pt.y} textAnchor="middle" alignmentBaseline="middle" fill={C.navy3} fontSize="14" fontWeight="700" fontFamily="'Source Sans 3', sans-serif">
                          {ax.label}
                        </text>
                      )
                    })}
                 </svg>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: C.teal, fontFamily: "'Playfair Display',serif", marginBottom: "1rem" }}>Ternary Blend (M3)</div>
                {RADAR_AXES(grind).map((ax, i) => (
                   <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem", borderBottom: `1px solid ${C.border}` }}>
                     <span style={{ fontSize: "1rem", fontFamily: "'DM Mono',monospace", fontWeight: 700, color: C.teal }}>{ax.valFn(3)}</span>
                     <span style={{ fontSize: "0.85rem", color: C.muted }}>{ax.label}</span>
                   </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VISUALIZATION: FULL DATA TABLE */}
        {viewMode === "table" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: C.surface, borderRadius: 16, padding: "2rem", border: `1px solid ${C.border}`, boxShadow: "0 12px 40px rgba(15,35,64,0.04)" }}>
             <SectionTitle>Raw Measurement & IS Code Matrix</SectionTitle>
             <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                <thead>
                  <tr>
                    <th style={{ ...TH_ST }}>Property / Test</th>
                    {MIXES.map((m, i) => <th key={m} style={{ ...TH_ST, color: i === 3 ? C.teal : C.navy3 }}>{m}{i===3?"★":""}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Object.values(DATA).map((prop) => {
                    return Object.entries(prop.metrics[grind]).map(([key, vals], rowIdx) => (
                      <tr key={`${prop.id}-${key}`} style={{ borderBottom: `1px solid ${C.border}`, background: rowIdx % 2 === 0 ? "#fff" : C.bg }}>
                        <td style={{ padding: "0.8rem 1rem", fontWeight: 600, color: C.text }}>
                          {prop.label} <span style={{ color: C.muted, fontWeight: 400 }}>({key})</span>
                        </td>
                        {vals.map((val, i) => (
                          <td key={i} style={{ padding: "0.8rem 1rem", fontFamily: "'DM Mono',monospace", color: i === 3 ? C.teal : C.muted, fontWeight: i === 0 ? 700 : 500 }}>
                            {val} {prop.rawUnit}
                          </td>
                        ))}
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
             </div>
          </motion.div>
        )}

        {/* Gradient Defs Needed Globally */}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="m3-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#0d8f6f" /></linearGradient>
          </defs>
        </svg>

      </div>
    </div>
  );
}

const MIXES = ["OPC (M0)", "M1", "M2", "M3", "M4", "M5"];
const TH_ST = {
  padding: "1rem", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", 
  textTransform: "uppercase", borderBottom: `2px solid ${C.border}`, background: C.bg
};
function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.navy3, marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
      {children}
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}