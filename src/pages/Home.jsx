import { useState, useCallback, useEffect, useRef } from "react";

// ── COLOUR TOKENS ────────────────────────────────────────────────
const C = {
  navy: "#0f2340", navy2: "#172d50", navy3: "#1e3a5f",
  gold: "#9a7820", gold2: "#c9a227", goldLt: "#fdf6e3",
  teal: "#0d8f6f", tealLt: "#e3f5ef",
  red: "#6b1212", redLt: "#fdeaea",
  amber: "#b86010", ambLt: "#fdf0e0",
  sla: "#1e3a5f", slaLt: "#e8eef5",
  tla: "#2d6a4f", tlaLt: "#e8f5ef",
  ifa: "#6b4226", ifaLt: "#f5ede5",
  opc: "#4a4a5a",
  bg: "#f5f3ef", surface: "#ffffff",
  border: "rgba(15,35,64,0.09)",
  text: "#0f1b2d", muted: "#4a5468", subtle: "#7a8498",
};

// ── DATA ─────────────────────────────────────────────────────────
const JUSTIFICATIONS = {
  0: { text: "100% OPC control — baseline for all comparisons. No SCM replacement. Used to benchmark strength, setting time and soundness against blended mixes.", pills: [{ t: "Baseline", c: "g" }, { t: "100% OPC", c: "" }, { t: "IS 4031 Reference", c: "g" }] },
  1: { text: "Initial 10% blend. 4% SLA provides mild pozzolanic activity, while TLA (3%) and IFA (3%) act as micro-fillers to improve particle packing. Safe margin for all IS 456 parameters.", pills: [{ t: "IS 456 ✓", c: "g" }, { t: "Micro-filler", c: "g" }, { t: "Total 10%", c: "" }] },
  2: { text: "Balanced 15% ternary blend. Equal 5% proportions test the synergy between pozzolanic SLA and limestone-rich ashes. Total chloride and MgO remain well within structural limits.", pills: [{ t: "IS 456 ✓", c: "g" }, { t: "Synergistic", c: "g" }, { t: "Total 15%", c: "" }] },
  3: { text: "★ Optimal mix. SLA increased to 10% to maximise secondary C-S-H formation for 28-day strength. Excellent balance of durability, code compliance, and cost savings at 20% total SCM.", pills: [{ t: "IS 456 ✓", c: "g" }, { t: "★ Optimized", c: "g" }, { t: "Total 20%", c: "" }] },
  4: { text: "High replacement boundary. Total 25% SCM utilizes 15% SLA for deep pozzolanic reaction. May slightly reduce early (7-day) strength but significantly enhances late-age properties and sustainability.", pills: [{ t: "IS 456 ✓", c: "g" }, { t: "High Durability", c: "g" }, { t: "Total 25%", c: "" }] },
  5: { text: "Maximum limit test. 30% SCM reaches the exact strict limit established by IS 456 for structural concrete. Significant carbon footprint reduction, but requires strict experimental validation.", pills: [{ t: "IS 456 @ limit", c: "a" }, { t: "Testing Required", c: "a" }, { t: "Total 30%", c: "a" }] },
};

const PRESETS = [
  { id: "pc-0", badge: "M0", name: "Control", ratio: "OPC 100%", total: "No SCM", args: [0, 0, 0, 0] },
  { id: "pc-1", badge: "M1", name: "Conservative", ratio: "SLA 4 · TLA 3 · IFA 3", total: "Total: 10%", args: [4, 3, 3, 1] },
  { id: "pc-2", badge: "M2", name: "Balanced", ratio: "SLA 5 · TLA 5 · IFA 5", total: "Total: 15%", args: [5, 5, 5, 2] },
  { id: "pc-3", badge: "M3", name: "★ Recommended", ratio: "SLA 10 · TLA 5 · IFA 5", total: "Total: 20%", args: [10, 5, 5, 3] },
  { id: "pc-4", badge: "M4", name: "High Repl.", ratio: "SLA 15 · TLA 5 · IFA 5", total: "Total: 25%", args: [15, 5, 5, 4] },
  { id: "pc-5", badge: "M5", name: "Upper Limit", ratio: "SLA 20 · TLA 5 · IFA 5", total: "Total: 30%", args: [20, 5, 5, 5] },
];

