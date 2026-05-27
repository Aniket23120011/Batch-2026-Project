import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ── TOKENS & UTILS ──────────────────────────────────────────────────
const C = {
  navy: "#0f2340", navy2: "#172d50", navy3: "#1e3a5f",
  gold: "#9a7820", gold2: "#c9a227", gold3: "#e8bf5a",
  teal: "#0d8f6f", teal2: "#0aaf88",
  amber: "#b86010",
  bg: "#f3f5f8", // Deepened for glassmorphism pop
  surface: "white",
  border: "rgba(15,35,64,0.08)",
  text: "#0f1b2d", muted: "#4a5468", subtle: "#8a96aa",
};

const fmt = (n) => Math.round(n).toLocaleString("en-IN");
const fmtD = (n, d = 1) => (+n).toFixed(d);

// ── ANIMATED COUNTER ────────────────────────────────────────────────
function AnimatedCounter({ value, formatter = fmt }) {
  const rawValue = useMotionValue(0);
  const spring = useSpring(rawValue, { stiffness: 60, damping: 20 });
  const displayValue = useTransform(spring, (cur) => formatter(cur));

  useEffect(() => {
    rawValue.set(value);
  }, [value, rawValue]);

  return <motion.span>{displayValue}</motion.span>;
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────
export default function Cost({ sla = 10, tla = 5, ifa = 5 }) {
  const repl = sla + tla + ifa; // Default typically 20%

  const [kg, setKg] = useState(1000);
  const [opcPrice, setOpcPrice] = useState(370);
  const [scmKg, setScmKg] = useState(1);

  // ── CALCULATIONS ──────────────────────────────────────────────────
  const opcKgRate = opcPrice / 50;
  const replaced = kg * (repl / 100);
  const fullCost = kg * opcKgRate;
  
  const blendOpcCost = (kg - replaced) * opcKgRate;
  const scmCost = replaced * scmKg;
  const blendCost = blendOpcCost + scmCost;
  
  const netSavings = fullCost - blendCost;
  const pctSaved = fullCost > 0 ? (netSavings / fullCost) * 100 : 0;
  const co2Avoided = replaced * 0.83;
  
  // Rate difference per kg
  const r20 = (opcKgRate * (repl / 100)) - (scmKg * (repl / 100));

  // Donut Chart logic
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const scmStrokeOffset = circumference - (repl / 100) * circumference;

  const scaleItems = [
    { icon: "🧪", name: "Lab Experiment", sub: "10–50 kg cement", val: 50 },
    { icon: "🏠", name: "Small Room Slab", sub: "~500 kg cement", val: 500 },
    { icon: "🏗️", name: "1,000 sq ft House", sub: "~20,000 kg", val: 20000 },
    { icon: "🛣️", name: "1 km Rural Road", sub: "~1,00,000 kg", val: 100000, highlight: true },
  ];

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif", background: C.bg, minHeight: "100vh", position: "relative", overflow: "hidden", paddingBottom: "5rem" }}>
      
      {/* ── AMBIENT GLASSMORPHISM BACKGROUND ── */}
      <div style={{ position: "absolute", top: -100, right: -150, width: 800, height: 800, background: "radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", left: -200, width: 900, height: 900, background: "radial-gradient(circle, rgba(13,143,111,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />
      
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 2.5rem" }}>
        
        {/* ── HERO HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold2, marginBottom: "0.8rem" }}>
            Economic Feasibility
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "3.2rem", fontWeight: 800, color: C.navy, margin: "0 0 1rem", lineHeight: 1.1 }}>
            Financial <span style={{ color: C.teal }}>Viability</span>
          </h1>
          <p style={{ fontSize: "1rem", color: C.muted, margin: "0 auto", maxWidth: 640, lineHeight: 1.6 }}>
            Calculating the direct cost savings of replacing commercial OPC with zero-procurement-cost agricultural and industrial waste ashes.
          </p>
        </motion.div>

        {/* ── TOP SECTION: CONTROL DECK + INVOICE ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2.5rem", marginBottom: "3rem" }}>
          
          {/* GLASSMORPHIC CONTROL DECK */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ display: "flex", flexDirection: "column" }}>
            <SectionTitle>Fintech Control Deck</SectionTitle>
            <div style={{ 
              background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(24px)", 
              border: `1px solid rgba(255,255,255,1)`, borderRadius: 24, padding: "2.5rem", 
              boxShadow: "0 20px 40px rgba(15,35,64,0.04)", flex: 1, display: "flex", flexDirection: "column", gap: "2.5rem" 
            }}>
              
              {/* Slider 1: OPC Quantity */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.navy3 }}>Project Cement Req.</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.2rem", fontWeight: 800, color: C.navy }}>{fmt(kg)} kg</span>
                </div>
                <input 
                   type="range" min={100} max={100000} step={100} value={kg} onChange={e => setKg(+e.target.value)}
                   style={{ width: "100%", accentColor: C.navy3, cursor: "pointer", height: "6px" }}
                />
              </div>

              {/* Slider 2: OPC Market Price */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.navy3 }}>Market OPC 53 Price</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.2rem", fontWeight: 800, color: C.gold2 }}>₹{opcPrice} <span style={{fontSize:"0.7rem", color:C.subtle}}>/ 50kg</span></span>
                </div>
                <input 
                   type="range" min={300} max={500} step={5} value={opcPrice} onChange={e => setOpcPrice(+e.target.value)}
                   style={{ width: "100%", accentColor: C.gold2, cursor: "pointer", height: "6px" }}
                />
              </div>

              {/* Slider 3: SCM Processing Cost */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.navy3 }}>SCM Grinding Cost</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.2rem", fontWeight: 800, color: C.teal }}>₹{fmtD(scmKg,1)} <span style={{fontSize:"0.7rem", color:C.subtle}}>/ kg</span></span>
                </div>
                <input 
                   type="range" min={0} max={3} step={0.1} value={scmKg} onChange={e => setScmKg(+e.target.value)}
                   style={{ width: "100%", accentColor: C.teal, cursor: "pointer", height: "6px" }}
                />
                <div style={{ marginTop: "0.6rem", fontSize: "0.7rem", color: C.subtle }}>
                  Cost to collect, transport, and properly grind raw waste ash into reactive SCM powder.
                </div>
              </div>

            </div>
          </motion.div>

          {/* DIGITAL INVOICE / RECEIPT UI */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ display: "flex", flexDirection: "column" }}>
            <SectionTitle>Dynamic Ledger</SectionTitle>
            <div style={{ 
              background: "#fff", border: `1px solid ${C.border}`, borderRadius: "4px 4px 16px 16px",
              padding: "2rem", boxShadow: "0 12px 30px rgba(0,0,0,0.03)", position: "relative", flex: 1,
              /* Adding jagged edge at top for receipt look */
              backgroundImage: "radial-gradient(circle at 10px 0, transparent 10px, #fff 11px)",
              backgroundSize: "20px 20px", backgroundRepeat: "repeat-x", backgroundPosition: "0 -10px", marginTop: "10px"
            }}>
               <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.8rem", letterSpacing: "0.2em", color: C.muted, marginBottom: "0.5rem" }}>PROJECTED BILL</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 800, color: C.navy }}>Cost Breakdown</div>
               </div>

               {/* Line Items */}
               <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                 <InvoiceLine label={`100% OPC Baseline (${fmt(kg)} kg)`} value={fullCost} />
                 
                 <div style={{ borderBottom: "1px dashed #ccc", margin: "0.5rem 0" }} />
                 
                 <div style={{ fontSize: "0.75rem", fontFamily: "'DM Mono',monospace", color: C.teal, fontWeight: 700, marginBottom: "-0.5rem", textTransform: "uppercase" }}>Blended Mix Alternative</div>
                 <InvoiceLine label={`OPC Portion (${fmt(kg - replaced)} kg)`} value={blendOpcCost} color={C.text} />
                 <InvoiceLine label={`SCM Prep (${fmt(replaced)} kg)`} value={scmCost} color={C.amber} />
                 <InvoiceLine label={`Total Blended Cost`} value={blendCost} color={C.navy3} bold />
               </div>

               <div style={{ borderBottom: `2px solid ${C.navy}`, margin: "1.5rem 0" }} />

               {/* Grand Total Savings */}
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: C.teal }}>Net Capital Saved</div>
                    <div style={{ fontSize: "0.75rem", color: C.subtle, fontFamily: "'DM Mono',monospace" }}>{fmtD(pctSaved)}% Reduction</div>
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "2.2rem", fontWeight: 800, color: C.teal, lineHeight: 1 }}>
                    ₹<AnimatedCounter value={netSavings} />
                  </div>
               </div>

               {/* Mini Donut Chart overlay */}
               <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", width: "60px", height: "60px" }}>
                 <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                   <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(15,35,64,0.1)" strokeWidth="16" />
                   <motion.circle 
                     cx="50" cy="50" r={radius} fill="none" stroke={C.gold2} strokeWidth="16"
                     strokeDasharray={circumference} animate={{ strokeDashoffset: scmStrokeOffset }} transition={{ type: "spring", stiffness: 40 }}
                   />
                 </svg>
                 <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", fontWeight: 700, color: C.navy }}>{repl}%</div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* ── REAL CONSTRUCTION SCALE CARDS ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <SectionTitle>Real-World Scale Equivalencies</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
            {scaleItems.map((s, i) => {
               const savings = s.val * r20;
               return (
                 <motion.div 
                   key={i} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}
                   style={{
                     background: s.highlight ? `linear-gradient(135deg, ${C.navy2} 0%, ${C.navy} 100%)` : "rgba(255,255,255,0.7)",
                     backdropFilter: "blur(20px)",
                     border: `1px solid ${s.highlight ? "transparent" : C.border}`, borderRadius: "20px", padding: "1.8rem",
                     boxShadow: s.highlight ? "0 12px 30px rgba(15,35,64,0.2)" : "0 8px 20px rgba(0,0,0,0.03)",
                     position: "relative", overflow: "hidden"
                   }}
                 >
                   {s.highlight && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: C.gold2 }} />}
                   
                   <div style={{ fontSize: "2.5rem", filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))", marginBottom: "1rem" }}>{s.icon}</div>
                   
                   <div style={{ fontSize: "1rem", fontWeight: 800, color: s.highlight ? "#fff" : C.navy, marginBottom: "0.2rem" }}>{s.name}</div>
                   <div style={{ fontSize: "0.75rem", color: s.highlight ? "rgba(255,255,255,0.5)" : C.subtle, marginBottom: "1.5rem", fontFamily: "'DM Mono',monospace" }}>{s.sub}</div>
                   
                   <div style={{ borderTop: `1px solid ${s.highlight ? "rgba(255,255,255,0.1)" : C.border}`, paddingTop: "1rem" }}>
                     <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: s.highlight ? C.gold2 : C.teal }}>Estimated Saving</div>
                     <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.3rem", fontWeight: 800, color: s.highlight ? "#fff" : C.text, marginTop: "0.2rem" }}>
                       ₹{fmt(savings)}
                     </div>
                   </div>
                 </motion.div>
               )
            })}
          </div>
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

function InvoiceLine({ label, value, color = C.muted, bold = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.85rem" }}>
      <span style={{ color: bold ? C.navy : C.muted, fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ 
        fontFamily: "'DM Mono',monospace", 
        color: color, 
        fontWeight: bold ? 800 : 600,
        fontSize: "0.95rem"
      }}>
        ₹<AnimatedCounter value={value} />
      </span>
    </div>
  )
}