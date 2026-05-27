import { motion, useAnimation, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

const C = {
    navy: "#0f2340", navy3: "#1e3a5f",
    gold: "#9a7820", gold2: "#c9a227",
    bg: "#f5f3ef", text: "#0f1b2d", muted: "#4a5468"
};

/* ── TEAM DATA ── */
const TEAM = [
    {
        role: "Project Guide", name: "Mr. A. A. Magdum",
        bio: "Guiding the research on sustainable concrete and providing expert oversight on IS code compliance. A mentor whose precision and knowledge shaped every step of this journey.",
        photo: "/Guide.png", photoFlip: "/Guide 1 (2).png",
        superName: "The Mentor", color: "#c9a227",
        objectPosition: "center top",
        audio: "/Guide.mp3"
    },
    {
        role: "Student Researcher", name: "Tanvi Patil",
        bio: "In the world where structures define the future, there stands a master of balance — Tanvi.\n\nWith precision in her hands and vision in her mind, she blends cement, ash, and innovation into one powerful force.\n\nLike an alchemist of modern engineering, she knows that strength is not created… it is crafted.\n\nEvery mix she prepares carries the potential of stronger, more sustainable structures.\n\n\"In every mix, I build the foundation of tomorrow.\"",
        photo: "/Tanvi.png", photoFlip: "/Tanvi 1.png",
        superName: "Mix Queen", color: "#1abc9c",
        objectPosition: "center 25%",
        audio: "/Tanvi.mp3"
    },
    {
        role: "Student Researcher", name: "Kedar Patil",
        bio: "Deep within the heat of fire and science, stands Kedar, the controller of transformation.\n\nWhere others see waste — sugarcane leaves, turmeric leaves — he sees possibility.\n\nInside the muffle furnace, he commands temperature and time, turning raw nature into powerful ash.\n\nHe is the bridge between nature and engineering.\n\n\"Through fire, I unlock the true strength of materials.\"",
        photo: "/Kedar.png", photoFlip: "/Kedar (2).png",
        superName: "Furnace King", color: "#e74c3c",
        objectPosition: "center top",
        audio: "/Kedar.mp3"
    },
    {
        role: "Student Researcher", name: "Payal Pise",
        bio: "Behind every strong structure lies unseen science — and Payal is its guardian.\n\nThrough tests like Loss of Ignition, Chloride Content, and Insoluble Residue, she reveals the hidden truth of materials.\n\nShe doesn't guess — she proves.\n\nHer work ensures that every material meets the standards of safety, durability, and trust.\n\n\"Numbers don't lie… and neither does quality.\"",
        photo: "/Payal.png", photoFlip: "/Payal 1.png",
        superName: "Lab Devi", color: "#3498db",
        objectPosition: "center 15%", scale: 1.3,
        audio: "/Payal.mp3"
    },
    {
        role: "Student Researcher", name: "Kaveri Konnur",
        bio: "In the chaos of particles, one name brings order — Kaveri.\n\nWith steady hands and sharp focus, she separates sand from cement, fine from coarse, good from better.\n\nShe ensures that only the right materials move forward, because she knows —\n\neven the smallest impurity can weaken the strongest structure.\n\n\"Perfection begins with precision.\"",
        photo: "/Kaveri.png", photoFlip: "/Kaveri 1.png",
        superName: "Particle Princess", color: "#9b59b6",
        objectPosition: "center top",
        audio: "/Kaveri.mp3"
    },
    {
        role: "Student Researcher", name: "Aniket Khandare",
        bio: "In a world where structures rise from vision and science, there exists one who brings everything together — Aniket.\n\nNot just a participant… but the force that connects every element, every process, every mind.\n\nWhile others master their domains — mixing, testing, separating, transforming — Aniket stands at the center, where all paths meet.\n\nHe sees what others don't: not just materials… but possibilities. Not just data… but decisions. Not just a project… but a future being built.",
        photo: "/Aniket.png", photoFlip: "/Aniket 1.png",
        superName: "The Mastermind", color: "#f39c12",
        objectPosition: "40% 20%", scale: 1.5,
        audio: "/Aniket.mp3"
    },
];

/* ── VOICE NARRATION ── */
// Priority list: best natural/neural voices across browsers & OS
const VOICE_PRIORITY = [
    // Windows — Microsoft Neural Online (best quality)
    "Microsoft Aria Online (Natural) - English (United States)",
    "Microsoft Guy Online (Natural) - English (United States)",
    "Microsoft Jenny Online (Natural) - English (United States)",
    "Microsoft Emma Online (Natural) - English (United States)",
    "Microsoft Brian Online (Natural) - English (United States)",
    // Chrome / Android — Google voices
    "Google UK English Female",
    "Google UK English Male",
    "Google US English",
    // macOS / iOS — system voices
    "Samantha",
    "Daniel",
    "Karen",
    "Moira",
    "Victoria",
];

function getBestVoice(voices) {
    for (const name of VOICE_PRIORITY) {
        const v = voices.find(v => v.name === name);
        if (v) return v;
    }
    // Fallback: any online English voice
    return (
        voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("online")) ||
        voices.find(v => v.lang.startsWith("en") && v.localService === false) ||
        voices.find(v => v.lang === "en-US") ||
        voices.find(v => v.lang.startsWith("en")) ||
        null
    );
}

