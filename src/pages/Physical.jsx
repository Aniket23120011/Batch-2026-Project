/**
 * Physical.jsx — updated
 * Corrections applied:
 *  1. Mix selector (M0 OPC + M1–M5) on every test; animation reacts; result highlighted after anim
 *  2. Compression: clean machine left, cube pyramid right, cube animates, reading appears LEFT
 *  3. Stats row (Total Tests / Tests Passed / IS code) removed
 */

import { useState, useEffect, useRef } from "react";

/* ── PALETTE ── */
const navy = "#0f2340";
const navy3 = "#1e3a5f";
const gold2 = "#c9a227";
const red = "#6b1212";
const teal = "#0d8f6f";
const amber = "#b86010";
const border = "rgba(15,35,64,0.09)";
const muted = "#4a5468";
const bg = "#f5f3ef";

/* ── VIDEO PLAYER ── */
function VideoPlayer({ isOpen, src, title }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (!videoRef.current) return;
    if (isOpen) { videoRef.current.play().catch(() => { }); }
    else { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  }, [isOpen]);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <video ref={videoRef} src={src}
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

/* ── MIX DEFINITIONS ── */
const MIXES = [
  { id: "M0", label: "M0 — OPC 100%", sla: 0, tla: 0, ifa: 0 },
  { id: "M1", label: "M1 — SLA10·TLA3·IFA2", sla: 10, tla: 3, ifa: 2 },
  { id: "M2", label: "M2 — SLA10·TLA5·IFA5", sla: 10, tla: 5, ifa: 5 },
  { id: "M3", label: "M3 — SLA15·TLA5·IFA5", sla: 15, tla: 5, ifa: 5 },
  { id: "M4", label: "M4 — SLA20·TLA5·IFA5", sla: 20, tla: 5, ifa: 5 },
  { id: "M5", label: "M5 — SLA25·TLA5·IFA5", sla: 25, tla: 5, ifa: 5 },
];

/* water % for consistency per mix */
const CONSISTENCY_W = {
  60: { M0: 28, M1: 33.0, M2: 34.5, M3: 36.6, M4: 40.5, M5: 42.5 },
  90: { M0: 28, M1: 33.0, M2: 37.0, M3: 40.0, M4: 42.0, M5: 43.5 }
};
/* penetration depth (mm from bottom) for each mix — standard = 5–7 mm from bottom */
const PENETRATION = { M0: 6, M1: 6, M2: 6, M3: 7, M4: 7, M5: 8 };
/* initial set time minutes */
const INIT_SET = {
  60: { M0: 35, M1: 68, M2: 75, M3: 84, M4: 78, M5: 65 },
  90: { M0: 35, M1: 62, M2: 48, M3: 38, M4: 42, M5: 46 }
};
/* final set time minutes */
const FINAL_SET = {
  60: { M0: 280, M1: 235, M2: 264, M3: 222, M4: 236, M5: 250 },
  90: { M0: 280, M1: 157, M2: 168, M3: 185, M4: 138, M5: 120 }
};
/* soundness expansion mm */
const SOUNDNESS = {
  60: { M0: 1.2, M1: 0.22, M2: 0.62, M3: 0.29, M4: 4.33, M5: 0.34 },
  90: { M0: 1.2, M1: 0.35, M2: 0.76, M3: 0.32, M4: 0.68, M5: 0.63 }
};
/* 7-day, 28-day, and 56-day compressive strength N/mm² */
const STRENGTH = {
  60: {
    M0: { d7: 24.52, d28: 39.1, d56: 42.1 },
    M1: { d7: 32.12, d28: 35.4, d56: 38.6 },
    M2: { d7: 26.45, d28: 36.8, d56: 40.9 },
    M3: { d7: 24.18, d28: 40.2, d56: 45.1 },
    M4: { d7: 26.68, d28: 38.2, d56: 42.4 },
    M5: { d7: 27.71, d28: 33.1, d56: 37.8 },
  },
  90: {
    M0: { d7: 23.15, d28: 43.2, d56: 44.8 },
    M1: { d7: 24.68, d28: 38.6, d56: 41.2 },
    M2: { d7: 24.88, d28: 40.1, d56: 43.5 },
    M3: { d7: 25.64, d28: 44.7, d56: 48.6 },
    M4: { d7: 23.47, d28: 41.8, d56: 45.4 },
    M5: { d7: 23.96, d28: 36.5, d56: 40.2 },
  }
};

/* ══════════════════════════════════════════════
   SHARED: MIX SELECTOR BAR
══════════════════════════════════════════════ */
function MixSelector({ selected, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "0.9rem" }}>
      {MIXES.map(m => {
        const active = selected === m.id;
        return (
          <button key={m.id} onClick={() => onChange(m.id)}
            style={{
              padding: "5px 12px", fontSize: "0.7rem", fontWeight: 700,
              borderRadius: 20, cursor: "pointer", border: `1.5px solid ${active ? navy3 : border}`,
              background: active ? navy : "rgba(15,35,64,0.04)",
              color: active ? "#fff" : muted,
              fontFamily: "'DM Mono',monospace",
              transition: "all 0.15s",
              boxShadow: active ? "0 2px 8px rgba(15,35,64,0.18)" : "none",
            }}>
            {m.id}
          </button>
        );
      })}
    </div>
  );
}