const IS_CODES_DATA = [
  { prop: "Total SCM (OPC replacement)", code: "IS 456 : 2000", clause: "Table 5", limit: "≤ 30%" },
  { prop: "Magnesium Oxide (MgO)", code: "IS 269 : 2015", clause: "Cl. 5.2.1", limit: "≤ 6.0%" },
  { prop: "Chloride Content (Cl⁻)", code: "IS 456 : 2000", clause: "Table 1", limit: "≤ 0.10%" },
  { prop: "Sulphuric Anhydride (SO₃)", code: "IS 4032 / IS 269", clause: "Cl. 5.2.3", limit: "≤ 3.5%" },
  { prop: "Pozzolanic Sum (SiO₂+Al₂O₃+Fe₂O₃)", code: "ASTM C618", clause: "Table 1", limit: "≥ 70.0%" },
  { prop: "Initial Setting Time", code: "IS 269 : 2015", clause: "Table 2", limit: "≥ 30 mins" },
  { prop: "Final Setting Time", code: "IS 269 : 2015", clause: "Table 2", limit: "≤ 600 mins" }
];

const fmtD = (n, d = 1) => n.toFixed(d);

// ── SAFETY LOGIC ─────────────────────────────────────────────────
function computeSafety(sla, tla, ifa) {
  const total = sla + tla + ifa;
  const opc = 100 - total;
  const mgo = tla * 0.5528;
  const cl = ifa * 0.0128;
  const so3 = sla * 0.0038 + tla * 0.0027 + ifa * 0.0925 + opc * 0.025;
  const checks = [];

  if (total > 0) {
    const p = sla > 0;
    checks.push({
      ok: p, warn: false,
      icon: p ? "✅" : "⚠️",
      label: `SLA pozzolanic sum: ${p ? "86.3%" : "0%"} (need ≥70% per ASTM C618)`,
      detail: p
        ? `SLA XRF verified: SiO₂ 86.03% + Al₂O₃ <0.001% + Fe₂O₃ 0.24% = 86.3% — exceeds ASTM C618 Class F threshold.`
        : `No SLA in mix — no pozzolanic material present. Add SLA to activate pozzolanic reaction.`,
      ref: "ASTM C618 / IS 4032 / ELCA Lab K-26-7918-P",
    });
  }

  const mgoOk = mgo <= 6, mgoWarn = mgo > 4 && mgo <= 6;
  checks.push({
    ok: mgoOk, warn: mgoWarn,
    icon: mgoOk ? (mgoWarn ? "⚠️" : "✅") : "❌",
    label: `MgO contribution: ${fmtD(mgo, 2)}% (limit ≤6%)`,
    detail: mgo === 0 ? "No TLA in mix — zero MgO contribution."
      : mgoOk ? (mgoWarn ? `MgO = ${fmtD(mgo, 2)}% — approaching IS 269 limit. Le Chatelier soundness test mandatory.`
        : `MgO = ${fmtD(mgo, 2)}% — safely within IS 269 limit of 6%.`)
        : `MgO = ${fmtD(mgo, 2)}% — EXCEEDS IS 269 limit of 6%. Reduce TLA dosage.`,
    ref: "IS 269 Cl. 5.2.1 / IS 456 Cl. 5.2",
  });

  const clOk = cl <= 0.10, clWarn = cl > 0.07 && cl <= 0.10;
  checks.push({
    ok: clOk, warn: clWarn,
    icon: clOk ? (clWarn ? "⚠️" : "✅") : "❌",
    label: `Cl⁻ in blend: ${fmtD(cl, 3)}% (IS 456 limit ≤0.10%)`,
    detail: ifa === 0 ? "No IFA — zero chloride contribution."
      : clOk ? (clWarn ? `Cl⁻ = ${fmtD(cl, 3)}% — near IS 456 limit. IFA post-wash Cl⁻ = 1.28% (ELCA Lab L-26-7146-P).`
        : `Cl⁻ = ${fmtD(cl, 3)}% — within IS 456 limit. Post-wash IFA Cl⁻ = 1.28% verified.`)
        : `Cl⁻ = ${fmtD(cl, 3)}% — EXCEEDS IS 456 limit. Reduce IFA below ${fmtD(0.10 / 0.0128, 1)}%.`,
    ref: "IS 456 Table 1 / IS 4032 Cl. 3.5",
  });

  if (total > 0) {
    const so3Ok = so3 <= 3.5, so3Warn = so3 > 3.0 && so3 <= 3.5;
    checks.push({
      ok: so3Ok, warn: so3Warn,
      icon: so3Ok ? (so3Warn ? "⚠️" : "✅") : "❌",
      label: `SO₃ in blend: ${fmtD(so3, 2)}% (IS 4032 limit ≤3.5%)`,
      detail: so3Ok ? (so3Warn
        ? `SO₃ = ${fmtD(so3, 2)}% — near limit. IFA contributes ${fmtD(ifa * 0.0925, 2)}%, OPC contributes ${fmtD(opc * 0.025, 2)}%.`
        : `SO₃ = ${fmtD(so3, 2)}% — within IS 4032 limit.`)
        : `SO₃ = ${fmtD(so3, 2)}% — EXCEEDS limit. Reduce IFA.`,
      ref: "IS 4032 Cl. 3.3 / IS 269 Cl. 5.2.3",
    });
  }

  const totalOk = total <= 30, totalWarn = total > 25 && total <= 30;
  if (total > 0) {
    checks.push({
      ok: totalOk, warn: totalWarn,
      icon: totalOk ? (totalWarn ? "⚠️" : "✅") : "❌",
      label: `Total SCM: ${total}% (IS 456 OPC limit ≤30%)`,
      detail: totalOk ? (totalWarn
        ? `${total}% — between 25–30%, approaching IS 456 limit. Verify 28-day strength meets grade requirements.`
        : `${total}% — within IS 456:2000 Table 5 limit for OPC blends.`)
        : `${total}% — EXCEEDS IS 456 OPC limit of 30%. Not recommended for structural use.`,
      ref: "IS 456:2000 Table 5 / IS 4031",
    });
  }

  const overallPass = checks.every(c => c.ok);
  const overallWarn = checks.some(c => c.warn) && overallPass;
  return { checks, overallPass, overallWarn, total };
}

