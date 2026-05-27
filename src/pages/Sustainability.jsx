import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// ── TOKENS & UTILS ──────────────────────────────────────────────────
const C = {
  navy: "#0f2340", navy2: "#172d50", navy3: "#1e3a5f",
  gold: "#9a7820", gold2: "#c9a227",
  teal: "#0d8f6f", teal2: "#0aaf88",
  green: "#2a7a3b", green2: "#35a04d",
  amber: "#b86010",
  bg: "#f3f5f8", // Slightly cooler and deeper for glassmorphism pop
  surface: "white",
  border: "rgba(15,35,64,0.06)",
  text: "#0f1b2d", muted: "#4a5468", subtle: "#8a96aa",
};

const fmt = (n) => Math.round(n).toLocaleString("en-IN");
const fmtD = (n, d = 1) => (+n).toFixed(d);

// ── ANIMATED COUNTER ────────────────────────────────────────────────
function AnimatedCounter({ value, formatter = fmt }) {
  const rawValue = useMotionValue(0);
  const spring = useSpring(rawValue, { stiffness: 50, damping: 20 });
  const displayValue = useTransform(spring, (cur) => formatter(cur));

  useEffect(() => {
    rawValue.set(value);
  }, [value, rawValue]);

  return <motion.span>{displayValue}</motion.span>;
}