function speakText(text, onEnd) {
    window.speechSynthesis.cancel();
    const clean = text
        .replace(/[💬\n]/g, " ")
        .replace(/["""]/g, "")
        .replace(/—/g, ", ")
        .replace(/…/g, "...")
        .replace(/\s+/g, " ")
        .trim();

    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 0.82;    // Slower = more dramatic narrator feel
    utter.pitch = 0.92;   // Slightly lower = deeper, cinematic voice
    utter.volume = 1;

    const trySpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const best = getBestVoice(voices);
        if (best) utter.voice = best;
        utter.onend = onEnd;
        utter.onerror = () => { if (onEnd) onEnd(); };
        window.speechSynthesis.speak(utter);
    };

    // Voices may not be loaded yet — wait for them
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        trySpeak();
    } else {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.onvoiceschanged = null;
            trySpeak();
        };
    }
}

/* ── SPOTLIGHT MODAL ── */
function SpotlightModal({ person, onClose }) {
    const [textVisible, setTextVisible] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Lock scroll
        document.body.style.overflow = "hidden";
        // Start sequence: photo appears center, then slides left, then text appears
        const t1 = setTimeout(() => setTextVisible(true), 900);
        const t2 = setTimeout(() => {
            setSpeaking(true);
            if (person.audio) {
                // Play real audio file
                const audio = new Audio(person.audio);
                audioRef.current = audio;
                audio.play().catch(() => { });
                audio.onended = () => setSpeaking(false);
                audio.onerror = () => setSpeaking(false);
            } else {
                // Fallback to TTS for members without an audio file
                speakText(person.bio, () => setSpeaking(false));
            }
        }, 1400);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            // Stop real audio if playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            window.speechSynthesis.cancel();
            document.body.style.overflow = "";
        };
    }, [person]);

    const lines = person.bio.split("\n").filter(l => l.trim());

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(5, 10, 20, 0.88)",
                backdropFilter: "blur(14px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
            }}
        >
            {/* Ambient glow behind photo */}
            <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{
                    position: "absolute",
                    width: 480, height: 480,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${person.color}44 0%, transparent 70%)`,
                    filter: "blur(40px)",
                    left: "18%", top: "50%",
                    transform: "translate(-50%, -50%)"
                }}
            />

            {/* Inner content — stop propagation so click inside doesn't close */}
            <div onClick={e => e.stopPropagation()} style={{
                display: "flex", alignItems: "center",
                gap: "4rem", padding: "2rem",
                maxWidth: 1000, width: "100%",
                cursor: "default"
            }}>

                {/* PHOTO — drops to center then slides left */}
                <motion.div
                    initial={{ x: "30vw", y: 40, opacity: 0, scale: 0.85 }}
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ flexShrink: 0, position: "relative" }}
                >
                    {/* Glow ring */}
                    <div style={{
                        position: "absolute", inset: -6, borderRadius: 22,
                        background: `linear-gradient(135deg, ${person.color}88, transparent 60%)`,
                        filter: "blur(12px)", zIndex: 0
                    }} />
                    <div style={{
                        width: 300, height: 380,
                        borderRadius: 18, overflow: "hidden",
                        border: `2px solid ${person.color}99`,
                        boxShadow: `0 0 0 1px ${person.color}44, 0 30px 70px rgba(0,0,0,0.5)`,
                        position: "relative", zIndex: 1
                    }}>
                        <img
                            src={person.photoFlip || person.photo}
                            alt={person.name}
                            style={{
                                width: "100%", height: "100%",
                                objectFit: "cover",
                                objectPosition: person.objectPosition || "center top",
                                transform: person.scale ? `scale(${person.scale})` : "none",
                                transformOrigin: "center top",
                                display: "block"
                            }}
                        />
                        {/* Color overlay from bottom */}
                        <div style={{
                            position: "absolute", inset: 0,
                            background: `linear-gradient(to top, ${person.color}cc 0%, transparent 55%)`,
                            zIndex: 2
                        }} />
                        {/* Super name badge on photo */}
                        <div style={{
                            position: "absolute", bottom: 18, left: 0, right: 0,
                            textAlign: "center", zIndex: 3
                        }}>
                            <div style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "1.7rem", color: "#fff", fontWeight: 700,
                                textShadow: "0 3px 12px rgba(0,0,0,0.9)",
                                lineHeight: 1.1
                            }}>{person.superName}</div>
                            <div style={{
                                fontSize: "0.6rem", color: "rgba(255,255,255,0.8)",
                                textTransform: "uppercase", letterSpacing: "0.35em",
                                fontWeight: 700, marginTop: 5,
                                textShadow: "0 2px 6px rgba(0,0,0,0.8)"
                            }}>Power Level: {person.role === "Project Guide" ? "INFINITY" : "MAX"}</div>
                        </div>
                    </div>
                </motion.div>

                {/* STORY TEXT — appears from the right */}
                <AnimatePresence>
                    {textVisible && (
                        <motion.div
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            style={{ flex: 1, maxWidth: 480 }}
                        >
                            {/* Tag */}
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                background: `${person.color}22`,
                                border: `1px solid ${person.color}55`,
                                borderRadius: 20, padding: "4px 14px",
                                marginBottom: "1rem"
                            }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: person.color,
                                    boxShadow: `0 0 8px ${person.color}`,
                                    animation: speaking ? "pulse 1s infinite" : "none"
                                }} />
                                <span style={{
                                    fontSize: "0.68rem", color: person.color,
                                    fontWeight: 700, textTransform: "uppercase",
                                    letterSpacing: "0.15em"
                                }}>{speaking ? "🔊 Narrating..." : "Origin Story"}</span>
                            </div>

                            {/* Name & role */}
                            <div style={{
                                fontSize: "0.72rem", textTransform: "uppercase",
                                letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)",
                                fontWeight: 600, marginBottom: "0.4rem"
                            }}>{person.role}</div>
                            <h2 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "2.4rem", color: "#fff",
                                margin: "0 0 1.4rem 0", lineHeight: 1.1
                            }}>{person.name}</h2>

                            {/* Story lines — stagger in */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {lines.map((line, i) => (
                                    <motion.p
                                        key={i}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + i * 0.12, duration: 0.5, ease: "easeOut" }}
                                        style={{
                                            color: line.startsWith('"') || line.startsWith('"')
                                                ? person.color
                                                : "rgba(255,255,255,0.82)",
                                            fontSize: line.startsWith('"') || line.startsWith('"') ? "1.05rem" : "0.92rem",
                                            lineHeight: 1.7,
                                            fontStyle: line.startsWith('"') || line.startsWith('"') ? "italic" : "normal",
                                            fontWeight: line.startsWith('"') || line.startsWith('"') ? 600 : 400,
                                            margin: 0,
                                        }}
                                    >{line}</motion.p>
                                ))}
                            </div>

                            {/* Close hint */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                style={{
                                    marginTop: "2rem",
                                    fontSize: "0.68rem", color: "rgba(255,255,255,0.35)",
                                    textTransform: "uppercase", letterSpacing: "0.15em"
                                }}
                            >Click anywhere to close</motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Close button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                style={{
                    position: "absolute", top: 24, right: 28,
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff", width: 40, height: 40, borderRadius: "50%",
                    fontSize: "1.1rem", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(6px)"
                }}
            >✕</motion.button>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.4); }
                }
            `}</style>
        </motion.div>
    );
}

/* ── POWER CARD (replaces FlipCard) ── */
function PowerCard({ person, index, onActivate }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.55, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
            onClick={() => onActivate(person)}
            style={{ cursor: "pointer" }}
        >
            {/* Card */}
            <div style={{
                width: "100%", aspectRatio: "3/4",
                borderRadius: 16, overflow: "hidden",
                position: "relative",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                border: "1.5px solid rgba(15,35,64,0.1)",
                marginBottom: "0.9rem",
                transition: "box-shadow 0.3s",
            }}>
                {/* Photo */}
                <img
                    src={person.photo}
                    alt={person.name}
                    style={{
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        objectPosition: person.objectPosition || "center top",
                        transform: person.scale ? `scale(${person.scale})` : "none",
                        transformOrigin: "center top",
                        display: "block"
                    }}
                />

                {/* Neutral dark vignette — keeps text readable */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 40%, transparent 65%)",
                }} />

                {/* Super Name on card */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "1rem 1rem 1.1rem",
                    textAlign: "center"
                }}>
                    <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.35rem", color: "#fff", fontWeight: 700,
                        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                        lineHeight: 1.15, marginBottom: 6
                    }}>{person.superName}</div>
                    <div style={{
                        fontSize: "0.55rem", color: "rgba(255,255,255,0.75)",
                        textTransform: "uppercase", letterSpacing: "0.3em",
                        fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.8)"
                    }}>Power Level: {person.role === "Project Guide" ? "INFINITY" : "MAX"}</div>
                </div>

                {/* Click hint icon */}
                <div style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(0,0,0,0.45)", borderRadius: "50%",
                    width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", color: "#fff", backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.2)"
                }}>▶</div>
            </div>

            {/* Name & role below card */}
            <div style={{ textAlign: "center" }}>
                <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.15rem", fontWeight: 700, color: C.navy, marginBottom: "0.2rem"
                }}>{person.name}</div>
                <div style={{
                    fontSize: "0.72rem", color: C.muted,
                    textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600
                }}>{person.role}</div>
            </div>
        </motion.div>
    );
}

/* ── MAIN ABOUT PAGE ── */
export default function About() {
    const controlsImage = useAnimation();
    const controlsText = useAnimation();
    const videoContainerRef = useRef(null);
    const isVideoInView = useInView(videoContainerRef, { margin: "-20%" });
    const videoRef = useRef(null);

    const controlsHodImage = useAnimation();
    const controlsHodText = useAnimation();
    const hodRef = useRef(null);
    const isHodInView = useInView(hodRef, { once: true, margin: "-100px" });

    const [activePerson, setActivePerson] = useState(null);

    useEffect(() => {
        if (videoRef.current) {
            if (isVideoInView) {
                videoRef.current.play().catch(() => { });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isVideoInView]);

    useEffect(() => {
        async function sequence() {
            controlsImage.set({ x: "0%", y: 20, scale: 0.9, opacity: 0 });
            await controlsImage.start({ y: 0, scale: 1, opacity: 1, transition: { duration: 1.2, ease: "easeOut" } });
            await new Promise(r => setTimeout(r, 800));
            controlsImage.start({ x: "calc(-50% - 2rem)", transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } });
            controlsText.start({ opacity: 1, y: 0, x: "calc(50% + 2rem)", transition: { duration: 1.0, ease: "easeOut", delay: 0.1 } });
        }
        sequence();
    }, [controlsImage, controlsText]);

    useEffect(() => {
        if (!isHodInView) return;
        async function hodSequence() {
            controlsHodImage.set({ x: "0%", y: 20, scale: 0.9, opacity: 0 });
            await controlsHodImage.start({ y: 0, scale: 1, opacity: 1, transition: { duration: 1.2, ease: "easeOut" } });
            await new Promise(r => setTimeout(r, 700));
            controlsHodImage.start({ x: "calc(-50% - 2rem)", transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } });
            controlsHodText.start({ opacity: 1, y: 0, x: "calc(50% + 2rem)", transition: { duration: 1.0, ease: "easeOut", delay: 0.15 } });
        }
        hodSequence();
    }, [isHodInView, controlsHodImage, controlsHodText]);

    const handleClose = useCallback(() => {
        window.speechSynthesis.cancel();
        setActivePerson(null);
    }, []);

    return (
        <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Source Sans 3', sans-serif" }}>

            {/* ── HERO SCENE ── */}
            <div style={{ height: "70vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderBottom: `1px solid rgba(15,35,64,0.1)` }}>
                <motion.div
                    animate={controlsImage}
                    style={{
                        position: "absolute",
                        width: "min(42vw, 540px)", height: "min(28vw, 360px)",
                        background: "#dcd6cb",
                        borderRadius: 16,
                        boxShadow: "0 24px 48px rgba(15,35,64,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(0,0,0,0.05)"
                    }}
                >
                    <img
                        src="/team-photo.png" alt="Team"
                        style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", zIndex: 10, borderRadius: 16 }}
                        onError={e => { e.target.style.display = "none"; }}
                    />
                    <span style={{ color: "#8a8074", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.1em" }}>[ Team Photo ]</span>
                </motion.div>

                <motion.div
                    animate={controlsText}
                    initial={{ opacity: 0, y: 40, x: "calc(50% + 2rem)" }}
                    style={{ position: "absolute", width: "min(42vw, 420px)", textAlign: "left" }}
                >
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", color: C.gold2, fontWeight: 700, marginBottom: "0.8rem" }}>The Project Story</div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 3.5vw, 3.2rem)", color: C.navy, lineHeight: 1.1, margin: "0 0 1.2rem 0" }}>
                        The Minds<br />Behind The Mix
                    </h1>
                    <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.65, fontWeight: 400 }}>
                        We are dedicated to sustainable concrete construction through the optimization of industrial and agricultural byproducts. This platform is the culmination of our research, combining rigorous laboratory testing with digital visualization.
                    </p>
                </motion.div>
            </div>

            {/* ── HOD SECTION ── */}
            <div style={{ textAlign: "center", padding: "3rem 2rem 0" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", color: C.navy, margin: 0 }}>Special Thanks</h2>
                <div style={{ width: 60, height: 3, background: C.gold2, margin: "1rem auto 0" }} />
            </div>

            <div ref={hodRef} style={{ height: "70vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderBottom: `1px solid rgba(15,35,64,0.08)` }}>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, #f5f0e8 0%, #ede4d0 50%, #e8ddc8 100%)`, pointerEvents: "none" }} />
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-75%, -50%)", width: 640, height: 640, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold2}28 0%, ${C.gold2}10 35%, transparent 70%)`, pointerEvents: "none", filter: "blur(18px)" }} />
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-75%, -50%)", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,230,170,0.35) 0%, transparent 65%)", pointerEvents: "none", filter: "blur(8px)" }} />

                <motion.div
                    animate={controlsHodImage}
                    style={{
                        position: "absolute", 
                        width: "min(40vw, 480px)", height: "min(30vw, 360px)",
                        perspective: "1200px",
                    }}
                >
                    {/* Flip Card Inner */}
                    <div className="hod-flip-card-inner" style={{
                        position: "relative", width: "100%", height: "100%",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)",
                        borderRadius: 18,
                    }}>
                        {/* FRONT — original HOD photo */}
                        <div style={{
                            position: "absolute", inset: 0, backfaceVisibility: "hidden",
                            borderRadius: 18, overflow: "hidden",
                            background: "#dcd6cb",
                            boxShadow: `0 0 0 1px ${C.gold2}44, 0 0 40px 8px ${C.gold2}22, 0 28px 60px rgba(15,35,64,0.22)`,
                            border: `1.5px solid ${C.gold2}66`,
                        }}>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, rgba(255,240,200,0.18) 0%, transparent 100%)", zIndex: 2, pointerEvents: "none", borderRadius: "18px 18px 0 0" }} />
                            <img src="/Hod (2).png" alt="Head of Department" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 28%", borderRadius: 18, display: "block" }} onError={e => { e.target.style.display = "none"; }} />
                            <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: `2px solid ${C.gold2}`, opacity: 0.45, pointerEvents: "none", boxShadow: `inset 0 0 24px ${C.gold2}33` }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to top, rgba(15,35,64,0.18) 0%, transparent 100%)", zIndex: 2, pointerEvents: "none", borderRadius: "0 0 18px 18px" }} />
                            {/* Hover hint */}
                            <div style={{ position: "absolute", top: 12, right: 14, zIndex: 10, background: "rgba(201,162,39,0.85)", borderRadius: 20, padding: "3px 10px", fontSize: "0.6rem", fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", backdropFilter: "blur(4px)" }}>
                                Hover to flip ↻
                            </div>
                        </div>

                        {/* BACK — Hod 3.png (Godfather photo) */}
                        <div style={{
                            position: "absolute", inset: 0, backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                            borderRadius: 18, overflow: "hidden",
                            background: "#1a0f00",
                            boxShadow: `0 0 0 2px ${C.gold2}88, 0 0 60px 12px ${C.gold2}33, 0 28px 60px rgba(15,35,64,0.4)`,
                            border: `2px solid ${C.gold2}`,
                        }}>
                            <img src="/Hod 3.png" alt="Dr. Amol Mali — Godfather" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", borderRadius: 18, display: "block" }} onError={e => { e.target.style.display = "none"; }} />
                            <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "linear-gradient(to top, rgba(10,5,0,0.55) 0%, transparent 55%)", pointerEvents: "none", zIndex: 2 }} />
                            <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", zIndex: 3 }}>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 800, color: C.gold2, textShadow: "0 2px 12px rgba(0,0,0,0.9)", letterSpacing: "0.04em" }}>The Godfather</div>
                                <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.28em", fontWeight: 700, marginTop: 4, textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>Dr. Amol Mali — HOD</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <style>{`
                    .hod-flip-card-inner:hover {
                        transform: rotateY(180deg);
                    }
                `}</style>

                <motion.div
                    animate={controlsHodText}
                    initial={{ opacity: 0, y: 40, x: "calc(50% + 2rem)" }}
                    style={{ position: "absolute", width: "min(42vw, 400px)", textAlign: "left" }}
                >
                    <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.2em", color: C.gold2, fontWeight: 700, marginBottom: "0.8rem" }}>Guidance &amp; Support</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3vw, 2.2rem)", color: C.navy, lineHeight: 1.15, margin: "0 0 1.2rem 0" }}>
                        Guidance and Support<br />Behind Our Work
                    </h2>
                    <p style={{ color: C.muted, fontSize: "0.93rem", lineHeight: 1.75, fontWeight: 400 }}>
                        With the guidance of <strong style={{ color: C.navy, fontWeight: 700 }}>Dr. Amol Mali</strong>, Head of Department,
                        this project was successfully completed with strong academic and technical support.
                        He provided essential equipment and guided us in its proper use. Throughout the project,
                        he helped us identify and correct technical errors and offered valuable constructive feedback.
                        His continuous support played a key role in improving the quality of our work and achieving successful results.
                    </p>
                    <div style={{ marginTop: "1.2rem", display: "flex", alignItems: "center", gap: "0.7rem" }}>
                        <div style={{ width: 36, height: 2, background: C.gold2 }} />
                        <span style={{ fontSize: "0.8rem", color: C.gold2, fontWeight: 600, letterSpacing: "0.08em" }}>Dr. Amol Mali — Head Of Department</span>
                    </div>
                </motion.div>
            </div>

            {/* ── TEAM GRID ── */}
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 2rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", color: C.navy, margin: 0 }}>Our Team</h2>
                    <div style={{ width: 60, height: 3, background: C.gold2, margin: "1rem auto 0.8rem" }} />
                    <p style={{ color: C.muted, fontSize: "0.88rem", margin: 0 }}>Click any card to reveal their story</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
                    {TEAM.map((person, i) => (
                        <PowerCard key={i} person={person} index={i} onActivate={setActivePerson} />
                    ))}
                </div>
            </div>

            {/* ── SPECIAL ACKNOWLEDGEMENTS ── */}
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "1rem 2rem 3rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.22em", color: C.gold2, fontWeight: 700, marginBottom: "0.7rem" }}>
                        With Gratitude
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", color: C.navy, margin: "0 0 1rem 0" }}>
                        Special Acknowledgements
                    </h2>
                    <div style={{ width: 60, height: 3, background: C.gold2, margin: "0 auto 0.9rem" }} />
                    <p style={{ color: C.muted, fontSize: "0.88rem", margin: "0 auto", maxWidth: 520, lineHeight: 1.6 }}>
                        We extend our heartfelt gratitude to those who supported us behind the scenes throughout this journey.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.6rem" }}>
                    {[
                        { name: "Pravin Sir", role: "Technical Support", photo: "/Pravin.png", color: "#2980b9" },
                        { name: "Lab Incharge", role: "Laboratory Guidance", photo: "/lab mam 2.png", color: "#8e44ad" },
                        { name: "Gadge Mama", role: "Lab Assistance", photo: "/Gadge Mama.png", color: "#16a085" },
                        { name: "Lab Mam", role: "Laboratory Support", photo: "/Lab mam.png", color: "#c0392b" },
                    ].map((person, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ delay: i * 0.12, duration: 0.55, ease: "easeOut" }}
                            whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
                            style={{ cursor: "default" }}
                        >
                            <div style={{
                                width: "100%", aspectRatio: "3/4",
                                borderRadius: 14, overflow: "hidden",
                                position: "relative",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                border: `1px solid ${C.border}`,
                                marginBottom: "0.85rem",
                                background: "#fff",
                            }}>
                                <img
                                    src={person.photo}
                                    alt={person.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                                    onError={e => { e.target.style.display = "none"; }}
                                />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)" }} />
                                <div style={{ position: "absolute", top: 10, left: 12, background: "rgba(15,35,64,0.6)", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", backdropFilter: "blur(4px)" }}>⭐</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: C.navy, marginBottom: "0.2rem" }}>{person.name}</div>
                                <div style={{ fontSize: "0.68rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{person.role}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── PROJECT JOURNEY ── */}
            <div style={{ maxWidth: 740, margin: "0 auto", padding: "1rem 2rem 4rem", textAlign: "center" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", color: C.navy, margin: 0 }}>Project Journey</h2>
                <div style={{ width: 60, height: 3, background: C.gold2, margin: "1.2rem auto 2rem" }} />
                <motion.div
                    ref={videoContainerRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                        width: "100%", background: "#000",
                        borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 20px 50px rgba(15,35,64,0.2)", position: "relative", overflow: "hidden"
                    }}
                >
                    <video
                        ref={videoRef}
                        src="/Batch 2026.mp4"
                        controls playsInline
                        style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 16 }}
                    >
                        <track kind="captions" />
                        Your browser does not support the video tag.
                    </video>
                </motion.div>
            </div>

            {/* ── SPOTLIGHT MODAL ── */}
            <AnimatePresence>
                {activePerson && (
                    <SpotlightModal person={activePerson} onClose={handleClose} />
                )}
            </AnimatePresence>
        </div>
    );
}