function AnimVicat({ mixId, onDone }) {
  const [phase, setPhase] = useState("idle");
  const timerRef = useRef(null);

  useEffect(() => {
    setPhase("dropping");
    timerRef.current = setTimeout(() => { setPhase("done"); onDone && onDone(); }, 2000);
    return () => clearTimeout(timerRef.current);
  }, [mixId]);

  const pen = PENETRATION[mixId] || 6;
  const mouldH = 40;
  const needleTravel = mouldH - pen;
  const dropY = phase === "dropping" || phase === "done" ? needleTravel : 0;

  return (
    <svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block", background: "linear-gradient(to bottom, #0f1b2d 0%, #1e3a5f 100%)" }}>
      <rect x="0" y="210" width="320" height="30" fill="#2a3848" />
      <rect x="0" y="208" width="320" height="4" fill="#3a4a5a" />

      {/* Stand & Scale */}
      <rect x="80" y="40" width="14" height="170" rx="4" fill="#607080" />
      <rect x="94" y="50" width="100" height="14" rx="4" fill="#506070" />
      <rect x="94" y="110" width="60" height="14" rx="4" fill="#506070" />

      {/* Scale lines */}
      <g fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">
        {[0, 10, 20, 30, 40].map((v, i) => (
          <g key={i}>
            <line x1="80" y1={150 - i * 10} x2="72" y2={150 - i * 10} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <text x="68" y={150 - i * 10 + 2} textAnchor="end">{v}</text>
          </g>
        ))}
      </g>

      {/* Glass Plate */}
      <rect x="140" y="204" width="90" height="4" rx="2" fill="rgba(200, 230, 255, 0.4)" />

      {/* Vicat Mould */}
      <path d="M 152 164 L 218 164 L 224 204 L 146 204 Z" fill="#d8d0c0" stroke="#b0a898" strokeWidth="2" />

      {/* Paste */}
      <path d="M 154 166 L 216 166 L 221 202 L 149 202 Z" fill="#b0a290" />

      {/* Dropping Mechanism */}
      <g style={{ transition: "transform 1.6s cubic-bezier(0.4, 0, 0.2, 1)" }} transform={`translate(0, ${dropY})`}>
        {/* Rod */}
        <rect x="180" y="46" width="8" height="120" rx="2" fill="#e0e8f0" stroke="#a0b0c0" strokeWidth="1" />

        {/* Pointer */}
        <line x1="180" y1="150" x2="80" y2="150" stroke="#c9a227" strokeWidth="2" strokeDasharray="4,2" />
        <polygon points="86,146 80,150 86,154" fill="#c9a227" />

        {/* 10mm Plunger */}
        <rect x="179" y="116" width="10" height="50" rx="1" fill="#a0b0c0" />
      </g>

      <text x="160" y="25" textAnchor="middle" fill="#c9a227" fontSize="11" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">STANDARD CONSISTENCY TEST</text>

      {phase === "done" && (
        <g style={{ animation: "fadeIn 0.5s" }}>
          <rect x="220" y="80" width="85" height="36" rx="6" fill="#0d8f6f" opacity="0.9" />
          <text x="262.5" y="96" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">PENETRATION</text>
          <text x="262.5" y="108" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace" fontWeight="bold">{pen} mm from base</text>
        </g>
      )}
    </svg>
  );
}

/* ══════════════════════════════════════════════
   2. SETTING TIME — Vicat 1mm needle anim
══════════════════════════════════════════════ */
function AnimSettingTime({ mixId, onDone }) {
  const [tick, setTick] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    setTick(0); setDone(false);
    const id = setInterval(() => setTick(t => t + 1), 800);
    const d = setTimeout(() => { setDone(true); clearInterval(id); onDone && onDone(); }, 3200);
    return () => { clearInterval(id); clearTimeout(d); };
  }, [mixId]);

  const isInitial = tick % 2 === 0;
  return (
    <svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}>
      <rect x="10" y="178" width="240" height="12" rx="3" fill="#c8b89a" />
      <rect x="10" y="176" width="240" height="4" rx="2" fill="#d4c4a8" />
      <rect x="42" y="40" width="9" height="138" rx="3" fill="#4a5a6a" />
      <rect x="36" y="174" width="48" height="8" rx="3" fill="#3a4a5a" />
      <rect x="48" y="48" width="90" height="9" rx="3" fill="#3a4a5a" />

      {/* needle slides with toggle */}
      <g style={{ transition: "transform 0.9s ease-in-out" }}
        transform={`translate(0,${done ? 26 : isInitial ? 18 : 24})`}>
        <rect x="94" y="51" width="38" height="16" rx="4" fill="#b0bcc8" stroke="#6a7a8a" strokeWidth="1" />
        <line x1="94" y1="59" x2="44" y2="59" stroke={gold2} strokeWidth="1.5" strokeDasharray="3,2" />
        {/* 1mm needle — thin */}
        <rect x="112" y="67" width="3" height="80" rx="1" fill="#7a8a9a" />
        <rect x="111" y="145" width="5" height="4" rx="1" fill="#5a6a7a" />
      </g>

      {/* mould */}
      <rect x="86" y="143" width="58" height="34" rx="3" fill="#e8e4dc" stroke="#b8b0a0" strokeWidth="1.5" />
      <rect x="88" y="145" width="54" height="28" rx="2"
        fill={done ? "#b8b0a0" : isInitial ? "#d4c8b4" : "#c8bea8"}
        style={{ transition: "fill 0.8s" }} />

      {/* phase label */}
      <rect x="88" y="30" width="90" height="16" rx="5"
        fill={isInitial ? "rgba(13,143,111,0.2)" : "rgba(107,18,18,0.2)"} />
      <text x="133" y="42" textAnchor="middle"
        fill={isInitial ? teal : red} fontSize="8" fontFamily="sans-serif" fontWeight="700">
        {isInitial ? "Initial Set phase" : "Final Set phase"}
      </text>

      {/* clock */}
      <circle cx="210" cy="95" r="26" fill="none" stroke="#6a7a8a" strokeWidth="2" />
      <circle cx="210" cy="95" r="2" fill="#888" />
      <line x1="210" y1="95" x2="210" y2="74" stroke="#888" strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate"
          values="0 210 95;360 210 95" dur="60s" repeatCount="indefinite" />
      </line>
      <line x1="210" y1="95" x2="228" y2="95" stroke={gold2} strokeWidth="2.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate"
          values="0 210 95;360 210 95" dur="5s" repeatCount="indefinite" />
      </line>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        return <line key={i} x1={210 + 20 * Math.cos(a)} y1={95 + 20 * Math.sin(a)}
          x2={210 + 25 * Math.cos(a)} y2={95 + 25 * Math.sin(a)} stroke="#6a7a8a" strokeWidth="1.5" />;
      })}
      <text x="130" y="196" textAnchor="middle" fill="rgba(200,220,255,0.45)"
        fontSize="8" fontFamily="sans-serif" fontWeight="600">
        Vicat · 1mm Needle · IS 4031 Pt 5
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   3. SOUNDNESS — Le-Chatelier anim
══════════════════════════════════════════════ */
function AnimLeChatelier({ mixId, grind, onDone }) {
  const [spread, setSpread] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    setSpread(0); setDone(false);
    const t1 = setTimeout(() => setSpread(1), 600);
    const t2 = setTimeout(() => { setDone(true); onDone && onDone(); }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [mixId]);

  const exp = SOUNDNESS[grind][mixId] || 2;
  const maxAngle = 14; // degrees visual spread
  const angle = spread * (exp / 10) * maxAngle;

  return (
    <svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id="lc_water2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a0d0ff" /><stop offset="100%" stopColor="#4090d0" />
        </linearGradient>
      </defs>
      <rect x="10" y="178" width="240" height="12" rx="3" fill="#c8b89a" />

      {/* Water bath */}
      <rect x="28" y="120" width="100" height="60" rx="5" fill="#1a3a5a" stroke="#0a2a4a" strokeWidth="1.5" />
      <rect x="32" y="126" width="92" height="50" rx="3" fill="url(#lc_water2)" opacity="0.8" />
      {/* bubbles */}
      {[38, 54, 70, 86, 102].map((x, i) => (
        <circle key={i} cx={x} cy="160" r="2.5" fill="#fff" opacity="0.5">
          <animate attributeName="cy" values={`160;${146 + i % 3 * 3};160`}
            dur={`${0.9 + i * 0.18}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5"
            dur={`${0.9 + i * 0.18}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <text x="78" y="186" textAnchor="middle" fill="#fff" fontSize="6.5"
        fontFamily="monospace" fontWeight="bold">100°C · 3 hrs</text>

      {/* Le-Chatelier mould with spreading needles */}
      <g transform="translate(78,78)">
        {/* cylinder body */}
        <ellipse cx="34" cy="8" rx="20" ry="6" fill="#c0c8d0" stroke="#8090a0" strokeWidth="1.5" />
        <rect x="14" y="8" width="40" height="32" fill="#d0d8e0" stroke="#8090a0" strokeWidth="1.5" />
        <ellipse cx="34" cy="40" rx="20" ry="6" fill="#b0b8c0" stroke="#8090a0" strokeWidth="1.5" />
        <rect x="16" y="10" width="36" height="26" fill="#c8c0b0" opacity="0.8" />

        {/* left needle rotates left */}
        <g style={{
          transformOrigin: "34px 8px", transform: `rotate(${-angle}deg)`,
          transition: "transform 2s cubic-bezier(0.4,0,0.2,1)"
        }}>
          <line x1="34" y1="8" x2="6" y2="-22" stroke={gold2} strokeWidth="2" strokeLinecap="round" />
          <circle cx="6" cy="-22" r="3" fill={gold2} />
        </g>
        {/* right needle rotates right */}
        <g style={{
          transformOrigin: "34px 8px", transform: `rotate(${angle}deg)`,
          transition: "transform 2s cubic-bezier(0.4,0,0.2,1)"
        }}>
          <line x1="34" y1="8" x2="62" y2="-22" stroke={gold2} strokeWidth="2" strokeLinecap="round" />
          <circle cx="62" cy="-22" r="3" fill={gold2} />
        </g>
      </g>

      <text x="130" y="196" textAnchor="middle" fill="rgba(200,220,255,0.45)"
        fontSize="8" fontFamily="sans-serif" fontWeight="600">
        Le-Chatelier · Boiling 3 hrs · IS 4031 Pt 3
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   4. COMPRESSION — Canvas animation
   LEFT: machine only, RIGHT: cube stack
══════════════════════════════════════════════ */
function AnimCompression({ mixId, dayKey, running, onComplete, targetStrength }) {
  const canvasRef = useRef(null);
  const stRef = useRef({ animId: null, phase: 0, phaseStart: null, cracks: [], particles: [] });

  const PHASES = ["lift", "move", "place", "compress", "crack", "done"];
  const DURATIONS = { lift: 700, move: 600, place: 500, compress: 2800, crack: 1000, done: 300 };

  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function genCracks(W, H, cubeX, cubeY, cubeS) {
    const list = [];
    for (let i = 0; i < 18; i++) {
      list.push({
        x: cubeX + 5 + Math.random() * (cubeS - 10), y: cubeY + 5 + Math.random() * (cubeS - 10),
        angle: (Math.random() - 0.5) * 1.6, len: 12 + Math.random() * 25,
        segs: Array.from({ length: 6 }, () => ({ dx: (Math.random() - 0.5) * 12, dy: (Math.random() - 0.3) * 10 })),
      });
    }
    return list;
  }

  function genParticles(cubeX, cubeY, cubeS) {
    const list = [];
    for (let i = 0; i < 35; i++) {
      list.push({
        x: cubeX + cubeS / 2 + (Math.random() - 0.5) * cubeS,
        y: cubeY + cubeS / 2 + (Math.random() - 0.5) * cubeS,
        vx: (Math.random() - 0.5) * 250, vy: (Math.random() - 0.5) * 200 - 80,
        size: Math.random() * 3 + 1, r: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 15,
        color: ["#d0c2a8", "#a09078", "#8a7a6a", "#b8aa90"][Math.floor(Math.random() * 4)]
      });
    }
    return list;
  }

  function draw(prog) {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    const crackP = prog.crack || 0;
    if (crackP > 0 && crackP < 0.4) {
      const intensity = (0.4 - crackP) * 12;
      ctx.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
    }

    const MX = 18, MW = W * 0.52;
    const MH = H * 0.86, MY = H * 0.04;
    const FW = 18;
    const TOP_H = 34, BASE_H = 16;
    const BASE_Y = MY + MH - BASE_H;
    const PLATEN_W = MW - FW * 2 - 6;
    const PLATEN_X = MX + FW + 3;
    const SZ = W * 0.58;
    const CUBE_S = 42;
    const STACK_COUNT = 4;
    const STACK_BASE_Y = BASE_Y;

    const drawCol = (x, w) => {
      const g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, "#1a2840"); g.addColorStop(0.45, "#2e4060"); g.addColorStop(1, "#1a2840");
      ctx.fillStyle = g; rr(ctx, x, MY + TOP_H, w, MH - TOP_H - BASE_H, 4);
    };
    drawCol(MX, FW); drawCol(MX + MW - FW, FW);

    ctx.fillStyle = "rgba(100,150,210,0.1)";
    ctx.fillRect(MX + 3, MY + TOP_H, 4, MH - TOP_H - BASE_H);
    ctx.fillRect(MX + MW - FW + 3, MY + TOP_H, 4, MH - TOP_H - BASE_H);

    for (let i = 0; i < 3; i++) {
      const ty = MY + TOP_H + (MH - TOP_H - BASE_H) * (i + 1) / 4;
      const tg = ctx.createLinearGradient(MX, ty - 3, MX, ty + 3);
      tg.addColorStop(0, "#2a3850"); tg.addColorStop(0.5, "#3a5070"); tg.addColorStop(1, "#2a3850");
      ctx.fillStyle = tg; ctx.fillRect(MX + FW, ty - 3, MW - FW * 2, 6);
      [MX + FW + 3, MX + MW - FW - 3].forEach(bx => {
        ctx.beginPath(); ctx.arc(bx, ty, 4, 0, Math.PI * 2); ctx.fillStyle = "#1a2840"; ctx.fill();
        ctx.beginPath(); ctx.arc(bx, ty, 2.5, 0, Math.PI * 2); ctx.fillStyle = "#4a6080"; ctx.fill();
      });
    }

    const chg = ctx.createLinearGradient(MX - 4, MY, MX - 4, MY + TOP_H);
    chg.addColorStop(0, "#3a5070"); chg.addColorStop(0.5, "#4a6888"); chg.addColorStop(1, "#2a3858");
    ctx.fillStyle = chg; rr(ctx, MX - 4, MY, MW + 8, TOP_H, 5);

    const compP = prog.compress || 0;
    if (compP > 0 && Math.sin(compP * 50) > 0) {
      ctx.beginPath(); ctx.arc(MX + MW + 4, MY - 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ff2222"; ctx.fill();
      ctx.shadowColor = "#ff2222"; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
    } else {
      ctx.beginPath(); ctx.arc(MX + MW + 4, MY - 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#551111"; ctx.fill();
    }

    const finalStrength = targetStrength || 0;
    let displayStrength = 0; let lockColor = "#22ff44";
    if (crackP > 0) { displayStrength = finalStrength; lockColor = "#ff2222"; }
    else if (compP > 0) { displayStrength = finalStrength * Math.pow(compP, 1.2); lockColor = "#ffaa22"; }

    ctx.fillStyle = "#080c12"; rr(ctx, MX + MW / 2 - 32, MY + 4, 64, 20, 3);
    ctx.fillStyle = "#16202c"; rr(ctx, MX + MW / 2 - 30, MY + 6, 60, 16, 2);
    ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
    ctx.fillStyle = (compP === 0) ? "#444" : lockColor;
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = (compP > 0) ? 4 : 0;
    ctx.fillText(compP === 0 ? "READY" : displayStrength.toFixed(1) + " MPa", MX + MW / 2, MY + 17.5);
    ctx.shadowBlur = 0; ctx.textAlign = "left";

    const CYL_W = 38, CYL_H = 44;
    const CYL_X = MX + MW / 2 - CYL_W / 2, CYL_Y = MY + TOP_H;
    const cylG = ctx.createLinearGradient(CYL_X, 0, CYL_X + CYL_W, 0);
    cylG.addColorStop(0, "#1a2840"); cylG.addColorStop(0.35, "#2e4464");
    cylG.addColorStop(0.65, "#3a5878"); cylG.addColorStop(1, "#1a2840");
    ctx.fillStyle = cylG; rr(ctx, CYL_X, CYL_Y, CYL_W, CYL_H, 4);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = "rgba(60,100,150,0.35)"; ctx.fillRect(CYL_X, CYL_Y + 10 + i * 10, CYL_W, 2); }
    ctx.beginPath(); ctx.arc(CYL_X + 7, CYL_Y + 14, 4, 0, Math.PI * 2); ctx.fillStyle = "#0a1828"; ctx.fill();
    ctx.beginPath(); ctx.arc(CYL_X + 7, CYL_Y + 14, 2.5, 0, Math.PI * 2); ctx.fillStyle = gold2; ctx.fill();

    const maxDrop = H * 0.27;
    const rodExt = ease(compP) * maxDrop;
    const ROD_W = 14, ROD_X = MX + MW / 2 - ROD_W / 2;
    if (compP > 0) {
      const rg = ctx.createLinearGradient(ROD_X, 0, ROD_X + ROD_W, 0);
      rg.addColorStop(0, "#2a3850"); rg.addColorStop(0.5, "#4a6888"); rg.addColorStop(1, "#2a3850");
      ctx.fillStyle = rg; ctx.fillRect(ROD_X, CYL_Y + CYL_H, ROD_W, rodExt);
    }
    const PLATEN_H = 18;
    const PLATEN_Y = CYL_Y + CYL_H + rodExt;
    const ug = ctx.createLinearGradient(PLATEN_X, PLATEN_Y, PLATEN_X, PLATEN_Y + PLATEN_H);
    ug.addColorStop(0, "#4a6888"); ug.addColorStop(0.4, "#3a5878"); ug.addColorStop(1, "#1e3050");
    ctx.fillStyle = ug; rr(ctx, PLATEN_X, PLATEN_Y, PLATEN_W, PLATEN_H, 3);
    ctx.fillStyle = "rgba(120,180,255,0.12)"; ctx.fillRect(PLATEN_X + 3, PLATEN_Y + 3, PLATEN_W - 6, 5);
    ctx.beginPath(); ctx.arc(MX + MW / 2, PLATEN_Y + PLATEN_H, 7, 0, Math.PI * 2);
    const bsg = ctx.createRadialGradient(MX + MW / 2 - 2, PLATEN_Y + PLATEN_H - 2, 1, MX + MW / 2, PLATEN_Y + PLATEN_H, 7);
    bsg.addColorStop(0, "#6a8aaa"); bsg.addColorStop(1, "#1e3050");
    ctx.fillStyle = bsg; ctx.fill();

    const bp_Y = BASE_Y - BASE_H;
    const bpg = ctx.createLinearGradient(PLATEN_X, bp_Y, PLATEN_X, bp_Y + BASE_H);
    bpg.addColorStop(0, "#2a3e58"); bpg.addColorStop(0.5, "#3a5272"); bpg.addColorStop(1, "#1a2e48");
    ctx.fillStyle = bpg; rr(ctx, PLATEN_X, bp_Y, PLATEN_W, BASE_H, 3);

    if (compP > 0.12) {
      const ax = PLATEN_X - 14;
      const alpha = Math.min(compP * 2, 0.85);
      ctx.strokeStyle = `rgba(201,162,39,${alpha})`; ctx.lineWidth = 2;
      ctx.fillStyle = `rgba(201,162,39,${alpha})`;
      drawArrow(ctx, ax, PLATEN_Y + PLATEN_H, ax, PLATEN_Y + PLATEN_H + 28);
      drawArrow(ctx, ax, bp_Y, ax, bp_Y - 28);
    }

    const cubeDestX = PLATEN_X + PLATEN_W / 2 - CUBE_S / 2;
    const cubeDestY = bp_Y - CUBE_S;

    for (let i = STACK_COUNT - 1; i >= 0; i--) {
      const skip = i === 0 && ((prog.lift || 0) > 0 || (prog.move || 0) > 0 || (prog.place || 0) > 0 || compP > 0 || crackP > 0);
      if (skip) continue;
      const sy = STACK_BASE_Y - i * (CUBE_S + 3) - CUBE_S;
      drawCube(ctx, SZ, sy, CUBE_S, CUBE_S, 0, false);
    }

    const liftP = prog.lift || 0, moveP = prog.move || 0, placeP = prog.place || 0;
    const inPlay = liftP > 0 || moveP > 0 || placeP > 0 || compP > 0 || crackP > 0;
    if (inPlay) {
      let cx, cy, cw = CUBE_S, ch = CUBE_S;
      const liftH = 70;
      if (moveP === 0 && placeP === 0) { cy = lerp(STACK_BASE_Y - CUBE_S, STACK_BASE_Y - CUBE_S - liftH, ease(liftP)); cx = SZ; }
      else if (placeP === 0) { cy = STACK_BASE_Y - CUBE_S - liftH; cx = lerp(SZ, cubeDestX, ease(moveP)); }
      else { cy = lerp(STACK_BASE_Y - CUBE_S - liftH, cubeDestY, ease(placeP)); cx = cubeDestX; }
      if (compP > 0) { cx = cubeDestX; cy = cubeDestY; }

      const crush = compP > 0 ? Math.min(compP, 0.88) * 14 : 0;
      cw = CUBE_S + crush * 0.3; ch = CUBE_S - crush;
      const cxA = cx - (cw - CUBE_S) / 2;
      drawCube(ctx, cxA, cy + crush, cw, ch, compP, crackP > 0.25);
    }

    if (crackP > 0 && stRef.current.cracks.length > 0) {
      ctx.save();
      for (const cr of stRef.current.cracks) {
        const p = Math.min(crackP * 1.5, 1); if (p <= 0) continue;
        ctx.strokeStyle = `rgba(220,55,35,${0.75 * p})`; ctx.lineWidth = 1.5; ctx.lineCap = "round";
        ctx.beginPath();
        let px = cr.x, py = cr.y; ctx.moveTo(px, py);
        for (let s = 0; s < cr.segs.length; s++) {
          const sp = Math.min(p * cr.segs.length - s, 1); if (sp <= 0) break;
          px += cr.segs[s].dx * sp; py += cr.segs[s].dy * sp; ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    if (crackP > 0 && stRef.current.particles.length > 0) {
      ctx.save();
      const t = crackP;
      for (const p of stRef.current.particles) {
        const px = p.x + p.vx * t;
        const py = p.y + p.vy * t + 0.5 * 400 * t * t;
        ctx.translate(px, py); ctx.rotate(p.r + p.vr * t * 10);
        ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, 1 - Math.pow(t, 2));
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.resetTransform();
      }
      ctx.restore();
    }

    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, BASE_Y + 3); ctx.lineTo(W, BASE_Y + 3); ctx.stroke();
    ctx.restore();
  }

  function drawArrow(ctx, x1, y1, x2, y2) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 7 * Math.cos(a - 0.4), y2 - 7 * Math.sin(a - 0.4));
    ctx.lineTo(x2 - 7 * Math.cos(a + 0.4), y2 - 7 * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  }

  function drawCube(ctx, x, y, w, h, compP, cracked) {
    const d = 12;
    const f1 = cracked ? "#8a7a6a" : "#d0c2a8"; const f2 = cracked ? "#7a6a58" : "#b8aa90"; const f3 = cracked ? "#6a5a48" : "#a09078";
    ctx.fillStyle = f1; rr(ctx, x, y, w, h, 2);
    ctx.fillStyle = f2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * 0.5); ctx.lineTo(x + w + d, y - d * 0.5); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = f3; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.5); ctx.lineTo(x + w + d, y + h - d * 0.5); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 0.5;
    for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + w / 3 * i, y); ctx.lineTo(x + w / 3 * i, y + h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y + h / 3 * i); ctx.lineTo(x + w, y + h / 3 * i); ctx.stroke(); }
    ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.font = "6px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("150mm", x + w / 2, y + h / 2 + 2);
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 0.8; ctx.strokeRect(x, y, w, h);
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath(); ctx.fill();
  }

  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; draw({ lift: 0, move: 0, place: 0, compress: 0, crack: 0 }); }, []);

  useEffect(() => {
    if (!running || !mixId || !dayKey) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const st = stRef.current; st.phase = 0; st.phaseStart = null;
    const cubeDestX = canvas.width * 0.25; const cubeDestY = canvas.height * 0.86 - 16 - 42;
    st.cracks = genCracks(canvas.width, canvas.height, cubeDestX, cubeDestY, 42);
    st.particles = genParticles(cubeDestX, cubeDestY, 42);
    if (st.animId) cancelAnimationFrame(st.animId);

    const prog = { lift: 0, move: 0, place: 0, compress: 0, crack: 0 };

    function frame(ts) {
      if (!st.phaseStart) st.phaseStart = ts;
      const phase = PHASES[st.phase]; const elapsed = ts - st.phaseStart;
      const t = Math.min(elapsed / DURATIONS[phase], 1);

      if (phase === "lift") prog.lift = t; else if (phase === "move") prog.move = t; else if (phase === "place") prog.place = t; else if (phase === "compress") prog.compress = t; else if (phase === "crack") prog.crack = t;
      draw(prog);

      if (t >= 1) {
        st.phase++; st.phaseStart = ts;
        if (st.phase >= PHASES.length) { onComplete && onComplete(); return; }
      }
      st.animId = requestAnimationFrame(frame);
    }
    st.animId = requestAnimationFrame(frame);
    return () => { if (st.animId) cancelAnimationFrame(st.animId); };
  }, [running]);

  return <canvas ref={canvasRef} width={340} height={240} style={{ width: "100%", height: "100%", display: "block" }} />;
}

