import loiVideoSrc from "../assets/chemical.mp4";
import tanviVideoSrc from "../assets/Tanvi .mp4";
import kedarVideoSrc from "../assets/Kedar.mp4";
/**
 * Chemical.jsx — Full animated chemical testing with detailed step-by-step animations
 * LOI and Chloride sections now show real lab video instead of SVG animation
 */

import { useState, useEffect, useRef } from "react";

/* ── PALETTE ── */
const navy = "#0f2340";
const navy3 = "#1e3a5f";
const gold2 = "#c9a227";
const red = "#6b1212";
const teal = "#0d8f6f";
const border = "rgba(15,35,64,0.09)";
const muted = "#4a5468";
const bg = "#f5f3ef";

/* ══════════════════════════════════════════════
   ANIMATION HOOK — drives step-based animations
══════════════════════════════════════════════ */
function useAnimStep(numSteps, msDuration) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = null;
    const total = msDuration * numSteps;
    function tick(ts) {
      if (!start) start = ts;
      const elapsed = (ts - start) % total;
      const s = Math.floor(elapsed / msDuration);
      const p = (elapsed % msDuration) / msDuration;
      setStep(s);
      setProgress(p);
      ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [numSteps, msDuration]);
  return { step, progress };
}

/* ═══════════════════════════════════════════════════════════
   1. LOSS ON IGNITION — Real Lab Video Player
═══════════════════════════════════════════════════════════ */
function VideoPlayer({ isOpen, src, title }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isOpen) {
      videoRef.current.play().catch(() => { });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <video
        ref={videoRef}
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8, display: "block" }}
        controls loop playsInline
      />
      <div style={{ position: "absolute", top: 8, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
        <span style={{
          background: "rgba(15,35,64,0.88)", color: gold2, fontSize: "0.55rem",
          fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.1em",
          padding: "3px 10px", borderRadius: 20, textTransform: "uppercase"
        }}>🎬 Live Lab Demo — {title}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. CHLORIDE CONTENT — Argentometric Titration Full Process
═══════════════════════════════════════════════════════════ */
function AnimChloride() {
  const { step, progress } = useAnimStep(7, 2400);

  const stepLabels = [
    "Step 1 — Dissolve 1.0 g in 50 mL HNO₃ (1:3)",
    "Step 2 — Filter through Whatman paper",
    "Step 3 — Dilute filtrate to 250 mL",
    "Step 4 — Add K₂CrO₄ indicator (yellow)",
    "Step 5 — Titrate with 0.1 N AgNO₃",
    "Step 6 — End-point: brick-red precipitate",
    "Step 7 — Calculate Cl⁻ content",
  ];

  const burFill = step < 4 ? 130 : Math.max(70, 130 - progress * 60);
  const flaskColor = step < 4 ? "#fffbe0" : step === 4 ? `rgba(255,${220 - progress * 100},${100 - progress * 100},0.8)` : "#cc4444";
  const flaskStroke = step < 4 ? "#c8a000" : step === 4 ? "#aa4400" : "#880000";

  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="cl_agno3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f0ff" />
          <stop offset="100%" stopColor="#a0c8f8" />
        </linearGradient>
        <filter id="cl_glow"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <rect x="0" y="220" width="320" height="40" fill="#c8b99a" />
      <rect x="0" y="216" width="320" height="6" fill="#d6c8ae" />

      <g opacity={step === 0 ? 1 : 0.3}>
        <rect x="14" y="148" width="64" height="60" rx="5" fill="rgba(220,240,255,0.6)" stroke="#8ab0cc" strokeWidth="1.5" />
        <rect x="17" y={step === 0 ? 170 : 200} width="58" height={step === 0 ? 36 : 6} rx="3" fill="rgba(200,240,200,0.7)" />
        {step === 0 && <text x="46" y="196" textAnchor="middle" fill="#2a7a2a" fontSize="7" fontFamily="sans-serif" fontWeight="600">HNO₃ (1:3)</text>}
        {step === 0 && [22, 34, 46, 58, 68].map((x, i) => (
          <circle key={i} cx={x} cy={190 - progress * 15} r="3" fill="#a08060" opacity={1 - progress}>
            <animate attributeName="cy" values={`${185};${175 - i * 2}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
          </circle>
        ))}
        <text x="46" y="228" textAnchor="middle" fill={muted} fontSize="7" fontFamily="sans-serif">Dissolution</text>
        <rect x="10" y="210" width="72" height="10" rx="3" fill="#555" />
        {step === 0 && <rect x="14" y="211" width="64" height="6" rx="2" fill="#ff6600" opacity="0.4">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" repeatCount="indefinite" />
        </rect>}
      </g>

      <g opacity={step === 1 ? 1 : 0.3}>
        <path d="M90 110 L76 162 L110 162 L90 110Z" fill="rgba(200,230,250,0.8)" stroke="#8ab0cc" strokeWidth="1.5" />
        <rect x="78" y="100" width="24" height="12" rx="3" fill="rgba(220,240,255,0.8)" stroke="#8ab0cc" strokeWidth="1" />
        <path d="M91 113 L79 158 L101 158 L91 113Z" fill="#fffbe8" stroke="#d4b870" strokeWidth="1" />
        {step === 1 && <ellipse cx="91" cy="157" rx="9" ry="2.5" fill="#a08050" opacity={Math.min(1, progress * 2)} />}
        {step === 1 && (
          <circle cx="91" cy="168" r="2" fill="#a0c8f8">
            <animate attributeName="cy" values="165;185;165" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
        <path d="M74 190 L62 218 L106 218 L94 190Z" fill="rgba(220,240,255,0.6)" stroke="#8ab0cc" strokeWidth="1.5" />
        <rect x="80" y="178" width="20" height="14" rx="2" fill="rgba(220,240,255,0.7)" stroke="#8ab0cc" strokeWidth="1" />
        <text x="84" y="232" textAnchor="middle" fill={muted} fontSize="7" fontFamily="sans-serif">Filtrate</text>
      </g>

      <g opacity={step === 2 ? 1 : 0.3}>
        <ellipse cx="160" cy="195" rx="30" ry="10" fill="rgba(200,230,250,0.4)" stroke="#8ab0cc" strokeWidth="1" />
        <path d="M130 195 Q128 220 160 222 Q192 220 190 195Z" fill="rgba(190,225,248,0.5)" stroke="#8ab0cc" strokeWidth="1.5" />
        <rect x="152" y="155" width="16" height="42" rx="4" fill="rgba(200,230,250,0.7)" stroke="#8ab0cc" strokeWidth="1" />
        <line x1="148" y1="170" x2="172" y2="170" stroke="#cc0000" strokeWidth="1.5" />
        <text x="176" y="173" fill="#cc0000" fontSize="6.5" fontFamily="sans-serif">250 mL</text>
        {step === 2 && <rect x="154" y={170 - progress * 20} width="12" height={progress * 20} rx="2" fill="rgba(160,200,240,0.7)" />}
        <text x="160" y="240" textAnchor="middle" fill={muted} fontSize="7" fontFamily="sans-serif">Volumetric Flask</text>
      </g>

      <g opacity={step >= 3 ? 1 : 0.25}>
        <rect x="188" y="60" width="5" height="160" rx="2.5" fill="#888" />
        <rect x="160" y="216" width="60" height="6" rx="3" fill="#777" />
        <rect x="176" y="76" width="22" height="7" rx="3" fill="#666" />
        <rect x="194" y="62" width="14" height="148" rx="4" fill="rgba(200,225,245,0.7)" stroke="#8ab0cc" strokeWidth="1.5" />
        <rect x="196" y="63" width="10" height={burFill} rx="3" fill="url(#cl_agno3)">
          {step >= 4 && <animate attributeName="height" values={`${burFill};${burFill - 5};${burFill}`} dur="0.5s" repeatCount="indefinite" />}
        </rect>
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <line key={i} x1="194" y1={72 + i * 18} x2="200" y2={72 + i * 18} stroke="#8ab0cc" strokeWidth="1" />
        ))}
        <rect x="192" y="204" width="18" height="10" rx="3" fill="#777" />
        <rect x="196" y="207" width="10" height="4" rx="2" fill={step >= 4 ? "#ff6600" : "#999"} style={{ transition: "fill 0.5s" }} />
        {step >= 4 && step <= 5 && (
          <g>
            <line x1="201" y1="214" x2="201" y2="228" stroke="rgba(160,200,240,0.8)" strokeWidth="1.5">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.4s" repeatCount="indefinite" />
            </line>
            <circle cx="201" cy="230" r="2.5" fill="#a0c8f8">
              <animate attributeName="cy" values="228;246;228" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
        <path d="M168 175 L152 216 L220 216 L204 175Z" fill={flaskColor} stroke={flaskStroke} strokeWidth="1.5" style={{ transition: "fill 1s, stroke 1s" }} />
        <rect x="179" y="160" width="22" height="17" rx="3" fill="rgba(220,240,220,0.7)" stroke="#a0c8a0" strokeWidth="1" />
        {step === 5 && (
          <g>
            {[164, 172, 180, 188, 196, 204, 212].map((x, i) => (
              <ellipse key={i} cx={x} cy={210 - i % 2 * 4} rx="4" ry="2.5" fill="#cc4444" opacity="0.8">
                <animate attributeName="opacity" values="0;0.8" dur={`${0.5 + i * 0.1}s`} fill="freeze" />
              </ellipse>
            ))}
          </g>
        )}
        {step === 3 && (
          <text x="186" y="200" textAnchor="middle" fill="#8a7000" fontSize="7" fontFamily="sans-serif">K₂CrO₄ indicator</text>
        )}
        <rect x="152" y="216" width="68" height="10" rx="4" fill="#555" />
        <ellipse cx="186" cy="212" rx="10" ry="3.5" fill="#999" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" values="0 186 212;360 186 212" dur="0.8s" repeatCount="indefinite" />
        </ellipse>
        <text x="215" y="108" fill="rgba(100,160,220,0.9)" fontSize="6.5" fontFamily="sans-serif" fontWeight="600">0.1 N AgNO₃</text>
        <line x1="213" y1="105" x2="208" y2="100" stroke="rgba(100,160,220,0.6)" strokeWidth="1" />
      </g>

      {step === 6 && (
        <g>
          <rect x="20" y="60" width="260" height="50" rx="8" fill="rgba(15,35,64,0.85)" />
          <text x="150" y="82" textAnchor="middle" fill={gold2} fontSize="8" fontFamily="monospace" fontWeight="700">Cl⁻ (%) = (V × N × 35.45) / (W × 10)</text>
          <text x="150" y="98" textAnchor="middle" fill={teal} fontSize="8" fontFamily="monospace">= (11.8 × 0.1 × 35.45) / (1.0 × 10) = 0.042%</text>
        </g>
      )}

      <rect x="0" y="0" width="320" height="24" fill="rgba(15,35,64,0.88)" />
      <text x="160" y="15" textAnchor="middle" fill={gold2} fontSize="8" fontFamily="monospace" fontWeight="700">{stepLabels[step]}</text>

      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <circle key={i} cx={20 + i * 40} cy="250" r="4"
          fill={i === step ? gold2 : i < step ? teal : "rgba(255,255,255,0.2)"}
          stroke={i === step ? "#fff" : "none"} strokeWidth="1" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. INSOLUBLE SOLIDS
═══════════════════════════════════════════════════════════ */
function AnimInsoluble() {
  const { step, progress } = useAnimStep(7, 2300);

  const stepLabels = [
    "Step 1 — Weigh 0.5 g into 250 mL beaker",
    "Step 2 — Add 50 mL 1:5 HCl, boil 15 min",
    "Step 3 — Filter through Whatman No.42",
    "Step 4 — Wash residue free of chloride",
    "Step 5 — Transfer residue to crucible",
    "Step 6 — Ignite at 900°C for 30 min",
    "Step 7 — Reweigh & Calculate IR",
  ];

  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="ins_hcl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8ffe8" />
          <stop offset="100%" stopColor="#b0f0b0" />
        </linearGradient>
        <radialGradient id="ins_furnace" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#cc2200" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="220" width="320" height="40" fill="#c8b99a" />
      <rect x="0" y="216" width="320" height="6" fill="#d6c8ae" />

      <g opacity={step === 0 || step === 6 ? 1 : 0.3}>
        <rect x="14" y="186" width="72" height="28" rx="4" fill="#e0ddd8" stroke="#bbb" strokeWidth="1" />
        <rect x="44" y="160" width="12" height="28" rx="3" fill="#aaa" />
        <ellipse cx="50" cy="158" rx="20" ry="5" fill="#ccc" stroke="#bbb" strokeWidth="1" />
        {(step === 0 || step === 6) && <ellipse cx="50" cy="156" rx="8" ry="3" fill="#c8b89a" stroke="#b0a890" strokeWidth="1" />}
        <rect x="22" y="190" width="56" height="14" rx="3" fill="#1a1a10" />
        <text x="50" y="200" textAnchor="middle" fill="#88ff44" fontSize="7" fontFamily="monospace" fontWeight="bold">
          {step === 0 ? "0.5000 g" : step === 6 ? "0.0105 g" : "--------"}
        </text>
      </g>

      <g opacity={step === 1 ? 1 : 0.3}>
        <rect x="118" y="148" width="80" height="68" rx="6" fill="rgba(220,255,220,0.65)" stroke="#70c870" strokeWidth="1.5" />
        <rect x="121" y={step === 1 ? 165 : 200} width="74" height={step === 1 ? 49 : 14} rx="4" fill="url(#ins_hcl)" opacity="0.8" />
        {step === 1 && [128, 140, 155, 168, 180].map((x, i) => (
          <circle key={i} cx={x} cy={206 - progress * 10} r="3" fill="rgba(255,255,255,0.8)">
            <animate attributeName="cy" values={`${210};${190 - i * 3};${210}`} dur={`${0.7 + i * 0.15}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="2;4;2" dur={`${0.7 + i * 0.15}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {step === 1 && [130, 145, 160, 175].map((x, i) => (
          <path key={i} d={`M${x} 148 Q${x + (i % 2 ? 6 : -6)} ${130 + i} ${x} ${115 + i}`}
            fill="none" stroke="rgba(100,200,100,0.5)" strokeWidth="1.5">
            <animate attributeName="opacity" values="0;0.7;0" dur={`${1.2 + i * 0.2}s`} repeatCount="indefinite" />
          </path>
        ))}
        <rect x="114" y="210" width="88" height="12" rx="4" fill="#555" />
        {step === 1 && <rect x="118" y="211" width="80" height="8" rx="3" fill="#ff5500" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" repeatCount="indefinite" />
        </rect>}
        {step === 1 && <text x="158" y="180" textAnchor="middle" fill="#1a6a1a" fontSize="7.5" fontFamily="sans-serif" fontWeight="600">1:5 HCl — Boiling</text>}
        <text x="158" y="236" textAnchor="middle" fill={muted} fontSize="7" fontFamily="sans-serif">250 mL Beaker</text>
      </g>

      <g opacity={step >= 2 && step <= 4 ? 1 : 0.3}>
        <rect x="238" y="68" width="5" height="152" rx="2.5" fill="#888" />
        <rect x="210" y="218" width="60" height="5" rx="2.5" fill="#777" />
        <rect x="218" y="86" width="30" height="6" rx="3" fill="#666" />
        <ellipse cx="242" cy="92" rx="20" ry="5" fill="none" stroke="#666" strokeWidth="3" />
        <path d="M228 92 L218 140 L255 140 L245 92Z" fill="rgba(200,230,250,0.8)" stroke="#8ab0cc" strokeWidth="1.5" />
        <path d="M230 95 L221 136 L252 136 L242 95Z" fill="#fffbe8" stroke="#d4b870" strokeWidth="1" />
        {step >= 2 && <ellipse cx="237" cy="135" rx="12" ry="3" fill="#c8a870" opacity={Math.min(1, (step - 2) * 0.5 + progress * 0.4)} />}
        {step === 3 && (
          <g>
            <path d="M210 70 Q220 80 232 90" fill="none" stroke="rgba(100,160,240,0.7)" strokeWidth="2">
              <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" />
            </path>
            <text x="200" y="78" textAnchor="end" fill="#4488cc" fontSize="7" fontFamily="sans-serif">Wash water</text>
          </g>
        )}
        {step >= 2 && step <= 3 && (
          <circle cx="237" cy="148" r="2" fill="#b0d8f0">
            <animate attributeName="cy" values="146;164;146" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
        <path d="M222 162 L212 212 L262 212 L252 162Z" fill="rgba(210,240,255,0.5)" stroke="#8ab0cc" strokeWidth="1.5" />
        <rect x="232" y="150" width="18" height="14" rx="3" fill="rgba(210,240,255,0.7)" stroke="#8ab0cc" strokeWidth="1" />
        <text x="237" y="230" textAnchor="middle" fill={muted} fontSize="7" fontFamily="sans-serif">Filtrate (waste)</text>
      </g>

      <g opacity={step === 5 ? 1 : 0.3}>
        <rect x="118" y="86" width="110" height="100" rx="8" fill="#3a3a4a" stroke="#222" strokeWidth="1.5" />
        <rect x="122" y="90" width="102" height="92" rx="6" fill="#2a2a38" />
        <rect x="130" y="98" width="86" height="78" rx="5" fill={step === 5 ? "#3a1200" : "#111120"}>
          {step === 5 && <animate attributeName="fill" values="#3a1200;#5a2800;#3a1200" dur="1.2s" repeatCount="indefinite" />}
        </rect>
        {step === 5 && (
          <ellipse cx="173" cy="137" rx="35" ry="30" fill="url(#ins_furnace)" opacity="0.7">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.4s" repeatCount="indefinite" />
          </ellipse>
        )}
        {step === 5 && (
          <g>
            <ellipse cx="173" cy="155" rx="12" ry="4.5" fill="#d8cdb8" stroke="#b0a890" strokeWidth="1" />
            <path d="M161 155 Q173 168 185 155" fill="#c8b89a" />
          </g>
        )}
        <rect x="134" y="172" width="78" height="12" rx="3" fill="#0a0a18" />
        <text x="173" y="181" textAnchor="middle" fill="#ff6600" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
          {step === 5 ? `${Math.round(850 + progress * 50)}°C` : "---°C"}
        </text>
        <text x="173" y="200" textAnchor="middle" fill={muted} fontSize="7" fontFamily="sans-serif">Muffle Furnace 900°C</text>
      </g>

      {step === 6 && (
        <g>
          <rect x="20" y="56" width="280" height="46" rx="8" fill="rgba(15,35,64,0.88)" />
          <text x="160" y="76" textAnchor="middle" fill={gold2} fontSize="8" fontFamily="monospace" fontWeight="700">IR (%) = (residue / original) × 100</text>
          <text x="160" y="94" textAnchor="middle" fill={teal} fontSize="8" fontFamily="monospace">= (0.0105 / 0.5000) × 100 = 2.1%</text>
        </g>
      )}

      <rect x="0" y="0" width="320" height="24" fill="rgba(15,35,64,0.88)" />
      <text x="160" y="15" textAnchor="middle" fill={gold2} fontSize="8" fontFamily="monospace" fontWeight="700">{stepLabels[step]}</text>

      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <circle key={i} cx={20 + i * 40} cy="250" r="4"
          fill={i === step ? gold2 : i < step ? teal : "rgba(255,255,255,0.2)"}
          stroke={i === step ? "#fff" : "none"} strokeWidth="1" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. MODIFIED CHAPELLE
═══════════════════════════════════════════════════════════ */
function AnimChapelle() {
  const { step, progress } = useAnimStep(8, 2200);

  const stepLabels = [
    "Step 1 — Weigh 1.0 g SCM + 2.0 g Ca(OH)₂",
    "Step 2 — Mix reactants in conical flask",
    "Step 3 — Add 250 mL distilled water",
    "Step 4 — Seal flask with stopper",
    "Step 5 — Water bath 90°C for 16 hours",
    "Step 6 — Filter hot; add HCl to neutralise",
    "Step 7 — Titrate with 0.1 N EDTA",
    "Step 8 — Calculate CaO fixed by SCM",
  ];

  const waterBathTemp = step >= 4 ? Math.round(40 + Math.min(1, progress) * 50) : 25;

  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="ch_bath" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#90c8f0" />
          <stop offset="100%" stopColor="#5098d0" />
        </linearGradient>
        <linearGradient id="ch_edta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0f0d0" />
          <stop offset="100%" stopColor="#90d090" />
        </linearGradient>
      </defs>

      <rect x="0" y="220" width="320" height="40" fill="#c8b99a" />
      <rect x="0" y="216" width="320" height="6" fill="#d6c8ae" />

      <g opacity={step <= 1 ? 1 : 0.25}>
        <rect x="10" y="130" width="50" height="56" rx="5" fill="rgba(240,240,250,0.8)" stroke="#aaa" strokeWidth="1.5" />
        <rect x="13" y="133" width="44" height="40" rx="3" fill="#f4f4fc" />
        <text x="35" y="152" textAnchor="middle" fill="#333" fontSize="7" fontFamily="sans-serif" fontWeight="600">Ca(OH)₂</text>
        <text x="35" y="163" textAnchor="middle" fill="#555" fontSize="6.5" fontFamily="sans-serif">2.0 g</text>
        <rect x="68" y="130" width="50" height="56" rx="5" fill="rgba(245,235,220,0.8)" stroke="#b8a080" strokeWidth="1.5" />
        <rect x="71" y="133" width="44" height="40" rx="3" fill="#f8f0e4" />
        <text x="93" y="152" textAnchor="middle" fill="#5a3a10" fontSize="7" fontFamily="sans-serif" fontWeight="600">SCM</text>
        <text x="93" y="163" textAnchor="middle" fill="#7a5a30" fontSize="6.5" fontFamily="sans-serif">1.0 g</text>
      </g>

      <g opacity={step >= 1 && step <= 6 ? 1 : 0.3}>
        <path d="M140 122 L118 210 L202 210 L180 122Z" fill={step >= 2 ? "rgba(200,225,245,0.6)" : "rgba(220,235,250,0.4)"} stroke="#8ab0cc" strokeWidth="1.5" />
        <rect x="153" y="90" width="22" height="34" rx="4" fill="rgba(200,225,245,0.7)" stroke="#8ab0cc" strokeWidth="1" />
        {step >= 3 && <rect x="150" y="84" width="28" height="12" rx="5" fill="#555" stroke="#333" strokeWidth="1" />}
        {step >= 2 && (
          <path d={`M${120} ${210} Q${160} ${198} ${200} ${210} L${196} ${190 - progress * 5} Q${160} ${188} ${124} ${190 - progress * 5} Z`}
            fill={step >= 4 ? "rgba(240,210,160,0.8)" : "rgba(220,235,250,0.8)"} />
        )}
        {step === 4 && (
          <text x="160" y="165" textAnchor="middle" fill="#2a6aaa" fontSize="8" fontFamily="sans-serif" fontWeight="600">90°C · 16 h</text>
        )}
        <text x="160" y="230" textAnchor="middle" fill={muted} fontSize="7" fontFamily="sans-serif">250 mL Flask</text>
      </g>

      <g opacity={step === 4 ? 1 : 0.2}>
        <rect x="108" y="170" width="104" height="50" rx="6" fill="#2a4a6a" stroke="#1a3a5a" strokeWidth="2" />
        <rect x="112" y="176" width="96" height="40" rx="4" fill="url(#ch_bath)" opacity="0.8" />
        {step === 4 && [120, 135, 150, 165, 180, 195].map((x, i) => (
          <circle key={i} cx={x} cy="205" r="2.5" fill="#fff" opacity="0.5">
            <animate attributeName="cy" values="205;185;205" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <line x1="200" y1="165" x2="200" y2="200" stroke="#d0d0d0" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="200" cy="202" r="5" fill="#ff4444" />
        <text x="210" y="200" fill="rgba(255,255,255,0.8)" fontSize="7" fontFamily="monospace">{waterBathTemp}°C</text>
      </g>

      <g opacity={step === 6 ? 1 : 0.2}>
        <rect x="270" y="60" width="5" height="155" rx="2.5" fill="#888" />
        <rect x="276" y="80" width="14" height="130" rx="4" fill="rgba(180,240,180,0.7)" stroke="#70c870" strokeWidth="1.5" />
        <rect x="278" y="82" width="10" height={120 - progress * 50} rx="3" fill="url(#ch_edta)" />
        <rect x="274" y="206" width="18" height="9" rx="3" fill="#777" />
        {step === 6 && (
          <circle cx="283" cy="222" r="2" fill="#90d090">
            <animate attributeName="cy" values="220;238;220" dur="0.9s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="0.9s" repeatCount="indefinite" />
          </circle>
        )}
        <text x="290" y="110" fill="rgba(50,170,50,0.9)" fontSize="6" fontFamily="sans-serif" fontWeight="600">0.1N EDTA</text>
      </g>

      {step === 7 && (
        <g>
          <rect x="20" y="56" width="280" height="56" rx="8" fill="rgba(15,35,64,0.88)" />
          <text x="160" y="76" textAnchor="middle" fill={gold2} fontSize="7.5" fontFamily="monospace" fontWeight="700">Reactivity = CaO fixed (mg) per gram SCM</text>
          <text x="160" y="92" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="monospace">Initial CaO: 2000 mg — Residual: 1180 mg</text>
          <text x="160" y="104" textAnchor="middle" fill={teal} fontSize="8" fontFamily="monospace" fontWeight="700">Reactivity = 820 mg Ca(OH)₂/g SCM ✓</text>
        </g>
      )}

      <rect x="0" y="0" width="320" height="24" fill="rgba(15,35,64,0.88)" />
      <text x="160" y="15" textAnchor="middle" fill={gold2} fontSize="8" fontFamily="monospace" fontWeight="700">{stepLabels[step]}</text>

      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={i} cx={12 + i * 38} cy="250" r="4"
          fill={i === step ? gold2 : i < step ? teal : "rgba(255,255,255,0.2)"}
          stroke={i === step ? "#fff" : "none"} strokeWidth="1" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. FRATTINI TEST
═══════════════════════════════════════════════════════════ */
function AnimFrattini() {
  const { step, progress } = useAnimStep(8, 2300);

  const stepLabels = [
    "Step 1 — Blend 80% OPC + 20% SCM by mass",
    "Step 2 — Mix paste with w/b = 0.50",
    "Step 3 — Fill sealed polyethylene bottles",
    "Step 4 — Cure at 40°C for 8 & 28 days",
    "Step 5 — Dissolve sample; filter hot",
    "Step 6 — Titrate [OH⁻] and [Ca²⁺]",
    "Step 7 — Plot on CaO–OH⁻ diagram",
    "Step 8 — Interpret: below curve = pozzolanic",
  ];

  const plotPoints = step >= 6 ? [
    { x: 56, y: 52, label: "8d", color: gold2 },
    { x: 44, y: 61, label: "28d", color: teal },
  ] : [];

  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="fr_paste_g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e0d0" />
          <stop offset="100%" stopColor="#c8b898" />
        </linearGradient>
      </defs>

      <rect x="0" y="220" width="320" height="40" fill="#c8b99a" />
      <rect x="0" y="216" width="320" height="6" fill="#d6c8ae" />

      <g opacity={step === 0 ? 1 : 0.25}>
        <rect x="14" y="118" width="58" height="80" rx="6" fill="#e8e4dc" stroke="#bbb" strokeWidth="1.5" />
        <text x="43" y="148" textAnchor="middle" fill="#333" fontSize="9" fontFamily="sans-serif" fontWeight="700">OPC</text>
        <text x="43" y="162" textAnchor="middle" fill="#555" fontSize="7" fontFamily="sans-serif">80%</text>
        <rect x="78" y="118" width="58" height="80" rx="6" fill="#f0e8d8" stroke="#c0a880" strokeWidth="1.5" />
        <text x="107" y="148" textAnchor="middle" fill="#6a4a20" fontSize="9" fontFamily="sans-serif" fontWeight="700">SCM</text>
        <text x="107" y="162" textAnchor="middle" fill="#7a5a30" fontSize="7" fontFamily="sans-serif">20%</text>
        <rect x="36" y="52" width="92" height="62" rx="6" fill="rgba(240,235,225,0.8)" stroke="#bbb" strokeWidth="1.5" />
        <text x="82" y="68" textAnchor="middle" fill="#4a3a20" fontSize="7.5" fontFamily="sans-serif" fontWeight="600">Blend 500 g</text>
      </g>

      <g opacity={step >= 2 && step <= 4 ? 1 : 0.25}>
        {[0, 1].map(b => (
          <g key={b} transform={`translate(${30 + b * 80}, 80)`}>
            <rect x="0" y="0" width="52" height="110" rx="10" fill="url(#fr_paste_g)" stroke="#b0a080" strokeWidth="1.5" />
            <rect x="3" y="60" width="46" height="47" rx="8" fill="rgba(200,190,170,0.8)" />
            <rect x="16" y="-18" width="20" height="22" rx="4" fill="#c8b898" stroke="#b0a080" strokeWidth="1" />
            <rect x="13" y="-22" width="26" height="10" rx="4" fill="#444" />
            <rect x="4" y="18" width="44" height="38" rx="4" fill="#fff" stroke="#ddd" strokeWidth="1" />
            <text x="26" y="34" textAnchor="middle" fill="#333" fontSize="7" fontFamily="sans-serif" fontWeight="700">
              {b === 0 ? "8 days" : "28 days"}
            </text>
            <text x="26" y="46" textAnchor="middle" fill="#555" fontSize="6.5" fontFamily="sans-serif">40°C</text>
            <circle cx="40" cy="8" r="6" fill={step >= 3 ? (b === 0 ? gold2 : (step >= 4 ? teal : "#aaa")) : "#aaa"}>
              {step >= 3 && <animate attributeName="opacity" values="0.6;1;0.6" dur={`${1.5 + b * 0.8}s`} repeatCount="indefinite" />}
            </circle>
          </g>
        ))}
      </g>

      <g opacity={step >= 6 ? 1 : 0.15}>
        <rect x="148" y="38" width="158" height="168" rx="8" fill="rgba(15,35,64,0.85)" />
        <text x="227" y="56" textAnchor="middle" fill={gold2} fontSize="8.5" fontFamily="sans-serif" fontWeight="700">CaO – OH⁻ Diagram</text>
        <line x1="178" y1="64" x2="178" y2="164" stroke="#aaa" strokeWidth="1.5" />
        <line x1="178" y1="164" x2="295" y2="164" stroke="#aaa" strokeWidth="1.5" />
        <text x="236" y="178" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="6.5" fontFamily="sans-serif">[OH⁻] mmol/L</text>
        <path d="M182 68 Q200 82 220 100 Q240 118 260 140 Q274 152 290 160" fill="none" stroke="#ff6644" strokeWidth="2" strokeDasharray="6,3" />
        <text x="292" y="148" fill="#ff6644" fontSize="6" fontFamily="sans-serif">Sat.</text>
        <text x="245" y="82" textAnchor="middle" fill="rgba(255,100,68,0.7)" fontSize="6" fontFamily="sans-serif">Supersaturation</text>
        <text x="210" y="150" textAnchor="middle" fill="rgba(100,220,160,0.7)" fontSize="6" fontFamily="sans-serif">Pozzolanic zone</text>
        {plotPoints.map((pt, i) => (
          <g key={i}>
            <circle cx={178 + pt.x} cy={164 - pt.y} r="6" fill={pt.color} opacity={step >= 6 + i ? 1 : 0}>
              {step === 6 + i && <animate attributeName="r" values="0;6" dur="0.5s" fill="freeze" />}
            </circle>
            <text x={178 + pt.x + 8} y={164 - pt.y + 4} fill={pt.color} fontSize="7" fontFamily="monospace" fontWeight="700">
              {pt.label}
            </text>
          </g>
        ))}
        {step === 7 && (
          <g>
            <rect x="156" y="180" width="144" height="20" rx="5" fill="rgba(13,143,111,0.3)" stroke={teal} strokeWidth="1" />
            <text x="228" y="193" textAnchor="middle" fill={teal} fontSize="7.5" fontFamily="monospace" fontWeight="700">✓ Below curve — Pozzolanic!</text>
          </g>
        )}
      </g>

      <rect x="0" y="0" width="320" height="24" fill="rgba(15,35,64,0.88)" />
      <text x="160" y="15" textAnchor="middle" fill={gold2} fontSize="8" fontFamily="monospace" fontWeight="700">{stepLabels[step]}</text>

      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={i} cx={12 + i * 38} cy="250" r="4"
          fill={i === step ? gold2 : i < step ? teal : "rgba(255,255,255,0.2)"}
          stroke={i === step ? "#fff" : "none"} strokeWidth="1" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. TGA ANALYSIS
═══════════════════════════════════════════════════════════ */
function AnimTGA() {
  const { step, progress } = useAnimStep(8, 2400);
  const [tick, setTick] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    let start = null;
    function loop(ts) {
      if (!start) start = ts;
      setTick(((ts - start) / 50) % 200);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const stepLabels = [
    "Step 1 — Arrest hydration with acetone",
    "Step 2 — Load ~12 mg into Al₂O₃ crucible",
    "Step 3 — Insert into TGA instrument",
    "Step 4 — Purge with N₂ gas (50 mL/min)",
    "Step 5 — Heat ramp 10°C/min to 1000°C",
    "Step 6 — Mass loss 400-500°C = Ca(OH)₂",
    "Step 7 — Mass loss 600-780°C = CaCO₃",
    "Step 8 — Quantify CH reduction vs control",
  ];

  const curveProgress = step >= 4 ? Math.min(1, (step - 4) / 3 + progress / 3) : 0;
  const curvePoints = [];
  const numPts = Math.round(curveProgress * 100);
  for (let i = 0; i <= numPts; i++) {
    const t = i / 100;
    const x = 28 + t * 130;
    let y = 14;
    if (t < 0.15) y = 14;
    else if (t < 0.32) y = 14 + (t - 0.15) / 0.17 * 12;
    else if (t < 0.52) y = 26 + (t - 0.32) / 0.20 * 22;
    else if (t < 0.60) y = 48;
    else if (t < 0.78) y = 48 + (t - 0.60) / 0.18 * 18;
    else y = 66;
    curvePoints.push(`${x},${y}`);
  }

  const currentTemp = step >= 4 ? Math.round(25 + curveProgress * 975) : 25;

  return (
    <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="tga_screen" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0a1a10" />
          <stop offset="100%" stopColor="#071510" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <rect x="0" y="220" width="320" height="40" fill="#c8b99a" />
      <rect x="0" y="216" width="320" height="6" fill="#d6c8ae" />

      <g opacity={step === 0 ? 1 : 0.2}>
        <rect x="14" y="130" width="44" height="70" rx="6" fill="rgba(220,240,255,0.7)" stroke="#8ab0cc" strokeWidth="1.5" />
        <rect x="20" y="116" width="32" height="16" rx="3" fill="rgba(220,240,255,0.8)" stroke="#8ab0cc" strokeWidth="1" />
        <rect x="18" y="112" width="36" height="8" rx="3" fill="#555" />
        <text x="36" y="156" textAnchor="middle" fill="#3a6a8a" fontSize="7" fontFamily="sans-serif" fontWeight="600">Acetone</text>
        <rect x="68" y="148" width="52" height="52" rx="5" fill="rgba(245,235,220,0.8)" stroke="#c0a880" strokeWidth="1.5" />
        <rect x="72" y="118" width="44" height="32" rx="4" fill="rgba(245,235,220,0.9)" stroke="#c0a880" strokeWidth="1" />
        <rect x="70" y="114" width="48" height="10" rx="4" fill="#555" />
        <text x="94" y="142" textAnchor="middle" fill="#5a3a10" fontSize="7" fontFamily="sans-serif">Hydrated</text>
        <text x="94" y="153" textAnchor="middle" fill="#5a3a10" fontSize="7" fontFamily="sans-serif">paste</text>
      </g>

      <g opacity={step >= 1 && step <= 2 ? 1 : 0.2}>
        <ellipse cx="140" cy="168" rx="18" ry="6" fill="#e8e4de" stroke="#c0b8a8" strokeWidth="1.5" />
        <path d="M122 168 Q140 184 158 168" fill="#ddd8cc" stroke="#c0b8a8" strokeWidth="1.5" />
        <ellipse cx="140" cy="166" rx="13" ry="4.5" fill="#f0ece6" />
        {step >= 1 && <ellipse cx="140" cy="165" rx="9" ry="3" fill="#c0a878" opacity="0.85" />}
        <text x="140" y="192" textAnchor="middle" fill={muted} fontSize="7" fontFamily="sans-serif">Al₂O₃ crucible · ~12 mg</text>
        {step === 1 && (
          <g>
            <rect x="106" y="196" width="68" height="14" rx="3" fill="#1a1a10" />
            <text x="140" y="207" textAnchor="middle" fill="#88ff44" fontSize="8" fontFamily="monospace" fontWeight="bold">12.348 mg</text>
          </g>
        )}
      </g>

      <g opacity={step >= 2 ? 1 : 0.25}>
        <rect x="170" y="58" width="134" height="152" rx="10" fill="#2a3a4a" stroke="#1a2a3a" strokeWidth="2" />
        <rect x="175" y="63" width="124" height="142" rx="8" fill="#1e2e3e" />
        <rect x="180" y="68" width="114" height="88" rx="6" fill="url(#tga_screen)" />

        <g transform="translate(180,68)">
          {[20, 40, 60, 80].map(y => <line key={y} x1="6" y1={y} x2="110" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
          {[28, 56, 84, 112].map(x => <line key={x} x1={x} y1="6" x2={x} y2="84" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
          <line x1="26" y1="6" x2="26" y2="84" stroke="#334" strokeWidth="1" />
          <line x1="26" y1="84" x2="162" y2="84" stroke="#334" strokeWidth="1" />
          <text x="94" y="93" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5" fontFamily="monospace">Temperature →</text>
          <text x="12" y="45" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="5" fontFamily="monospace" transform="rotate(-90 12 45)">Mass %</text>
          {curvePoints.length > 1 && (
            <polyline points={curvePoints.map(p => p).join(" ")} fill="none" stroke="#00ff88" strokeWidth="1.8" />
          )}
          {curvePoints.length > 0 && (() => {
            const last = curvePoints[curvePoints.length - 1].split(",");
            return <circle cx={parseFloat(last[0])} cy={parseFloat(last[1])} r="3" fill="#00ff88" filter="url(#glow)" />;
          })()}
          {step >= 5 && (
            <g>
              <rect x="58" y="24" width="44" height="22" rx="3" fill="rgba(201,162,39,0.2)" stroke={gold2} strokeWidth="1" />
              <text x="80" y="34" textAnchor="middle" fill={gold2} fontSize="5.5" fontFamily="monospace" fontWeight="700">Ca(OH)₂</text>
              <text x="80" y="43" textAnchor="middle" fill={gold2} fontSize="5" fontFamily="monospace">400–500°C</text>
            </g>
          )}
          {step >= 6 && (
            <g>
              <rect x="90" y="46" width="40" height="22" rx="3" fill="rgba(255,100,68,0.2)" stroke="#ff6644" strokeWidth="1" />
              <text x="110" y="56" textAnchor="middle" fill="#ff6644" fontSize="5.5" fontFamily="monospace" fontWeight="700">CaCO₃</text>
              <text x="110" y="65" textAnchor="middle" fill="#ff6644" fontSize="5" fontFamily="monospace">600–780°C</text>
            </g>
          )}
        </g>

        <rect x="180" y="162" width="114" height="32" rx="5" fill="#141e2a" />
        <text x="237" y="175" textAnchor="middle" fill="#00ff88" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
          {currentTemp}°C
        </text>
        <text x="237" y="187" textAnchor="middle" fill="#44aa88" fontSize="6.5" fontFamily="monospace">
          {step >= 3 ? "N₂ · 50 mL/min · 10°C/min" : "Standby"}
        </text>
      </g>

      {step === 7 && (
        <g>
          <rect x="10" y="38" width="148" height="168" rx="8" fill="rgba(15,35,64,0.90)" />
          <text x="84" y="54" textAnchor="middle" fill={gold2} fontSize="8" fontFamily="sans-serif" fontWeight="700">CH Content (%)</text>
          <rect x="26" y={90} width="36" height={0} rx="3" fill="#4a6a8a">
            <animate attributeName="height" values="0;70" dur="1s" fill="freeze" />
            <animate attributeName="y" values="90;20" dur="1s" fill="freeze" />
          </rect>
          <text x="44" y="98" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="6.5" fontFamily="sans-serif">OPC</text>
          <text x="44" y="18" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="7.5" fontFamily="monospace" fontWeight="700">22.3%</text>
          <rect x="80" y={90} width="36" height={0} rx="3" fill={teal}>
            <animate attributeName="height" values="0;43" dur="1.2s" fill="freeze" />
            <animate attributeName="y" values="90;47" dur="1.2s" fill="freeze" />
          </rect>
          <text x="98" y="98" textAnchor="middle" fill={teal} fontSize="6.5" fontFamily="sans-serif">Blend</text>
          <text x="98" y="45" textAnchor="middle" fill={teal} fontSize="7.5" fontFamily="monospace" fontWeight="700">14.1%</text>
          <line x1="18" y1="90" x2="128" y2="90" stroke="#444" strokeWidth="1" />
          <rect x="14" y="104" width="128" height="18" rx="4" fill="rgba(13,143,111,0.2)" stroke={teal} strokeWidth="1" />
          <text x="78" y="116" textAnchor="middle" fill={teal} fontSize="6.5" fontFamily="monospace" fontWeight="700">CH consumed by SCM ✓</text>
        </g>
      )}

      <rect x="0" y="0" width="320" height="24" fill="rgba(15,35,64,0.88)" />
      <text x="160" y="15" textAnchor="middle" fill={gold2} fontSize="8" fontFamily="monospace" fontWeight="700">{stepLabels[step]}</text>

      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={i} cx={12 + i * 38} cy="250" r="4"
          fill={i === step ? gold2 : i < step ? teal : "rgba(255,255,255,0.2)"}
          stroke={i === step ? "#fff" : "none"} strokeWidth="1" />
      ))}
    </svg>
  );
}

/* ── ANIMATION MAP ── */
const ANIM_MAP = {
  chloride: <AnimChloride />,
  insoluble: <AnimInsoluble />,
  chapelle: <AnimChapelle />,
  frattini: <AnimFrattini />,
  tga: <AnimTGA />,
};

/* ── TEST DATA ── */
const CHEMICAL_TESTS = [
  {
    id: "loi", icon: "🔥", name: "Loss on Ignition", subtitle: "1.0 g sample",
    standard: "IS 4032", standardColor: "#1e3a5f",
    purpose: "Determines volatile matter (moisture, CO₂, organics) driven off at 950°C. High LOI indicates pre-hydration or carbonation.",
    procedure: ["Weigh 1.0 g sample in pre-ignited platinum crucible.", "Place in muffle furnace at 950°C ± 25°C for 30 minutes.", "Cool in desiccator and reweigh.", "Repeat until constant mass achieved.", "LOI (%) = [(W₁ − W₂) / W₁] × 100"],
    results: [
      { material: "SLA", value: "1.9%", limit: "≤ 6%", status: "pass" },
      { material: "TLA", value: "9.24%", limit: "≤ 6%", status: "fail" },
      { material: "IFA", value: "19%", limit: "≤ 5%", status: "fail" },
    ],
    clause: "IS 4032 : 1985, Cl. 3.6",
  },
  {
    id: "chloride", icon: "🧪", name: "Chloride Content", subtitle: "Titration method",
    standard: "IS 4032 Amend. 2", standardColor: "#1e3a5f",
    purpose: "Excess chloride ions cause corrosion of reinforcement steel. Ensures the blend meets IS 456 limits for structural concrete.",
    procedure: ["Dissolve 1.0 g sample in 50 mL dilute HNO₃ (1:3).", "Filter and make up to 250 mL with distilled water.", "Titrate with 0.1 N AgNO₃ using potassium chromate indicator.", "Note volume at end-point (brick-red colour).", "Cl⁻ (%) = (V × N × 35.45) / (W × 10)"],
    results: [
      { material: "SLA", value: "0.0139%", limit: "≤ 0.10%", status: "pass" },
      { material: "TLA", value: "0.0137%", limit: "≤ 0.10%", status: "pass" },
      { material: "IFA", value: "0.01377%", limit: "≤ 0.05%", status: "pass" },
    ],
    clause: "IS 456 : 2000, Table 1 · IS 4032 : 1985, Cl. 3.5",
  },
  {
    id: "insoluble", icon: "⚗️", name: "Insoluble Solids", subtitle: "0.5 g sample",
    standard: "IS 4032", standardColor: "#1e3a5f",
    purpose: "Insoluble residue is the non-reactive mineral fraction. High values indicate quartz/clay impurities that dilute reactivity.",
    procedure: ["Weigh 0.5 g sample into 250 mL beaker.", "Add 50 mL of 1:5 HCl and boil gently for 15 minutes.", "Filter through ashless filter paper (Whatman 42).", "Wash residue free of chloride with hot water.", "Ignite at 900°C for 30 min; cool and weigh.", "IR (%) = (residue mass / original mass) × 100"],
    results: [
      { material: "SLA", value: "38.3%", limit: "≤ 4%", status: "fail" },
      { material: "TLA", value: "14.9%", limit: "≤ 4%", status: "fail" },
      { material: "IFA", value: "7%", limit: "≤ 3%", status: "fail" },
    ],
    clause: "IS 4032 : 1985, Cl. 3.8 · IS 269 : 2015, Cl. 5.2.6",
  },
  {
    id: "chapelle", icon: "🌡️", name: "Modified Chapelle Test", subtitle: "Reactivity test",
    standard: "IS 16354", standardColor: "#7b3f00",
    purpose: "Measures pozzolanic reactivity — how much Ca(OH)₂ a material can fix. Higher values confirm better SCM performance in concrete.",
    procedure: ["Mix 1.0 g SCM + 2.0 g Ca(OH)₂ in 250 mL distilled water.", "Heat in sealed flask at 90°C ± 5°C for 16 hours.", "Filter hot; neutralise excess Ca(OH)₂ with HCl.", "Titrate filtrate with 0.1 N EDTA for residual CaO.", "Reactivity = mg Ca(OH)₂ fixed per gram of SCM."],
    results: [
      { material: "Mix 1 (60m)", value: "1472.96 mg/g", limit: "≥ 800", status: "pass" },
      { material: "Mix 2 (60m)", value: "1417.96 mg/g", limit: "≥ 800", status: "pass" },
      { material: "Mix 3 (60m)", value: "1325.77 mg/g", limit: "≥ 800", status: "pass" },
      { material: "Mix 4 (60m)", value: "1168.44 mg/g", limit: "≥ 800", status: "pass" },
      { material: "Mix 5 (60m)", value: "1000.87 mg/g", limit: "≥ 800", status: "pass" },
      { material: "Mix 1 (90m)", value: "1016.10 mg/g", limit: "≥ 800", status: "pass" },
      { material: "Mix 2 (90m)", value: "1008.17 mg/g", limit: "≥ 800", status: "pass" },
      { material: "Mix 3 (90m)", value: "932.80 mg/g", limit: "≥ 800", status: "pass" },
      { material: "Mix 4 (90m)", value: "930.28 mg/g", limit: "≥ 800", status: "pass" },
      { material: "Mix 5 (90m)", value: "806.89 mg/g", limit: "≥ 800", status: "pass" },
    ],
    clause: "IS 16354 : 2015",
  },
  {
    id: "frattini", icon: "🔬", name: "Frattini Test", subtitle: "Pozzolanic activity",
    standard: "IS 1727", standardColor: "#1e3a5f",
    purpose: "Tests whether blended cement solution plots below the CaO saturation curve at 8 and 28 days — confirming pozzolanic activity.",
    procedure: ["Prepare 80% OPC + 20% SCM blend (by mass).", "Cure sealed paste at 40°C.", "At 8 & 28 days dissolve hardened sample in water.", "Titrate filtrate to determine [OH⁻] and [Ca²⁺].", "Plot on CaO–OH⁻ diagram; below curve = ✓ pozzolanic."],
    results: [
      { material: "Mix 1 (60m)", value: "81.05%", limit: "> 0%", status: "pass" },
      { material: "Mix 2 (60m)", value: "73.55%", limit: "> 0%", status: "pass" },
      { material: "Mix 3 (60m)", value: "87.53%", limit: "> 0%", status: "pass" },
      { material: "Mix 4 (60m)", value: "92.82%", limit: "> 0%", status: "pass" },
      { material: "Mix 5 (60m)", value: "93.67%", limit: "> 0%", status: "pass" },
      { material: "Mix 1 (90m)", value: "24.06%", limit: "> 0%", status: "pass" },
      { material: "Mix 2 (90m)", value: "9.39%", limit: "> 0%", status: "pass" },
      { material: "Mix 3 (90m)", value: "41.66%", limit: "> 0%", status: "pass" },
      { material: "Mix 4 (90m)", value: "66.67%", limit: "> 0%", status: "pass" },
      { material: "Mix 5 (90m)", value: "76.16%", limit: "> 0%", status: "pass" },
    ],
    clause: "IS 1727 : 1967",
  },
  {
    id: "tga", icon: "📈", name: "TGA Analysis", subtitle: "Thermal analysis",
    standard: "ASTM C1872", standardColor: "#1a3a6e",
    purpose: "Quantifies Ca(OH)₂, CaCO₃ and C-S-H in hydrated paste. CH reduction of 36.8% confirms strong pozzolanic consumption.",
    procedure: ["Prepare hydrated paste at 7, 28, 90 days; arrest with acetone.", "Load ~12 mg into TGA alumina crucible.", "Heat 25→1000°C at 10°C/min in N₂ atmosphere.", "Record mass loss: 400–500°C (Ca(OH)₂), 600–780°C (CaCO₃).", "Quantify portlandite reduction as pozzolanic measure."],
    results: [
      { material: "Control (OPC)", value: "CH: 22.3%", limit: "Reference", status: "ref" },
      { material: "Blended 20% SCM", value: "CH: 14.1%", limit: "< control", status: "pass" },
      { material: "CH reduction", value: "−36.8%", limit: "Significant", status: "pass" },
    ],
    clause: "ASTM C1872 · ASTM E1131 · NETZSCH STA 449",
  },
];

/* ── REPORT DATA ── */
const REPORTS = [
  {
    id: "sla", color: "#1e3a5f", colorLight: "#e8eef5",
    material: "SLA", fullName: "Sugarcane Leaf Ash",
    reportNo: "K-7917-7918-P_0001", date: "28 Feb 2026",
    lab: "ELCA Quality Systems & Calibrations Pvt. Ltd., Pune", type: "XRF Analysis",
    keyResults: [
      { param: "SiO₂ + Al₂O₃ + Fe₂O₃", value: "74.3%", limit: "≥ 70%", pass: true },
      { param: "SO₃", value: "1.2%", limit: "≤ 5%", pass: true },
      { param: "MgO", value: "3.4%", limit: "≤ 6%", pass: true },
      { param: "Loss on Ignition", value: "4.2%", limit: "≤ 6%", pass: true },
      { param: "Moisture Content", value: "0.8%", limit: "≤ 3%", pass: true },
    ],
    verdict: "PASS — Meets ASTM C618 Class F & IS 4032 requirements",
  },
  {
    id: "tla", color: "#2d6a4f", colorLight: "#e8f5ef",
    material: "TLA", fullName: "Turmeric Leaf Ash",
    reportNo: "K-7917-7918-P_0001", date: "28 Feb 2026",
    lab: "ELCA Quality Systems & Calibrations Pvt. Ltd., Pune", type: "XRF Analysis",
    keyResults: [
      { param: "SiO₂ + Al₂O₃ + Fe₂O₃", value: "71.6%", limit: "≥ 70%", pass: true },
      { param: "SO₃", value: "0.9%", limit: "≤ 5%", pass: true },
      { param: "MgO", value: "4.1%", limit: "≤ 6%", pass: true },
      { param: "Loss on Ignition", value: "3.8%", limit: "≤ 6%", pass: true },
      { param: "Moisture Content", value: "1.1%", limit: "≤ 3%", pass: true },
    ],
    verdict: "PASS — Meets ASTM C618 Class F & IS 4032 requirements",
  },
  {
    id: "ifa", color: "#6b4226", colorLight: "#f5ede5",
    material: "IFA", fullName: "Incinerated Fly Ash",
    reportNo: "L-7146-P_0001", date: "16 Mar 2026",
    lab: "ELCA Quality Systems & Calibrations Pvt. Ltd., Pune", type: "XRF Analysis",
    keyResults: [
      { param: "SiO₂ + Al₂O₃ + Fe₂O₃", value: "76.8%", limit: "≥ 70%", pass: true },
      { param: "SO₃", value: "2.1%", limit: "≤ 3%", pass: true },
      { param: "MgO", value: "2.9%", limit: "≤ 5%", pass: true },
      { param: "Total Chloride", value: "0.018%", limit: "≤ 0.05%", pass: true },
      { param: "Loss on Ignition", value: "2.1%", limit: "≤ 5%", pass: true },
    ],
    verdict: "PASS — Meets IS 3812 : 2003 requirements",
  },
];

/* ── HELPERS ── */
function StatusBadge({ status }) {
  const map = {
    pass: { bg: "#e3f9f0", color: "#0d8f6f", label: "✓ Pass" },
    warn: { bg: "#fdf6e3", color: "#b86010", label: "⚠ Marginal" },
    fail: { bg: "#fdeaea", color: "#6b1212", label: "✗ Fail" },
    ref: { bg: "#f0f4f8", color: "#1e3a5f", label: "— Ref." },
  };
  const s = map[status] || map.ref;
  return <span style={{ background: s.bg, color: s.color, fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, fontFamily: "monospace", whiteSpace: "nowrap" }}>{s.label}</span>;
}
function StandardBadge({ label, color }) {
  return <span style={{ background: color || navy3, color: "#fff", fontFamily: "monospace", fontSize: "0.62rem", fontWeight: 600, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>{label}</span>;
}

/* ── TEST CARD ── */
function TestCard({ test, index, open, onToggle }) {
  const isVideoTest = test.id === "loi" || test.id === "chloride" || test.id === "insoluble" || test.id === "chapelle" || test.id === "frattini" || test.id === "tga";
  const cardRef = useRef(null);
  const [showGraph, setShowGraph] = useState(false);
  
  const hasGrindData = test.results.some(r => r.material.includes("(60m)") || r.material.includes("(90m)"));
  const [localGrind, setLocalGrind] = useState(90);

  useEffect(() => {
    if (!open) setShowGraph(false);
  }, [open, localGrind]);

  useEffect(() => {
    if (open && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 150);
    }
  }, [open]);

  return (
    <div ref={cardRef} style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden", transition: "box-shadow 0.2s", boxShadow: open ? "0 6px 32px rgba(15,35,64,0.13)" : "none" }}>
      <button onClick={onToggle}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "1rem 1.3rem", display: "flex", alignItems: "center", gap: "1rem" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(15,35,64,0.02)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >
        <div style={{ width: 32, height: 32, borderRadius: 8, background: open ? navy : "rgba(15,35,64,0.06)", color: open ? "#fff" : navy3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0, transition: "all 0.2s" }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{test.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#0f1b2d", marginBottom: "0.15rem" }}>{test.name}</div>
          <div style={{ fontSize: "0.73rem", color: muted }}>{test.subtitle}</div>
        </div>
        <StandardBadge label={test.standard} color={test.standardColor} />
        {isVideoTest && (
          <span style={{ background: "rgba(201,162,39,0.12)", color: gold2, fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, fontFamily: "monospace", whiteSpace: "nowrap", marginLeft: 4 }}>🎬 VIDEO</span>
        )}
        <span style={{ fontSize: "0.7rem", color: muted, flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s", marginLeft: "0.5rem" }}>▼</span>
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${border}`, animation: "fadeDown 0.25s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 300 }}>
            {/* LEFT panel */}
            <div style={{
              background: isVideoTest
                ? "linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 100%)"
                : "linear-gradient(160deg, #0c1c30 0%, #172d4e 100%)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: isVideoTest ? "0" : "1.2rem 1rem 0.8rem",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              position: "relative",
              overflow: "hidden",
            }}>
              {isVideoTest ? (
                /* VIDEO PLAYER */
                <div style={{ width: "100%", height: "100%", minHeight: 300, maxHeight: 550 }}>
                  <VideoPlayer
                    isOpen={open}
                    src={test.id === "loi" ? "/Payal 2.mp4" : test.id === "chloride" ? tanviVideoSrc : test.id === "chapelle" ? "/Kaveri.mp4" : test.id === "frattini" ? "/Aniket.mp4" : test.id === "tga" ? "/Payal 1.mp4" : kedarVideoSrc}
                    title={test.id === "loi" ? "Loss on Ignition" : test.id === "chloride" ? "Chloride Content" : test.id === "chapelle" ? "Modified Chapelle Test" : test.id === "frattini" ? "Frattini Test" : test.id === "tga" ? "TGA Analysis" : "Insoluble Solids"}
                  />
                </div>
              ) : (
                /* SVG ANIMATION for others */
                <>
                  <div style={{ fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: gold2, marginBottom: "0.5rem" }}>
                    🧫 Full Process — Step by Step
                  </div>
                  <div style={{ width: "100%", maxWidth: 260 }}>
                    {ANIM_MAP[test.id]}
                  </div>
                  <div style={{ marginTop: "0.6rem", padding: "0.55rem 0.8rem", background: "rgba(201,162,39,0.08)", borderRadius: 8, borderLeft: `3px solid ${gold2}`, fontSize: "0.71rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.55, width: "100%" }}>
                    {test.purpose}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT — Results + Procedure */}
            <div style={{ padding: "1.3rem 1.4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {isVideoTest && (
                <div style={{ padding: "0.6rem 0.8rem", background: "rgba(201,162,39,0.06)", borderRadius: 8, borderLeft: `3px solid ${gold2}`, fontSize: "0.71rem", color: "#0f1b2d", lineHeight: 1.55 }}>
                  {test.purpose}
                </div>
              )}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted }}>Test Results</div>
                  {hasGrindData && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(15,35,64,0.04)", padding: "3px", borderRadius: 8, border: `1px solid ${border}` }}>
                      {[60, 90].map(g => (
                        <button
                          key={g}
                          onClick={() => setLocalGrind(g)}
                          style={{
                            padding: "3px 8px", border: "none", borderRadius: 6,
                            background: localGrind === g ? gold2 : "transparent",
                            color: localGrind === g ? "#fff" : muted,
                            fontSize: "0.65rem", fontWeight: 700, cursor: "pointer",
                            transition: "all 0.2s", fontFamily: "'DM Mono', monospace"
                          }}
                        >
                          {g} Grind
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.77rem" }}>
                  <thead>
                    <tr>{["Material", "Value", "Limit", "Status"].map(h => (
                      <th key={h} style={{ background: "rgba(15,35,64,0.04)", padding: "0.38rem 0.55rem", textAlign: "left", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: muted, borderBottom: `1px solid ${border}` }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {test.results.filter(row => {
                      if (row.material.includes("60m")) return localGrind === 60;
                      if (row.material.includes("90m")) return localGrind === 90;
                      return true;
                    }).map((row, i, arr) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "rgba(15,35,64,0.015)" }}>
                        <td style={{ padding: "0.42rem 0.55rem", fontWeight: 600, color: "#0f1b2d", borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none" }}>{row.material.replace(" (60m)", "").replace(" (90m)", "")}</td>
                        <td style={{ padding: "0.42rem 0.55rem", fontFamily: "monospace", fontWeight: 700, color: navy3, borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none" }}>{row.value}</td>
                        <td style={{ padding: "0.42rem 0.55rem", fontFamily: "monospace", color: muted, fontSize: "0.71rem", borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none" }}>{row.limit}</td>
                        <td style={{ padding: "0.42rem 0.55rem", borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none" }}><StatusBadge status={row.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {test.id === "frattini" && (
                  <div style={{ marginTop: "1rem" }}>
                    <button onClick={() => setShowGraph(true)} style={{ background: navy, color: "#fff", borderRadius: 8, padding: "0.45rem 1.1rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", border: "none", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(15,35,64,0.15)" }}>
                      📈 View {localGrind} Grind Graph
                    </button>
                    {showGraph && (
                      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15,35,64,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "2rem" }}>
                        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", maxWidth: "900px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", animation: "fadeDown 0.25s ease-out" }}>
                          <button onClick={() => setShowGraph(false)} style={{ position: "absolute", top: "1.2rem", right: "1.2rem", background: "rgba(15,35,64,0.06)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold", color: navy, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(15,35,64,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(15,35,64,0.06)"}>✕</button>
                          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: navy, marginBottom: "1rem", fontFamily: "Georgia, serif" }}>Frattini Test Results — {localGrind} Grind</div>
                          <div style={{ flex: 1, overflow: "auto", borderRadius: 8, border: `1px solid ${border}` }}>
                            <img src={localGrind === 60 ? "/frattini_test_graph (4).png" : "/graph 90.png"} alt={`Frattini ${localGrind} Grind Graph`} style={{ width: "100%", display: "block" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, marginBottom: "0.45rem" }}>Procedure</div>
                <ol style={{ margin: 0, paddingLeft: "1.1rem", display: "flex", flexDirection: "column", gap: "0.28rem" }}>
                  {test.procedure.map((step, i) => (
                    <li key={i} style={{ fontSize: "0.75rem", color: "#0f1b2d", lineHeight: 1.55 }}>{step}</li>
                  ))}
                </ol>
              </div>
              <div style={{ fontSize: "0.66rem", color: muted, fontFamily: "monospace", marginTop: "auto", paddingTop: "0.5rem", borderTop: `1px solid ${border}` }}>
                📋 {test.clause}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── REPORT CARD ── */
function ReportCard({ report }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden", boxShadow: open ? "0 4px 24px rgba(15,35,64,0.10)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.2rem 1.4rem", background: open ? "rgba(15,35,64,0.02)" : "#fff", borderBottom: open ? `1px solid ${border}` : "none" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: report.color, flexShrink: 0, boxShadow: `0 0 0 3px ${report.colorLight}` }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#0f1b2d", marginBottom: "0.2rem" }}>{report.material} — {report.fullName}</div>
          <div style={{ fontSize: "0.68rem", color: muted, fontFamily: "monospace", marginTop: "0.15rem" }}>{report.type} · {report.reportNo} · {report.date}</div>
        </div>
        <span style={{ background: "#e3f9f0", color: teal, fontSize: "0.62rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>✓ PASS</span>
        <button onClick={() => setOpen(o => !o)} style={{ background: open ? navy : "rgba(15,35,64,0.06)", color: open ? "#fff" : navy3, border: "none", borderRadius: 8, padding: "0.35rem 0.9rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
          {open ? "✕ Close" : "📊 View Data"}
        </button>
      </div>
      {open && (
        <div style={{ padding: "1.2rem 1.4rem 1.5rem" }}>
          <div style={{ background: `linear-gradient(135deg, ${report.colorLight}, #fff)`, border: `1px solid ${report.color}22`, borderRadius: 10, padding: "0.8rem 1rem", marginBottom: "1rem", fontSize: "0.75rem", color: "#0f1b2d" }}>
            <strong>Laboratory:</strong> {report.lab}<br /><strong>Report No.:</strong> {report.reportNo} &nbsp;·&nbsp; <strong>Date:</strong> {report.date}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", marginBottom: "1rem" }}>
            <thead><tr>{["Parameter", "Result", "IS / ASTM Limit", ""].map(h => <th key={h} style={{ background: "rgba(15,35,64,0.04)", padding: "0.4rem 0.75rem", textAlign: "left", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: muted, borderBottom: `1px solid ${border}` }}>{h}</th>)}</tr></thead>
            <tbody>{report.keyResults.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: "0.5rem 0.75rem", color: "#0f1b2d", borderBottom: i < report.keyResults.length - 1 ? `1px solid ${border}` : "none" }}>{row.param}</td>
                <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", fontWeight: 700, color: report.color, borderBottom: i < report.keyResults.length - 1 ? `1px solid ${border}` : "none" }}>{row.value}</td>
                <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", color: muted, borderBottom: i < report.keyResults.length - 1 ? `1px solid ${border}` : "none" }}>{row.limit}</td>
                <td style={{ padding: "0.5rem 0.75rem", borderBottom: i < report.keyResults.length - 1 ? `1px solid ${border}` : "none" }}><span style={{ background: row.pass ? "#e3f9f0" : "#fdeaea", color: row.pass ? teal : red, fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, fontFamily: "monospace" }}>{row.pass ? "✓" : "✗"}</span></td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ background: "#e3f9f0", border: "1px solid rgba(13,143,111,0.2)", borderRadius: 8, padding: "0.7rem 1rem", fontSize: "0.78rem", fontWeight: 700, color: teal, marginBottom: "1rem" }}>✅ {report.verdict}</div>
          <div style={{ background: bg, border: `1.5px dashed ${border}`, borderRadius: 10, padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div>
            <div style={{ fontSize: "0.8rem", color: muted, marginBottom: "0.75rem" }}>Original ELCA Lab PDF — {report.reportNo}</div>
            <a href={`/report/${report.reportNo}.pdf`} download={`${report.reportNo}.pdf`} style={{ display: "inline-block", background: navy, color: "#fff", borderRadius: 8, padding: "0.5rem 1.2rem", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em" }}>⬇ Download PDF</a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function Chemical() {
  const [activeTab, setActiveTab] = useState("tests");
  const [activeTestId, setActiveTestId] = useState(null);
  const tabStyle = (id) => ({
    padding: "0.7rem 1.6rem", fontSize: "0.82rem", fontWeight: 700, border: "none", cursor: "pointer",
    background: activeTab === id ? navy : "transparent",
    color: activeTab === id ? "#fff" : muted,
    borderBottom: activeTab === id ? `3px solid ${gold2}` : "3px solid transparent",
    transition: "all 0.18s", borderRadius: "8px 8px 0 0", marginBottom: -1, letterSpacing: "0.02em",
  });

  return (
    <>
      <style>{`
        @keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width:720px) { .chem-split { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ background: bg, minHeight: "100vh", paddingBottom: "4rem" }}>
        <div style={{ background: "#fff", borderBottom: `1px solid ${border}`, padding: "2rem 2.5rem 0", textAlign: "left" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: red, marginBottom: "0.4rem" }}>IS 4032 : 1985 · IS 456 : 2000 · ASTM C618</div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 800, color: "#0f1e30", margin: "0 0 0.4rem" }}>
              Chemical <span style={{ color: red }}>Testing</span>
            </h1>
            <p style={{ fontSize: "0.85rem", color: muted, margin: "0 0 1.5rem", maxWidth: 620, lineHeight: 1.65 }}>
              Click any test to see the full lab process — real video for LOI, step-by-step animations for all others.
            </p>
            <div style={{ display: "flex", borderBottom: `1px solid ${border}`, gap: 4 }}>
              <button style={tabStyle("tests")} onClick={() => setActiveTab("tests")}>⚗️ Chemical Tests</button>
              <button style={tabStyle("report")} onClick={() => setActiveTab("report")}>📥 Download Report</button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "2rem 2.5rem" }}>
          {activeTab === "tests" && (
            <div style={{ animation: "fadeDown 0.2s ease" }}>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: navy3 }}>Click a test card to expand</span>
                <div style={{ flex: 1, height: 1, background: border }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {CHEMICAL_TESTS.map((test, i) => (
                  <TestCard key={test.id} test={test} index={i} open={activeTestId === test.id} onToggle={() => setActiveTestId(activeTestId === test.id ? null : test.id)} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "report" && (
            <div style={{ animation: "fadeDown 0.2s ease" }}>
              <div style={{ background: `linear-gradient(135deg,${navy},#1e3a5f)`, borderRadius: 14, padding: "1.4rem 1.8rem", marginBottom: "1.8rem", border: "1px solid rgba(201,162,39,0.2)" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: gold2, marginBottom: "0.4rem" }}>XRF Analysis — ELCA Quality Systems &amp; Calibrations, Pune</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>Laboratory Certification Reports</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>All XRF reports conducted at ELCA Quality Systems &amp; Calibrations Pvt. Ltd., Pune. SEM &amp; EDS at National Chemical Laboratory (NCL), Pune · Feb–Mar 2026.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: navy3 }}>Material Reports</span>
                <div style={{ flex: 1, height: 1, background: border }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.8rem" }}>
                {REPORTS.map(r => <ReportCard key={r.id} report={r} />)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.8rem" }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: navy3 }}>SEM &amp; EDS Reports</span>
                <div style={{ flex: 1, height: 1, background: border }} />
              </div>
              <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 14, padding: "1.5rem 1.6rem", display: "flex", alignItems: "center", gap: "1.2rem" }}>
                <span style={{ fontSize: "2rem" }}>🔬</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "#0f1b2d", marginBottom: "0.2rem" }}>SEM / EDS Analysis — National Chemical Laboratory, Pune</div>
                  <div style={{ fontSize: "0.72rem", color: muted }}>Conducted Feb–Mar 2026 · Morphology and elemental mapping of SLA, TLA, IFA</div>
                </div>
                <a href="/report/NCL-SEM-Report.pdf" download="NCL-SEM-Report.pdf" style={{ display: "inline-block", background: navy, color: "#fff", borderRadius: 8, padding: "0.5rem 1.2rem", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>⬇ Download PDF</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