// ── ANIMATED CIRCULAR FLOW ──────────────────────────────────────────
function CircularFlow() {
  const nodes = [
    { id: "waste", label: "Industrial Waste", icon: "🏭", x: 320, y: 50, color: C.amber, bg: "rgba(184,96,16,0.1)" },
    { id: "process", label: "Ash Processing", icon: "⚙️", x: 560, y: 190, color: C.navy, bg: "rgba(15,35,64,0.1)" },
    { id: "cement", label: "Blended Cement", icon: "🧱", x: 560, y: 350, color: C.teal, bg: "rgba(13,143,111,0.1)" },
    { id: "build", label: "Green Concrete", icon: "🏙️", x: 320, y: 490, color: C.gold2, bg: "rgba(201,162,39,0.1)" },
    { id: "co2", label: "CO₂ Savings", icon: "🌿", x: 80, y: 350, color: C.green2, bg: "rgba(53,160,77,0.1)" },
    { id: "reuse", label: "Waste Diverted", icon: "♻️", x: 80, y: 190, color: C.teal2, bg: "rgba(10,175,136,0.1)" },
  ];

  const arcs = [
    { d: "M 380 70 C 470 70 560 110 560 150", color: C.amber },
    { d: "M 560 230 L 560 310", color: C.navy },
    { d: "M 560 390 C 560 450 450 490 380 490", color: C.teal },
    { d: "M 260 490 C 180 490 80 460 80 390", color: C.gold2 },
    { d: "M 80 310 L 80 230", color: C.green },
    { d: "M 80 150 C 80 110 180 70 260 70", color: C.teal2 },
  ];

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg viewBox="0 0 640 540" width="100%" style={{ display: "block", overflow: "visible" }}>
        
        {/* Animated Dashed Arrows */}
        {arcs.map((a, i) => (
          <g key={i}>
            <motion.path 
              d={a.d} 
              fill="none" 
              stroke={a.color} 
              strokeWidth="2" 
              strokeOpacity="0.3" 
            />
            <motion.path 
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: -100 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              d={a.d} 
              fill="none" 
              stroke={a.color} 
              strokeWidth="3"
              strokeDasharray="8 12"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Center Pulsing Sphere */}
        <motion.circle 
          initial={{ r: 65, opacity: 0.1 }}
          animate={{ r: 85, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          cx="320" cy="270" fill={C.teal} 
        />
        <circle cx="320" cy="270" r="70" fill="#fff" stroke={C.teal} strokeWidth="2" strokeDasharray="4 4" />
        <text x="320" y="265" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.navy} fontFamily="'Playfair Display',serif">CIRCULAR</text>
        <text x="320" y="285" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.navy} fontFamily="'Playfair Display',serif">ECONOMY</text>

        {/* Nodes */}
        {nodes.map((n, i) => (
          <motion.g 
            key={n.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: i * 0.15 }}
          >
            <circle cx={n.x} cy={n.y} r="45" fill="#fff" stroke={C.border} strokeWidth="1" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.06))" />
            <circle cx={n.x} cy={n.y} r="38" fill={n.bg} />
            <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize="24">{n.icon}</text>
            <text x={n.x} y={n.y + 16} textAnchor="middle" fontSize="11" fontWeight="700" fill={n.color} fontFamily="'Source Sans 3',sans-serif">
              {n.label.split(" ")[0]}
            </text>
            <text x={n.x} y={n.y + 28} textAnchor="middle" fontSize="10" fill={C.muted} fontFamily="'Source Sans 3',sans-serif">
               {n.label.split(" ").slice(1).join(" ")}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

// ── ACCORDION PILLARS ───────────────────────────────────────────────
function InteractivePillars() {
  const [openIdx, setOpenIdx] = useState(0);

  const pillars = [
    { icon: "🌍", title: "CO₂ Emission Reduction", content: "Replacing 10–20% clinker directly avoids emissions from the calcination step (0.83 kg CO₂ per kg of cement). A standard 1 km rural road using this mix immediately sequesters ~16,600 kg of atmospheric carbon footprint." },
    { icon: "♻️", title: "Waste Valorisation", content: "Sugarcane Ash, Turmeric Ash, and Incinerator Bottom Ash are currently immense liabilities in Maharashtra. This technology directly intercepts these landfill-destined materials." },
    { icon: "⛰️", title: "Limestone Conservation", content: "Every tonne of SCM utilized is a tonne of virgin limestone saved from ecologically destructive mining processes, shielding local biodiversity and limiting quarry expansion." },
    { icon: "⚡", title: "Energy Security", content: "Cement clinker requires heating kilns to 1,450 °C. The leaf and fly ashes are already processed thermally elsewhere, bypassing the energy expenditure entirely when substituted in the mixer." },
    { icon: "🇺🇳", title: "SDG Milestones", content: "Successfully bridging UN SDG 11 (Sustainable Cities), SDG 12 (Responsible Consumption & Production), and SDG 13 (Climate Action) using materials strictly available at zero procurement cost locally." }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {pillars.map((p, i) => {
        const isOpen = openIdx === i;
        return (
          <motion.div 
            key={i} layout onClick={() => setOpenIdx(i)}
            style={{
              background: isOpen ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
              backdropFilter: "blur(12px)", border: `1px solid ${isOpen ? C.teal : C.border}`,
              borderRadius: 16, padding: "1.5rem", cursor: "pointer", overflow: "hidden",
              boxShadow: isOpen ? "0 12px 30px rgba(13,143,111,0.08)" : "none",
              transition: "background 0.3s"
            }}
          >
            <motion.div layout style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ fontSize: "1.8rem", filter: isOpen?"none":"grayscale(100%)", transition: "0.3s" }}>{p.icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 700, color: isOpen ? C.navy : C.muted }}>
                {p.title}
              </div>
            </motion.div>
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: "1rem", color: C.muted, fontSize: "0.9rem", lineHeight: 1.6, paddingLeft: "2.8rem" }}
                >
                  {p.content}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  );
}


// ── MAIN COMPONENT ──────────────────────────────────────────────────
export default function Sustainability() {
  const [cementKg, setCementKg] = useState(5000);
  const [replPct, setReplPct] = useState(20);

  // Calculations
  const replaced = cementKg * (replPct / 100);
  const co2Saved = replaced * 0.83;
  const trees = co2Saved / 21;
  const driving = co2Saved / 0.237;

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif", background: C.bg, minHeight: "100vh", position: "relative", overflow: "hidden", paddingBottom: "5rem" }}>
      
      {/* ── AMBIENT BACKGROUND GRADIENTS (Glassmorphism effect) ── */}
      <div style={{ position: "absolute", top: -150, left: -100, width: 800, height: 800, background: "radial-gradient(circle, rgba(13,143,111,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: -200, width: 900, height: 900, background: "radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
      
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 2.5rem" }}>
        
        {/* ── HERO HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.teal, marginBottom: "0.8rem" }}>
            Environmental Impact
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "3.2rem", fontWeight: 800, color: C.navy, margin: "0 0 1rem", lineHeight: 1.1 }}>
            Sustainability at <span style={{ color: C.gold2 }}>Every Layer</span>
          </h1>
          <p style={{ fontSize: "1rem", color: C.muted, margin: "0 auto", maxWidth: 640, lineHeight: 1.6 }}>
            Turning agricultural and industrial waste from Maharashtra into highly resilient structural concrete. Tracking real-time CO₂ reductions and ecological restoration metrics.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginBottom: "3rem" }}>
          
          {/* LEFT: Accoridion Pillars */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
             <SectionTitle>The Core Directives</SectionTitle>
             <InteractivePillars />
          </motion.div>

          {/* RIGHT: Circular Economy Flow Map */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={{ display: "flex", flexDirection: "column" }}>
             <SectionTitle>Closed-Loop Economy Diagram</SectionTitle>
             <div style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", border: `1px solid ${C.border}`, borderRadius: 24, padding: "2rem", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.02)" }}>
               <CircularFlow />
             </div>
          </motion.div>
        </div>

        {/* ── GLASSMORPHIC CO2 SIMULATOR ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <SectionTitle>Live Carbon Impact Simulator</SectionTitle>
          <div style={{ 
            background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(24px)", 
            borderRadius: 24, border: "1px solid rgba(255,255,255,1)", 
            boxShadow: "0 20px 40px rgba(15,35,64,0.05)", padding: "2.5rem", overflow: "hidden" 
          }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "3rem" }}>
              {/* Controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: C.navy3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Project Cement Req.</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 800, color: C.text, fontSize: "1.1rem" }}>{fmt(cementKg)} kg</span>
                  </div>
                  <input 
                    type="range" min={1000} max={100000} step={1000} value={cementKg} onChange={e => setCementKg(+e.target.value)}
                    style={{ width: "100%", accentColor: C.gold2, cursor: "pointer" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: C.navy3, textTransform: "uppercase", letterSpacing: "0.05em" }}>SCM Replacement</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 800, color: C.teal, fontSize: "1.1rem" }}>{replPct}%</span>
                  </div>
                  <input 
                    type="range" min={0} max={30} step={1} value={replPct} onChange={e => setReplPct(+e.target.value)}
                    style={{ width: "100%", accentColor: C.teal, cursor: "pointer" }}
                  />
                  <div style={{ background: "rgba(13,143,111,0.1)", borderRadius: 8, padding: "0.75rem 1rem", marginTop: "1.5rem" }}>
                    <span style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}>💡</span>
                    <span style={{ fontSize: "0.75rem", color: C.teal, fontWeight: 600 }}>M3 applies a 25% ternary substitution rate.</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Readouts */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                {[
                  { k: "Raw CO₂ Avoided", v: co2Saved, u: "kg", c: C.teal, ic: "☁️" },
                  { k: "Landfill Diverted", v: replaced, u: "kg", c: C.gold2, ic: "🚜" },
                  { k: "Trees equivalent", v: trees, u: "trees", c: C.green2, ic: "🌲" },
                  { k: "Car distance", v: driving, u: "km", c: C.amber, ic: "🚙" },
                ].map((stat, i) => (
                  <div key={i} style={{ 
                    background: "rgba(255,255,255,0.9)", border: `1px solid ${C.border}`, borderRadius: 16, 
                    padding: "1.5rem 1rem", textAlign: "center", display: "flex", flexDirection: "column", 
                    alignItems: "center", justifyContent: "center" 
                  }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}>{stat.ic}</div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.6rem", fontWeight: 800, color: stat.c, lineHeight: 1.2 }}>
                      <AnimatedCounter value={stat.v} />
                    </div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.muted, marginTop: "0.2rem" }}>{stat.u}</div>
                    <div style={{ fontSize: "0.7rem", color: C.subtle, margin: "0.5rem 0 0", lineHeight: 1.3 }}>{stat.k}</div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </motion.div>
        
        {/* FOOTER PANNEL */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginTop: "4rem", textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: "2rem" }}>
           <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 800, color: C.navy3 }}>Walchand College of Engineering, Sangli</div>
           <div style={{ fontSize: "0.8rem", color: C.muted, marginTop: "0.5rem", letterSpacing: "0.05em" }}>Department of Civil Engineering · B.Tech. Final Year Project 2025–26</div>
           <div style={{ fontSize: "0.7rem", color: C.subtle, marginTop: "1rem" }}>Tanvi Patil · Payal Pise · Kaveri Konnur · Aniket Khandare · Kedar Patil · Guide: AA Magdum</div>
        </motion.div>

      </div>
    </div>
  );
}

// ── UTILITIES ───────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: C.muted, marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
      {children}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(15,35,64,0.1) 0%, transparent 100%)" }} />
    </div>
  );
}