/* ── DYNAMIC BAR CHART ── */
function SimpleBarChart({ testId, grind, day }) {
  let data = [];
  let title = "";
  let showLegend = false;
  let label1 = "", label2 = "";
  let color1 = teal, color2 = gold2;

  MIXES.forEach(m => {
    if (testId === "vicat") {
      title = `Standard Consistency — ${grind} Grind`;
      data.push({ label: m.id, val1: CONSISTENCY_W[grind][m.id] });
    } else if (testId === "setting") {
      title = `Setting Time — ${grind} Grind`;
      showLegend = true; label1 = "Initial (min)"; label2 = "Final (min)";
      data.push({ label: m.id, val1: INIT_SET[grind][m.id], val2: FINAL_SET[grind][m.id] });
    } else if (testId === "soundness") {
      title = `Soundness Expansion — ${grind} Grind`;
      data.push({ label: m.id, val1: SOUNDNESS[grind][m.id] });
    } else if (testId === "strength") {
      title = `Strength Activity Index (${day} Days) — ${grind} Grind`;
      const base = STRENGTH[grind]["M0"][`d${day}`];
      data.push({ label: m.id, val1: Number(((STRENGTH[grind][m.id][`d${day}`] / base) * 100).toFixed(1)) });
    }
  });

  const maxVal = Math.max(...data.map(d => Math.max(d.val1, d.val2 || 0))) * 1.2;

  return (
    <div style={{ padding: "1.5rem", height: 360, display: "flex", flexDirection: "column", background: "#fff", borderRadius: 16 }}>
      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: navy, marginBottom: "2.5rem", fontFamily: "'Playfair Display',serif", textAlign: "center" }}>{title}</div>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", borderBottom: `2px solid ${border}`, paddingBottom: "1rem", gap: "2%" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", justifyContent: "center", gap: "4px", height: "100%", alignItems: "flex-end" }}>
            <div style={{ width: d.val2 !== undefined ? "45%" : "65%", height: `${(d.val1 / maxVal) * 100}%`, background: color1, borderRadius: "4px 4px 0 0", position: "relative", transition: "height 0.4s ease" }}>
              <span style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", fontSize: "0.75rem", fontWeight: 700, color: navy, fontFamily: "'DM Mono',monospace" }}>{d.val1}</span>
            </div>
            {d.val2 !== undefined && (
              <div style={{ width: "45%", height: `${(d.val2 / maxVal) * 100}%`, background: color2, borderRadius: "4px 4px 0 0", position: "relative", transition: "height 0.4s ease" }}>
                <span style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", fontSize: "0.75rem", fontWeight: 700, color: navy, fontFamily: "'DM Mono',monospace" }}>{d.val2}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "2%", marginTop: "0.8rem" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: muted, fontFamily: "'DM Mono',monospace" }}>{d.label}</div>
        ))}
      </div>
      {showLegend && (
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: 14, height: 14, background: color1, borderRadius: 3 }} /><span style={{ fontSize: "0.8rem", fontWeight: 600, color: navy }}>{label1}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: 14, height: 14, background: color2, borderRadius: 3 }} /><span style={{ fontSize: "0.8rem", fontWeight: 600, color: navy }}>{label2}</span></div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   GENERIC TEST CARD (consistency / setting / soundness)
══════════════════════════════════════════════ */
function TestCard({ test, index, open, onToggle }) {
  const cardRef = useRef(null);
  const [mix, setMix] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [grind, setGrind] = useState(90);

  useEffect(() => {
    if (open && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 150);
    }
  }, [open]);

  function selectMix(id) {
    setMix(id);
    setShowResult(false);
    setAnimKey(k => k + 1);  // restart animation
  }

  /* pull result values for chosen mix */
  function getResult() {
    if (!mix) return null;
    if (test.id === "vicat") return {
      value: `${CONSISTENCY_W[grind][mix]}%`,
      label: "Water for std. consistency",
      limit: "26–45%",
      pass: CONSISTENCY_W[grind][mix] >= 26 && CONSISTENCY_W[grind][mix] <= 45,
    };
    if (test.id === "setting") return {
      value: `Initial: ${INIT_SET[grind][mix]} min · Final: ${FINAL_SET[grind][mix]} min`,
      label: "Setting time",
      limit: "Initial ≥ 30 min · Final ≤ 600 min",
      pass: INIT_SET[grind][mix] >= 30 && FINAL_SET[grind][mix] <= 600,
    };
    if (test.id === "soundness") return {
      value: `${SOUNDNESS[grind][mix]} mm`,
      label: "Expansion (Le-Chatelier)",
      limit: "≤ 10 mm",
      pass: SOUNDNESS[grind][mix] <= 10,
    };
    return null;
  }
  const result = mix ? getResult() : null;

  const AnimComp = {
    vicat: (p) => <AnimVicat key={animKey} mixId={p.mixId} onDone={p.onDone} />,
    setting: (p) => <AnimSettingTime key={animKey} mixId={p.mixId} onDone={p.onDone} />,
    soundness: (p) => <AnimLeChatelier key={animKey} mixId={p.mixId} grind={grind} onDone={p.onDone} />,
  }[test.id];

  return (
    <div ref={cardRef} style={{
      background: "#fff", border: `1px solid ${border}`, borderRadius: 14,
      overflow: "hidden", transition: "box-shadow 0.2s",
      boxShadow: open ? "0 6px 32px rgba(15,35,64,0.13)" : "none"
    }}>

      <button onClick={onToggle}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          textAlign: "left", padding: "1rem 1.3rem", display: "flex", alignItems: "center", gap: "1rem"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(15,35,64,0.02)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: open ? navy : "rgba(15,35,64,0.06)",
          color: open ? "#fff" : navy3, display: "flex", alignItems: "center",
          justifyContent: "center", fontFamily: "'DM Mono',monospace",
          fontSize: "0.8rem", fontWeight: 700, flexShrink: 0, transition: "all 0.2s"
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{test.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Playfair Display',serif", fontSize: "1rem",
            fontWeight: 700, color: "#0f1b2d", marginBottom: "0.15rem"
          }}>{test.name}</div>
          <div style={{ fontSize: "0.73rem", color: muted }}>{test.subtitle}</div>
        </div>
        <span style={{
          background: navy3, color: "#fff", fontFamily: "'DM Mono',monospace",
          fontSize: "0.62rem", fontWeight: 600, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap"
        }}>
          {test.standard}
        </span>
        {(test.id === "vicat" || test.id === "setting" || test.id === "soundness") && (
          <span style={{ background: "rgba(201,162,39,0.12)", color: gold2, fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, fontFamily: "monospace", whiteSpace: "nowrap", marginLeft: 4 }}>🎬 VIDEO</span>
        )}
        <span style={{
          fontSize: "0.7rem", color: muted, flexShrink: 0,
          transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s", marginLeft: "0.5rem"
        }}>▼</span>
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${border}`, animation: "fadeDown 0.25s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 300 }}>

            {/* LEFT — dark animation / video panel */}
            <div style={{
              background: (test.id === "vicat" || test.id === "setting" || test.id === "soundness")
                ? "linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 100%)"
                : "linear-gradient(160deg,#0c1c30 0%,#172d4e 100%)",
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: (test.id === "vicat" || test.id === "setting" || test.id === "soundness") ? "0" : "1.2rem 1rem 1rem",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              position: "relative", overflow: "hidden",
            }}>
              {test.id === "vicat" || test.id === "setting" || test.id === "soundness" ? (
                <div style={{ width: "100%", height: "100%", minHeight: 300, maxHeight: 550 }}>
                  <VideoPlayer
                    isOpen={open}
                    src={test.id === "vicat" ? "/Tanvi 1.mp4" : test.id === "setting" ? "/Kaveri 2.mp4" : "/Kedar 3.mp4"}
                    title={test.id === "vicat" ? "Standard Consistency" : test.id === "setting" ? "Setting Time" : "Soundness"}
                  />
                </div>
              ) : (
                <>
                  <div style={{
                    fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.14em", color: gold2, marginBottom: "0.55rem", alignSelf: "flex-start"
                  }}>
                    🧪 Select mix → watch animation
                  </div>

                  {/* MIX SELECTOR */}
                  <div style={{ width: "100%", marginBottom: "0.6rem" }}>
                    <MixSelector selected={mix} onChange={selectMix} />
                  </div>

                  {/* Animation */}
                  <div style={{ width: "100%", flex: 1, minHeight: 160 }}>
                    {mix
                      ? AnimComp({ mixId: mix, onDone: () => setShowResult(true) })
                      : (
                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          height: "100%", color: "rgba(255,255,255,0.3)", fontSize: "0.78rem",
                          fontFamily: "'DM Mono',monospace", textAlign: "center", padding: "2rem"
                        }}>
                          ← Select a mix above<br />to start simulation
                        </div>
                      )
                    }
                  </div>

                  {/* Result below animation */}
                  {showResult && result && (
                    <div style={{
                      width: "100%", marginTop: "0.7rem",
                      padding: "0.6rem 0.9rem",
                      background: result.pass ? "rgba(13,143,111,0.18)" : "rgba(107,18,18,0.2)",
                      borderRadius: 8,
                      borderLeft: `3px solid ${result.pass ? teal : red}`,
                      animation: "fadeDown 0.3s ease"
                    }}>
                      <div style={{
                        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                        textTransform: "uppercase", color: result.pass ? teal : red, marginBottom: 3
                      }}>
                        {result.label}
                      </div>
                      <div style={{
                        fontFamily: "'DM Mono',monospace", fontSize: "1rem",
                        fontWeight: 700, color: result.pass ? teal : red
                      }}>
                        {result.value}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                        Limit: {result.limit} · {mix}
                        &nbsp;·&nbsp;
                        <span style={{ color: result.pass ? teal : red, fontWeight: 700 }}>
                          {result.pass ? "✓ Pass" : "✗ Fail"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{
                    marginTop: "0.7rem", padding: "0.5rem 0.75rem",
                    background: "rgba(201,162,39,0.08)", borderRadius: 7,
                    borderLeft: `3px solid ${gold2}`, fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.65)", lineHeight: 1.55, width: "100%"
                  }}>
                    {test.purpose}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT — procedure + results table */}
            <div style={{ padding: "1.3rem 1.4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div style={{
                    fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.1em", color: muted
                  }}>All-mix Results</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(15,35,64,0.04)", padding: "3px", borderRadius: 8, border: `1px solid ${border}` }}>
                    {[60, 90].map(g => (
                      <button
                        key={g}
                        onClick={() => { setGrind(g); setShowResult(false); setAnimKey(k => k + 1); }}
                        style={{
                          padding: "3px 8px", border: "none", borderRadius: 6,
                          background: grind === g ? gold2 : "transparent",
                          color: grind === g ? "#fff" : muted,
                          fontSize: "0.65rem", fontWeight: 700, cursor: "pointer",
                          transition: "all 0.2s", fontFamily: "'DM Mono', monospace"
                        }}
                      >
                        {g} Grind
                      </button>
                    ))}
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                  <thead>
                    <tr>{["Mix", "Value", "Limit", "Status"].map(h => (
                      <th key={h} style={{
                        background: "rgba(15,35,64,0.04)",
                        padding: "0.35rem 0.5rem", textAlign: "left", fontSize: "0.58rem",
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                        color: muted, borderBottom: `1px solid ${border}`
                      }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {MIXES.map((m, i, arr) => {
                      let val = ""; let pass = true; let limit = "";
                      if (test.id === "vicat") {
                        val = `${CONSISTENCY_W[grind][m.id]}%`; limit = "26–45%"; pass = CONSISTENCY_W[grind][m.id] <= 45;
                      } else if (test.id === "setting") {
                        val = `${INIT_SET[grind][m.id]} min / ${FINAL_SET[grind][m.id]} min`; limit = "≥30 / ≤600"; pass = INIT_SET[grind][m.id] >= 30 && FINAL_SET[grind][m.id] <= 600;
                      } else if (test.id === "soundness") {
                        val = `${SOUNDNESS[grind][m.id]} mm`; limit = "≤ 10 mm"; pass = SOUNDNESS[grind][m.id] <= 10;
                      }
                      return (
                        <tr key={i} style={{
                          background: mix === m.id
                            ? (pass ? "rgba(13,143,111,0.07)" : "rgba(107,18,18,0.05)")
                            : i % 2 === 0 ? "#fff" : "rgba(15,35,64,0.015)",
                          transition: "background 0.3s",
                        }}>
                          <td style={{
                            padding: "0.38rem 0.5rem", fontWeight: 600,
                            color: mix === m.id ? navy : "#0f1b2d",
                            borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none"
                          }}>
                            {m.label}
                          </td>
                          <td style={{
                            padding: "0.38rem 0.5rem", fontFamily: "'DM Mono',monospace",
                            fontWeight: 700, color: mix === m.id ? gold2 : navy3,
                            borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none"
                          }}>
                            {val}
                          </td>
                          <td style={{
                            padding: "0.38rem 0.5rem", fontFamily: "'DM Mono',monospace",
                            color: muted, fontSize: "0.68rem",
                            borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none"
                          }}>
                            {limit}
                          </td>
                          <td style={{
                            padding: "0.38rem 0.5rem",
                            borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none"
                          }}>
                            <StatusBadge status={pass ? "pass" : "fail"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ marginTop: "1rem" }}>
                  <button onClick={() => setShowGraphModal(true)} style={{ background: navy, color: "#fff", borderRadius: 8, padding: "0.45rem 1.1rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", border: "none", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(15,35,64,0.15)" }}>
                    📈 Generate Graph
                  </button>
                  {showGraphModal && (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15,35,64,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "2rem" }}>
                      <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", maxWidth: "900px", width: "100%", position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", animation: "fadeDown 0.25s ease-out" }}>
                        <button onClick={() => setShowGraphModal(false)} style={{ position: "absolute", top: "1.2rem", right: "1.2rem", background: "rgba(15,35,64,0.06)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold", color: navy, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(15,35,64,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(15,35,64,0.06)"}>✕</button>
                        <SimpleBarChart testId={test.id} grind={grind} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.1em", color: muted, marginBottom: "0.45rem"
                }}>Procedure</div>
                <ol style={{
                  margin: 0, paddingLeft: "1.1rem", display: "flex",
                  flexDirection: "column", gap: "0.28rem"
                }}>
                  {test.procedure.map((step, i) => (
                    <li key={i} style={{ fontSize: "0.74rem", color: "#0f1b2d", lineHeight: 1.55 }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div style={{
                fontSize: "0.65rem", color: muted, fontFamily: "'DM Mono',monospace",
                marginTop: "auto", paddingTop: "0.5rem", borderTop: `1px solid ${border}`
              }}>
                📋 {test.clause}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMPRESSION TEST CARD (special)
══════════════════════════════════════════════ */
function StrengthCard({ index, open, onToggle }) {
  const cardRef = useRef(null);
  const [leftTab, setLeftTab] = useState("video");
  const [mix, setMix] = useState(null);

  useEffect(() => {
    if (open && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 150);
    }
  }, [open]);
  const [day, setDay] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("Select a mix and testing day to begin");
  const [grind, setGrind] = useState(90);
  const [showGraphModal, setShowGraphModal] = useState(false);

  function selectMix(id) { setMix(id); setResult(null); setRunning(false); }

  function startTest() {
    if (!mix || !day || running) return;
    setResult(null); setRunning(false);
    setStatus("Cube lifted from stack — test in progress...");
    setTimeout(() => setRunning(true), 60);
  }

  function handleComplete() {
    const val = STRENGTH[grind][mix][day === "7" ? "d7" : "d28"];
    const base = STRENGTH[grind]["M0"][day === "7" ? "d7" : "d28"];
    const sai = (val / base) * 100;
    setResult(sai.toFixed(1));
    setRunning(false);
    setStatus("Strength Activity Index test completed.");
  }

  const expected = 75; // ASTM C311/IS 3812 limit is min 75%
  const pass = result ? parseFloat(result) >= expected : null;

  return (
    <div ref={cardRef} style={{
      background: "#fff", border: `1px solid ${border}`, borderRadius: 14,
      overflow: "hidden", transition: "box-shadow 0.2s",
      boxShadow: open ? "0 6px 32px rgba(15,35,64,0.13)" : "none"
    }}>

      <button onClick={onToggle}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          textAlign: "left", padding: "1rem 1.3rem", display: "flex", alignItems: "center", gap: "1rem"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(15,35,64,0.02)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: open ? navy : "rgba(15,35,64,0.06)", color: open ? "#fff" : navy3,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Mono',monospace", fontSize: "0.8rem", fontWeight: 700,
          flexShrink: 0, transition: "all 0.2s"
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>🏗️</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Playfair Display',serif", fontSize: "1rem",
            fontWeight: 700, color: "#0f1b2d", marginBottom: "0.15rem"
          }}>
            Strength Activity Index
          </div>
          <div style={{ fontSize: "0.73rem", color: muted }}>Cube casting · Blended vs Control · 7-day & 28-day</div>
        </div>
        <span style={{
          background: navy3, color: "#fff", fontFamily: "'DM Mono',monospace",
          fontSize: "0.62rem", fontWeight: 600, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap"
        }}>
          IS 4031 Pt 6
        </span>
        <span style={{ background: "rgba(201,162,39,0.12)", color: gold2, fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, fontFamily: "monospace", whiteSpace: "nowrap", marginLeft: 4 }}>🎬 VIDEO</span>
        <span style={{
          fontSize: "0.7rem", color: muted, flexShrink: 0,
          transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s", marginLeft: "0.5rem"
        }}>▼</span>
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${border}`, animation: "fadeDown 0.25s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 420 }}>

            {/* LEFT — Video / Simulation tab panel */}
            <div style={{
              background: "linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 100%)",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              display: "flex", flexDirection: "column",
            }}>
              {/* TAB BAR */}
              <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
                {[
                  { key: "video", label: "🎬 Video" },
                  { key: "sim", label: "🏗️ Simulation" },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setLeftTab(tab.key)}
                    style={{
                      flex: 1, padding: "0.65rem 0.5rem",
                      background: leftTab === tab.key ? "rgba(201,162,39,0.12)" : "transparent",
                      border: "none", borderBottom: leftTab === tab.key ? `2.5px solid ${gold2}` : "2.5px solid transparent",
                      color: leftTab === tab.key ? gold2 : "rgba(255,255,255,0.4)",
                      fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
                      fontFamily: "'DM Mono',monospace", letterSpacing: "0.04em",
                      transition: "all 0.18s",
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* VIDEO PANEL */}
              {leftTab === "video" && (
                <div style={{ flex: 1, minHeight: 320 }}>
                  <VideoPlayer isOpen={open} src="/Aniket 3.mp4" title="Strength Activity Index" />
                </div>
              )}

              {/* SIMULATION PANEL */}
              {leftTab === "sim" && (
                <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column" }}>
                  <div style={{
                    fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.14em", color: gold2, marginBottom: "0.55rem"
                  }}>
                    🏗️ Compression Test Simulator
                  </div>

                  <MixSelector selected={mix} onChange={selectMix} />

                  <div style={{ display: "flex", gap: 6, marginBottom: "0.8rem" }}>
                    {["7", "28"].map(d => (
                      <button key={d} onClick={() => { setDay(d); setResult(null); }}
                        style={{
                          padding: "4px 14px", fontSize: "0.72rem", fontWeight: 700,
                          borderRadius: 20, cursor: "pointer",
                          border: `1.5px solid ${day === d ? gold2 : border}`,
                          background: day === d ? "rgba(201,162,39,0.15)" : "transparent",
                          color: day === d ? gold2 : "rgba(255,255,255,0.5)",
                          fontFamily: "'DM Mono',monospace", transition: "all 0.15s"
                        }}>
                        {d}-day
                      </button>
                    ))}
                  </div>

                  <div style={{ flex: 1, minHeight: 180, background: "rgba(0,0,0,0.2)", borderRadius: 8, overflow: "hidden" }}>
                    <AnimCompression
                      mixId={mix} dayKey={day} running={running}
                      targetStrength={expected}
                      onComplete={handleComplete} />
                  </div>

                  <div style={{
                    fontSize: "0.68rem", color: "rgba(255,255,255,0.4)",
                    fontFamily: "'DM Mono',monospace", marginTop: "0.5rem", textAlign: "center"
                  }}>
                    {status}
                  </div>

                  <button onClick={startTest} disabled={!mix || !day || running}
                    style={{
                      marginTop: "0.6rem", padding: "0.6rem", fontSize: "0.76rem", fontWeight: 700,
                      borderRadius: 8, cursor: (!mix || !day || running) ? "not-allowed" : "pointer",
                      border: `1.5px solid ${(!mix || !day || running) ? border : gold2}`,
                      background: running ? "rgba(201,162,39,0.05)" : (!mix || !day) ? "transparent" : "rgba(201,162,39,0.15)",
                      color: running ? muted : (!mix || !day) ? "rgba(255,255,255,0.3)" : gold2,
                      transition: "all 0.15s", letterSpacing: "0.03em"
                    }}>
                    {running ? "Test in progress…" : result ? "Run New Test ↗" : "▶ Run Compression Test"}
                  </button>

                  {result && (
                    <div style={{
                      marginTop: "0.7rem", padding: "0.75rem 1rem",
                      background: pass ? "rgba(13,143,111,0.2)" : "rgba(107,18,18,0.2)",
                      borderRadius: 9, borderLeft: `3px solid ${pass ? teal : red}`,
                      animation: "fadeDown 0.3s ease"
                    }}>
                      <div style={{
                        fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.1em", color: pass ? teal : red, marginBottom: 3
                      }}>
                        Strength Activity Index — {mix} · {day}-day
                      </div>
                      <div style={{
                        fontFamily: "'DM Mono',monospace", fontSize: "1.5rem",
                        fontWeight: 700, color: pass ? teal : red
                      }}>
                        {result} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>%</span>
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", marginTop: 3 }}>
                        Expected ≥ {expected}%
                        &nbsp;·&nbsp;
                        <span style={{ fontWeight: 700, color: pass ? teal : red }}>
                          {pass ? "✓ Pass" : "✗ Fail"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT — results table + procedure */}
            <div style={{ padding: "1.3rem 1.4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div style={{
                    fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.1em", color: muted
                  }}>
                    Strength Activity Index Results (%)
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(15,35,64,0.04)", padding: "3px", borderRadius: 8, border: `1px solid ${border}` }}>
                    {[60, 90].map(g => (
                      <button
                        key={g}
                        onClick={() => { setGrind(g); setResult(null); setRunning(false); }}
                        style={{
                          padding: "3px 8px", border: "none", borderRadius: 6,
                          background: grind === g ? gold2 : "transparent",
                          color: grind === g ? "#fff" : muted,
                          fontSize: "0.65rem", fontWeight: 700, cursor: "pointer",
                          transition: "all 0.2s", fontFamily: "'DM Mono', monospace"
                        }}
                      >
                        {g} Grind
                      </button>
                    ))}
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                  <thead>
                    <tr>{["Mix", "7-day (%)", "28-day (%)", "Status"].map(h => (
                      <th key={h} style={{
                        background: "rgba(15,35,64,0.04)",
                        padding: "0.35rem 0.5rem", textAlign: "left", fontSize: "0.58rem",
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                        color: muted, borderBottom: `1px solid ${border}`
                      }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {Object.entries(STRENGTH[grind]).map(([m, v], i, arr) => (
                      <tr key={m} style={{
                        background: mix === m ? "rgba(13,143,111,0.06)" : i % 2 === 0 ? "#fff" : "rgba(15,35,64,0.015)",
                        transition: "background 0.3s",
                      }}>
                        <td style={{
                          padding: "0.38rem 0.5rem", fontWeight: 700,
                          color: mix === m ? navy : "#0f1b2d",
                          borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none"
                        }}>{m}</td>
                        <td style={{
                          padding: "0.38rem 0.5rem", fontFamily: "'DM Mono',monospace",
                          color: muted, fontWeight: 600,
                          borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none"
                        }}>
                          {((v.d7 / STRENGTH[grind]['M0'].d7) * 100).toFixed(1)}
                        </td>
                        <td style={{
                          padding: "0.38rem 0.5rem", fontFamily: "'DM Mono',monospace",
                          color: muted, fontWeight: 600,
                          borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none"
                        }}>
                          {((v.d28 / STRENGTH[grind]['M0'].d28) * 100).toFixed(1)}
                        </td>
                        <td style={{
                          padding: "0.38rem 0.5rem",
                          borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none"
                        }}>
                          <StatusBadge status={((v.d28 / STRENGTH[grind]['M0'].d28) * 100) >= 75 ? "pass" : "fail"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: "1rem" }}>
                  <button onClick={() => setShowGraphModal(true)} style={{ background: navy, color: "#fff", borderRadius: 8, padding: "0.45rem 1.1rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", border: "none", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(15,35,64,0.15)" }}>
                    📈 Generate Graph
                  </button>
                  {showGraphModal && (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15,35,64,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "2rem" }}>
                      <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", maxWidth: "900px", width: "100%", position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", animation: "fadeDown 0.25s ease-out" }}>
                        <button onClick={() => setShowGraphModal(false)} style={{ position: "absolute", top: "1.2rem", right: "1.2rem", background: "rgba(15,35,64,0.06)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold", color: navy, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(15,35,64,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(15,35,64,0.06)"}>✕</button>
                        <SimpleBarChart testId="strength" grind={grind} day={day || "7"} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.1em", color: muted, marginBottom: "0.45rem"
                }}>Procedure</div>
                <ol style={{
                  margin: 0, paddingLeft: "1.1rem", display: "flex",
                  flexDirection: "column", gap: "0.28rem"
                }}>
                  {[
                    "Prepare 150×150×150 mm cube moulds; apply mould release oil.",
                    "Cast concrete in 3 layers; tamp 35 times per layer with tamping rod.",
                    "Level surface; mark mix designation and cast date.",
                    "Demould after 24 hrs; cure in water at 27°C ± 2°C.",
                    "Test at 7, 28, and 56 days in CTM; apply load at 14 N/mm²/min.",
                    "SAI (%) = (Blended strength ÷ OPC strength) × 100",
                  ].map((step, i) => (
                    <li key={i} style={{ fontSize: "0.74rem", color: "#0f1b2d", lineHeight: 1.55 }}>{step}</li>
                  ))}
                </ol>
              </div>
              <div style={{
                fontSize: "0.65rem", color: muted, fontFamily: "'DM Mono',monospace",
                marginTop: "auto", paddingTop: "0.5rem", borderTop: `1px solid ${border}`
              }}>
                📋 IS 4031 (Part 6) : 1988 · IS 516 : 1959 · ASTM C311
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── STATUS BADGE ── */
function StatusBadge({ status }) {
  const map = {
    pass: { bg: "#e3f9f0", color: teal, label: "✓ Pass" },
    warn: { bg: "#fff8e6", color: gold2, label: "⚠ Warn" },
    fail: { bg: "#fdeaea", color: red, label: "✗ Fail" },
    ref: { bg: "#f0f4f8", color: navy3, label: "— Ref." },
  };
  const s = map[status] || map.ref;
  return <span style={{
    background: s.bg, color: s.color, fontSize: "0.65rem", fontWeight: 700,
    padding: "2px 8px", borderRadius: 20, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap"
  }}>
    {s.label}
  </span>;
}

/* ── TEST DATA (with mixId for row highlighting) ── */
const PHYSICAL_TESTS = [
  {
    id: "vicat", icon: "⚖️", name: "Standard Consistency", subtitle: "Vicat test",
    standard: "IS 4031 Part 4",
    purpose: "Determines the water content for standard paste consistency — reference w/c for all subsequent Vicat tests.",
    procedure: [
      "Prepare 400 g cement paste with trial water content (26–33%).",
      "Fill Vicat mould in 3–4 layers; smooth surface flush.",
      "Lower 10 mm dia plunger gently onto paste surface.",
      "Release and record penetration after 30 s.",
      "Standard consistency = water% when needle stops 5–7 mm from bottom.",
    ],
    results: [
      { mixId: "M0", material: "M0 — OPC", value: "28%", limit: "26–33%", status: "pass" },
      { mixId: "M1", material: "M1 — SLA10·TLA3·IFA2", value: "29%", limit: "26–33%", status: "pass" },
      { mixId: "M2", material: "M2 — SLA10·TLA5·IFA5", value: "30%", limit: "26–33%", status: "pass" },
      { mixId: "M3", material: "M3 — SLA15·TLA5·IFA5", value: "31%", limit: "26–33%", status: "pass" },
      { mixId: "M4", material: "M4 — SLA20·TLA5·IFA5", value: "32%", limit: "26–33%", status: "pass" },
      { mixId: "M5", material: "M5 — SLA25·TLA5·IFA5", value: "33%", limit: "26–33%", status: "pass" },
    ],
    clause: "IS 4031 (Part 4) : 1988 · IS 269 : 2015",
  },
  {
    id: "setting", icon: "⏱️", name: "Setting Time", subtitle: "Initial & Final",
    standard: "IS 4031 Part 5",
    purpose: "Initial set ≥ 30 min (workability window). Final set ≤ 600 min ensures timely strength gain.",
    procedure: [
      "Prepare paste at standard consistency water content.",
      "Fill Vicat mould; start timer immediately.",
      "Use 1 mm square needle; test every 5 min initially.",
      "Initial set = needle stops 5 mm from bottom.",
      "Final set = needle makes impression but annular attachment leaves no mark.",
    ],
    results: [
      { mixId: "M0", material: "M0 — Initial / Final", value: "35 min / 280 min", limit: "≥30 / ≤600", status: "pass" },
      { mixId: "M1", material: "M1 — Initial / Final", value: "42 min / 320 min", limit: "≥30 / ≤600", status: "pass" },
      { mixId: "M2", material: "M2 — Initial / Final", value: "44 min / 340 min", limit: "≥30 / ≤600", status: "pass" },
      { mixId: "M3", material: "M3 — Initial / Final", value: "47 min / 360 min", limit: "≥30 / ≤600", status: "pass" },
      { mixId: "M4", material: "M4 — Initial / Final", value: "52 min / 390 min", limit: "≥30 / ≤600", status: "pass" },
      { mixId: "M5", material: "M5 — Initial / Final", value: "58 min / 420 min", limit: "≥30 / ≤600", status: "pass" },
    ],
    clause: "IS 4031 (Part 5) : 1988 · IS 8112 : 2013",
  },
  {
    id: "soundness", icon: "🔊", name: "Soundness", subtitle: "Le-Chatelier",
    standard: "IS 4031 Part 3",
    purpose: "Detects unsound expansion from free lime or MgO. Expansion > 10 mm indicates risk of concrete disintegration.",
    procedure: [
      "Prepare paste at standard consistency; fill Le-Chatelier mould on glass.",
      "Cover with glass; place in water at 27°C for 24 hrs.",
      "Measure initial distance between indicator pins (d₁).",
      "Boil in water for 3 hours; cool to room temperature.",
      "Measure final distance (d₂). Expansion = d₂ − d₁ (limit ≤ 10 mm).",
    ],
    results: [
      { mixId: "M0", material: "M0 — OPC", value: "1.2 mm", limit: "≤ 10 mm", status: "pass" },
      { mixId: "M1", material: "M1 — SLA10·TLA3·IFA2", value: "2.1 mm", limit: "≤ 10 mm", status: "pass" },
      { mixId: "M2", material: "M2 — SLA10·TLA5·IFA5", value: "1.8 mm", limit: "≤ 10 mm", status: "pass" },
      { mixId: "M3", material: "M3 — SLA15·TLA5·IFA5", value: "2.5 mm", limit: "≤ 10 mm", status: "pass" },
      { mixId: "M4", material: "M4 — SLA20·TLA5·IFA5", value: "2.8 mm", limit: "≤ 10 mm", status: "pass" },
      { mixId: "M5", material: "M5 — SLA25·TLA5·IFA5", value: "3.1 mm", limit: "≤ 10 mm", status: "pass" },
    ],
    clause: "IS 4031 (Part 3) : 1988 · IS 269 : 2015, Cl. 5.2.4",
  },
];

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function Physical() {
  const [activeTestId, setActiveTestId] = useState(null);
  return (
    <>
      <style>{`
        @keyframes fadeDown { from { opacity:0;transform:translateY(-6px); } to { opacity:1;transform:translateY(0); } }
        @media (max-width:720px) { .phys-split { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ background: bg, minHeight: "100vh", paddingBottom: "4rem" }}>

        {/* Header */}
        <div style={{
          background: "#fff", borderBottom: `1px solid ${border}`,
          padding: "2rem 2.5rem 0", textAlign: "left"
        }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <div style={{
              fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.14em", color: red, marginBottom: "0.4rem"
            }}>
              IS 4031 PARTS 3,4,5,6 · IS 516 · ASTM C311
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display',serif", fontSize: "2rem",
              fontWeight: 800, color: "#0f1e30", margin: "0 0 0.4rem"
            }}>
              Physical <span style={{ color: red }}>Testing</span>
            </h1>
            <p style={{
              fontSize: "0.85rem", color: muted, margin: "0 0 1.5rem",
              maxWidth: 620, lineHeight: 1.65
            }}>
              Select a mix (M0–M5) inside each test to watch the lab simulation and highlight that mix's result.
            </p>
            <div style={{ display: "flex", borderBottom: `1px solid ${border}`, gap: 4 }}>
              <div style={{
                padding: "0.7rem 1.6rem", fontSize: "0.82rem", fontWeight: 700,
                background: navy, color: "#fff",
                borderBottom: `3px solid ${gold2}`,
                borderRadius: "8px 8px 0 0", marginBottom: -1, letterSpacing: "0.02em"
              }}>
                🏗️ Physical Tests
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "2rem 2.5rem" }}>
          <div style={{ animation: "fadeDown 0.2s ease" }}>
            {/* Section divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <span style={{
                fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.12em", color: navy3
              }}>Click a test to expand</span>
              <div style={{ flex: 1, height: 1, background: border }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {PHYSICAL_TESTS.map((test, i) => (
                <TestCard key={test.id} test={test} index={i} open={activeTestId === test.id} onToggle={() => setActiveTestId(activeTestId === test.id ? null : test.id)} />
              ))}
              <StrengthCard index={PHYSICAL_TESTS.length} open={activeTestId === "strength"} onToggle={() => setActiveTestId(activeTestId === "strength" ? null : "strength")} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}