// ── PILL COLOURS ─────────────────────────────────────────────────
const pillStyle = (c) => {
  if (c === "g") return { background: "rgba(13,143,111,0.2)", color: "#3ddba0", border: "1px solid rgba(13,143,111,0.3)" };
  if (c === "r") return { background: "rgba(107,18,18,0.3)", color: "#f97878", border: "1px solid rgba(181,32,32,0.3)" };
  if (c === "a") return { background: "rgba(184,96,24,0.2)", color: "#ffaa55", border: "1px solid rgba(184,96,24,0.3)" };
  return { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" };
};

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function Home({ sla: slaProp, tla: tlaProp, ifa: ifaProp, setSla: setSlaUp, setTla: setTlaUp, setIfa: setIfaUp }) {
  const [slaLocal, setSlaLocal] = useState(10);
  const [tlaLocal, setTlaLocal] = useState(5);
  const [ifaLocal, setIfaLocal] = useState(5);

  const sla = slaProp !== undefined ? slaProp : slaLocal;
  const tla = tlaProp !== undefined ? tlaProp : tlaLocal;
  const ifa = ifaProp !== undefined ? ifaProp : ifaLocal;
  const setSla = setSlaUp || setSlaLocal;
  const setTla = setTlaUp || setTlaLocal;
  const setIfa = setIfaUp || setIfaLocal;

  const [activePreset, setActivePreset] = useState(2);
  const [justification, setJustification] = useState(JUSTIFICATIONS[2]);
  const [showModal, setShowModal] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const safetyRef = useRef(null);

  useEffect(() => {
    if (!safetyRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setShowFloating(entry.isIntersecting || entry.boundingClientRect.top < 0);
      },
      { rootMargin: "0px", threshold: 0.1 }
    );
    observer.observe(safetyRef.current);
    return () => observer.disconnect();
  }, []);

  const total = sla + tla + ifa;
  const opc = Math.max(0, 100 - total);
  const mgo = tla * 0.5528;
  const cl = ifa * 0.0128;

  const safety = computeSafety(sla, tla, ifa);

  const applyPreset = (s, t, i, idx) => {
    setSla(s); setTla(t); setIfa(i);
    setActivePreset(idx);
    setJustification(JUSTIFICATIONS[idx]);
  };

  const statusColor = total === 0 ? C.muted : (!safety.overallPass ? C.red : safety.overallWarn ? C.amber : C.teal);
  const statusText = total === 0 ? "— N/A" : (!safety.overallPass ? "✗ Risky" : safety.overallWarn ? "⚠ Caution" : "✓ Safe");

  const safetyHeaderBg = total === 0 ? C.navy3 : (!safety.overallPass ? C.red : safety.overallWarn ? "#d48a10" : C.teal);
  const safetyBodyBg = total === 0 ? "" : (!safety.overallPass ? "#fdf0ef" : safety.overallWarn ? "#fdf6e3" : "#e8f9f2");

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif", background: C.bg, minHeight: "100vh", paddingBottom: "4rem", textAlign: "left" }}>

      {/* ── PROJECT META ROW ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0dbd4" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "1.5rem 2.5rem", display: "flex", alignItems: "stretch", gap: "2rem" }}>

          {/* Left Column */}
          <div style={{ flex: 1.2 }}>
            <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.red, marginBottom: "0.5rem" }}>
              Final Year Project
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 800, color: "#0f1e30", lineHeight: 1.35 }}>
              Utilization of <em style={{ fontStyle: "italic", color: C.navy3 }}>IFA, SLA &amp; TLA</em><br />in Cement Composition
            </div>
            <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "0.8rem", color: "#7a7068", fontStyle: "italic", marginTop: "0.4rem" }}>
              A Study on Chemical and Physical Property Alteration
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
              {["IS 269 : 2015", "IS 456 : 2000", "IS 4032 : 1985", "IS 4031 : 1988", "IS 3812 : 2003", "ASTM C618"].map(chip => (
                <span key={chip} style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.04em", color: C.navy3, border: "1px solid #b8c8d8", background: "#f0f4f8", padding: "3px 8px", borderRadius: 4 }}>{chip}</span>
              ))}
            </div>
          </div>

          {/* Vertical Divider */}
          <div style={{ width: 1, background: "#e0dbd4", alignSelf: "stretch" }} />

          {/* Right Column */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem 1.5rem", alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, marginBottom: "0.25rem" }}>
                Under the Guidance of
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", fontWeight: 700, color: "#0f1e30", lineHeight: 1.3 }}>
                Mr. A. A. Magdum
              </div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "0.72rem", color: "#5a5a68" }}>
                Dept. of Civil Engineering
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, marginBottom: "0.25rem" }}>
                Academic Year
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", fontWeight: 700, color: "#0f1e30", lineHeight: 1.3 }}>
                2025 – 26
              </div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "0.72rem", color: "#5a5a68" }}>
                WCE Sangli
              </div>
            </div>

            <div style={{ gridColumn: "span 2", marginTop: "0.25rem" }}>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, marginBottom: "0.25rem" }}>
                Submitted by
              </div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: "0.75rem", color: "#5a5a68", lineHeight: 1.4 }}>
                Tanvi Patil · Payal Pise · Kaveri Konnur · Aniket Khandare · Kedar Patil
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "2rem 2rem 0", textAlign: "left" }}>

        {/* MIX PROPORTIONS */}
        <SectionTitle>Mix Proportions — click to select &amp; view justification</SectionTitle>
        <Card>
          {/* Preset grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.6rem" }}>
            {PRESETS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => applyPreset(...p.args)}
                style={{
                  border: activePreset === idx ? `1.5px solid ${C.navy3}` : `1.5px solid ${C.border}`,
                  borderRadius: 12, padding: "0.9rem 1rem",
                  background: activePreset === idx ? "#fff" : C.bg,
                  cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden",
                  boxShadow: activePreset === idx ? "0 4px 20px rgba(15,35,64,0.12)" : "none",
                  transition: "all 0.18s",
                }}
              >
                {activePreset === idx && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${C.sla},${C.tla},${C.ifa})` }} />
                )}
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: activePreset === idx ? C.gold2 : C.navy, color: activePreset === idx ? C.navy : "#fff", padding: "2px 7px", borderRadius: 4, display: "inline-block", marginBottom: "0.5rem" }}>
                  {p.badge}
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.9rem", fontWeight: 700, color: C.text, marginBottom: "0.3rem" }}>{p.name}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem", color: activePreset === idx ? C.text : C.muted, fontWeight: activePreset === idx ? 600 : 500 }}>{p.ratio}</div>
                <div style={{ fontSize: "0.75rem", color: activePreset === idx ? C.muted : "#5c667a", marginTop: "0.3rem", fontWeight: activePreset === idx ? 600 : 500 }}>{p.total}</div>
              </button>
            ))}
          </div>

          {/* Justification Panel */}
          <div style={{ background: `linear-gradient(135deg,${C.navy} 0%,${C.navy2} 100%)`, borderRadius: 12, padding: "1.3rem 1.6rem", marginBottom: "1.4rem", border: "1px solid rgba(201,162,39,0.2)" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold2, marginBottom: "0.5rem" }}>
              ▶ Mix Justification
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}>{justification.text}</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.8rem" }}>
              {justification.pills.map((p, i) => (
                <span key={i} style={{ fontSize: "0.68rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20, ...pillStyle(p.c) }}>{p.t}</span>
              ))}
            </div>
          </div>

          {/* Custom sliders */}
          <div style={{ fontSize: "0.75rem", color: C.muted, marginBottom: "0.8rem", fontWeight: 500 }}>↓ Or define a custom proportion below</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem 1.8rem", marginBottom: "1.2rem" }}>
            {[
              { label: "SLA — Sugarcane Leaf Ash", color: C.sla, val: sla, set: setSla, min: 0, max: 25 },
              { label: "TLA — Turmeric Leaf Ash", color: C.tla, val: tla, set: setTla, min: 0, max: 10 },
              { label: "IFA — Fly Ash (washed)", color: C.ifa, val: ifa, set: setIfa, min: 0, max: 10 },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 500, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color, display: "inline-block" }} />
                    {s.label}
                  </span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.9rem", fontWeight: 600, color: C.text }}>{s.val}%</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={1} value={s.val}
                  onChange={e => { s.set(+e.target.value); setActivePreset(-1); }}
                  style={{ width: "100%", height: 4, borderRadius: 2, cursor: "pointer", accentColor: C.navy3, marginBottom: "0.25rem" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.66rem", color: C.subtle, fontFamily: "'DM Mono',monospace" }}>
                  <span>0%</span><span>{s.max}%</span>
                </div>
              </div>
            ))}
            {/* OPC auto */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 500, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: C.opc, display: "inline-block" }} />
                  OPC (auto)
                </span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.9rem", fontWeight: 600, color: C.text }}>{opc}%</span>
              </div>
              <div style={{ height: 4, background: C.bg, borderRadius: 2, margin: "8px 0 6px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: C.opc, borderRadius: 2, width: `${opc}%`, transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: "0.66rem", color: C.subtle, fontFamily: "'DM Mono',monospace" }}>auto</div>
            </div>
          </div>

          {/* Mix bar */}
          <div style={{ display: "flex", height: 32, borderRadius: 10, overflow: "hidden", marginBottom: "1.2rem", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}>
            {[
              { bg: C.sla, flex: sla || 0.3, label: sla > 6 ? `SLA ${sla}%` : "" },
              { bg: C.tla, flex: tla || 0.3, label: tla > 5 ? `TLA ${tla}%` : "" },
              { bg: C.ifa, flex: ifa || 0.3, label: ifa > 5 ? `IFA ${ifa}%` : "" },
              { bg: C.opc, flex: opc, label: opc > 10 ? `OPC ${opc}%` : "" },
            ].map((seg, i) => (
              <div key={i} style={{ flex: seg.flex, background: seg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.69rem", fontWeight: 700, color: "rgba(255,255,255,0.95)", transition: "flex 0.4s cubic-bezier(.4,0,.2,1)", overflow: "hidden", whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
                {seg.label}
              </div>
            ))}
          </div>

          {/* Summary tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
            {[
              { label: "Total SCM", value: `${total}%`, color: C.text },
              { label: "MgO contributed", value: `${fmtD(mgo, 2)}%`, color: mgo > 6 ? C.red : mgo > 4 ? C.amber : C.teal },
              { label: "Cl⁻ in blend", value: `${fmtD(cl, 3)}%`, color: cl > 0.10 ? C.red : cl > 0.07 ? C.amber : C.teal },
              { label: "IS 269 Status", value: statusText, color: statusColor },
            ].map(tile => (
              <div key={tile.label} style={{ background: C.bg, borderRadius: 10, padding: "0.85rem 1rem", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "0.67rem", color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{tile.label}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.05rem", fontWeight: 700, color: tile.color }}>{tile.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* IS CODE SAFETY ANALYSIS */}
        <div ref={safetyRef}>
          <SectionTitle>IS Code Safety Analysis — IS 269 / IS 456 / IS 4032 / ASTM C618</SectionTitle>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ borderRadius: 12, overflow: "hidden", border: `1.5px solid ${C.border}` }}>

              {/* Safety header */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "1rem 1.3rem", fontWeight: 600, fontSize: "0.9rem",
                background: safetyHeaderBg, color: "#fff",
                textAlign: "left",
              }}>
                <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>
                  {total === 0 ? "🔬" : (!safety.overallPass ? "❌" : safety.overallWarn ? "⚠️" : "✅")}
                </span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "0.95rem" }}>
                    {total === 0 ? "Control Mix (100% OPC baseline)" : (!safety.overallPass ? "NOT SAFE — IS Code Violations Detected" : safety.overallWarn ? "USE WITH CAUTION — Near IS Code Limits" : "SAFE — All IS Code Limits Satisfied")}
                  </div>
                  <div style={{ fontSize: "0.73rem", opacity: 0.8, marginTop: 2 }}>
                    Mix: SLA {sla}% + TLA {tla}% + IFA {ifa}% + OPC {100 - total}%
                  </div>
                </div>
              </div>

              {/* Safety body */}
              <div style={{
                padding: "1rem 1.3rem",
                background: safetyBodyBg || C.surface,
                textAlign: "left",
              }}>
                {safety.checks.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.65rem 0",
                      borderBottom: i < safety.checks.length - 1 ? `1px solid ${C.border}` : "none",
                      fontSize: "0.8rem",
                      lineHeight: 1.5,
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        marginBottom: 2,
                        color: c.ok ? (c.warn ? C.amber : C.teal) : C.red,
                        textAlign: "left",
                      }}>
                        {c.label}
                      </div>
                      <div style={{ color: C.muted, fontSize: "0.75rem", textAlign: "left" }}>{c.detail}</div>
                      <div style={{
                        fontSize: "0.68rem",
                        fontFamily: "'DM Mono',monospace",
                        color: C.subtle,
                        marginTop: 2,
                        textAlign: "left",
                      }}>
                        Ref: {c.ref}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* FLOATING BUTTON */}
      {showFloating && (
        <button
          onClick={() => setShowModal(true)}
          style={{
            position: "fixed", bottom: "2rem", right: "2rem", zIndex: 90,
            background: C.navy, color: "#fff",
            border: `2px solid ${C.gold2}`, borderRadius: "30px",
            padding: "0.8rem 1.2rem", fontSize: "0.85rem", fontWeight: 700,
            boxShadow: "0 8px 24px rgba(15,35,64,0.3)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
            animation: "fadeUp 0.3s ease",
            fontFamily: "'DM Mono',monospace", letterSpacing: "0.05em"
          }}
        >
          <span>📋</span> IS Code Limits
        </button>
      )}

      {/* MODAL OVERLAY */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          background: "rgba(15,35,64,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 600,
            padding: "2.5rem 2rem 2rem", position: "relative", boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            animation: "fadeDown 0.3s ease"
          }}>
            <button onClick={() => setShowModal(false)}
              style={{
                position: "absolute", top: "1.2rem", right: "1.2rem",
                background: "rgba(15,35,64,0.05)", border: "none", width: 32, height: 32,
                borderRadius: "50%", fontSize: "1rem", color: C.navy3, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(15,35,64,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(15,35,64,0.05)"}
            >✕</button>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.gold, marginBottom: "0.4rem" }}>
              Quick Reference
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: C.navy, margin: "0 0 1.5rem" }}>
              IS Code Permissible Limits
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                <thead>
                  <tr>
                    {["Property / Parameter", "IS Code", "Clause / Table", "Safety Limit"].map(th => (
                      <th key={th} style={{ padding: "0.75rem 0.5rem", borderBottom: `2px solid ${C.border}`, color: C.navy3, fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.06em", background: C.bg }}>{th}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {IS_CODES_DATA.map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "#fff" : "rgba(15,35,64,0.015)" }}>
                      <td style={{ padding: "0.85rem 0.5rem", fontWeight: 700, color: C.navy }}>{row.prop}</td>
                      <td style={{ padding: "0.85rem 0.5rem", color: C.muted }}>{row.code}</td>
                      <td style={{ padding: "0.85rem 0.5rem", color: C.muted, fontFamily: "'DM Mono',monospace" }}>{row.clause}</td>
                      <td style={{ padding: "0.85rem 0.5rem", color: C.teal, fontWeight: 800, fontFamily: "'DM Mono',monospace", letterSpacing: "0.02em" }}>{row.limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── HELPER COMPONENTS ─────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Playfair Display',serif", fontSize: "0.65rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.12em", color: C.navy3,
      marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.6rem",
      textAlign: "left",
    }}>
      {children}
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "1.8rem 2rem", marginBottom: "1.5rem",
      textAlign: "left",
    }}>
      {children}
    </div>
  );
}