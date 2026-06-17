import { useState, useEffect, useCallback } from "react";

// ─── Design tokens — exact match with Login.jsx ───────────────────────────
const C = {
  bg:          "#0d1117",
  surface:     "#161b22",
  border:      "#30363d",
  divider:     "#21262d",
  text:        "#e6edf3",
  muted:       "#8b949e",
  green:       "#3fb950",
  red:         "#f85149",
  blue:        "#1f6feb",
  blueLoading: "#1a3a5c",
  blueBorder:  "#388bfd26",
  greenBg:     "#0f2a1a",
  greenBorder: "#1c6e3a",
  redBg:       "#2a0f0f",
  redBorder:   "#6e1c1c",
  dim:         "#484f58",
};

const font = "'Consolas', 'Menlo', 'Monaco', monospace";

// ─── Shared style helpers (mirror Login.jsx patterns) ─────────────────────
const S = {
  dot: (color) => ({
    width: "10px", height: "10px",
    borderRadius: "50%", backgroundColor: color, flexShrink: 0,
  }),
  label: {
    display: "block", color: C.muted, fontSize: "11px",
    fontWeight: "600", letterSpacing: "0.8px",
    textTransform: "uppercase", marginBottom: "6px",
  },
  statusBox: (type) => ({
    padding: "10px 12px", borderRadius: "5px",
    fontSize: "12px", fontFamily: font,
    backgroundColor: type === "error" ? C.redBg   : C.greenBg,
    border:          `1px solid ${type === "error" ? C.redBorder : C.greenBorder}`,
    color:           type === "error" ? C.red      : C.green,
    letterSpacing: "0.3px",
  }),
  primaryBtn: (loading) => ({
    padding: "10px", backgroundColor: loading ? C.blueLoading : C.blue,
    color: loading ? C.muted : "#ffffff",
    border: `1px solid ${loading ? C.border : C.blueBorder}`,
    borderRadius: "5px", fontSize: "14px", fontWeight: "600",
    fontFamily: font, letterSpacing: "0.3px",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "background-color 0.15s",
  }),
  ghostBtn: {
    padding: "8px 20px", backgroundColor: "transparent",
    border: `1px solid ${C.border}`, borderRadius: "5px",
    color: C.muted, fontFamily: font,
    fontSize: "13px", cursor: "pointer",
  },
};

// ─── Keyboard rows ─────────────────────────────────────────────────────────
const ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["z","x","c","v","b","n","m"],
];

// ─── SVG Hangman ──────────────────────────────────────────────────────────
function HangmanSVG({ lives }) {
  const wrong = 6 - lives;
  const part = (i) => ({
    opacity: wrong > i ? 1 : 0,
    transition: "opacity 0.4s ease",
  });

  return (
    <svg
      viewBox="0 0 200 210"
      width="190" height="200"
      aria-label={`Hangman figure, ${wrong} of 6 wrong guesses`}
    >
      {/* Gallows — subtle, use border color */}
      <line x1="20" y1="200" x2="180" y2="200" stroke={C.border}  strokeWidth="3" strokeLinecap="round" />
      <line x1="55" y1="200" x2="55"  y2="15"  stroke={C.border}  strokeWidth="3" strokeLinecap="round" />
      <line x1="55" y1="15"  x2="130" y2="15"  stroke={C.border}  strokeWidth="3" strokeLinecap="round" />
      <line x1="130" y1="15" x2="130" y2="38"  stroke={C.muted}   strokeWidth="2" strokeLinecap="round" />

      {/* Body parts — appear one by one */}
      <circle cx="130" cy="53" r="15" stroke={C.text} strokeWidth="2" fill="none" style={part(0)} />
      <line x1="130" y1="68"  x2="130" y2="122" stroke={C.text} strokeWidth="2" strokeLinecap="round" style={part(1)} />
      <line x1="130" y1="85"  x2="105" y2="108" stroke={C.text} strokeWidth="2" strokeLinecap="round" style={part(2)} />
      <line x1="130" y1="85"  x2="155" y2="108" stroke={C.text} strokeWidth="2" strokeLinecap="round" style={part(3)} />
      <line x1="130" y1="122" x2="105" y2="158" stroke={C.text} strokeWidth="2" strokeLinecap="round" style={part(4)} />
      <line x1="130" y1="122" x2="155" y2="158" stroke={C.text} strokeWidth="2" strokeLinecap="round" style={part(5)} />
    </svg>
  );
}

// ─── Word display ──────────────────────────────────────────────────────────
function WordDisplay({ display, revealedWord, status }) {
  // During play: show display (blanks + guessed letters)
  // On win:  all slots green (display is fully filled)
  // On loss: show revealedWord — green if guessed, red if missed
  const letters =
    status === "lost" && revealedWord
      ? revealedWord.split("")
      : display;

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
      {letters.map((ch, i) => {
        const blank  = ch === "_";
        const missed = status === "lost" && revealedWord && display[i] === "_";
        const color  = missed ? C.red : (blank ? C.border : C.green);

        return (
          <div
            key={i}
            style={{
              minWidth: "26px", height: "42px",
              borderBottom: `2px solid ${color}`,
              display: "flex", alignItems: "flex-end",
              justifyContent: "center", paddingBottom: "4px",
              fontSize: "20px", fontWeight: "600",
              color: missed ? C.red : C.text,
              transition: "border-color 0.3s ease, color 0.3s ease",
            }}
          >
            {!blank ? ch.toUpperCase() : ""}
          </div>
        );
      })}
    </div>
  );
}

// ─── Keyboard ──────────────────────────────────────────────────────────────
function Keyboard({ guessedLetters, display, onGuess }) {
  const keyStyle = (letter) => {
    const guessed = guessedLetters.includes(letter);
    const wrong   = guessed && !display.includes(letter);
    return {
      width: "34px", height: "38px", borderRadius: "5px",
      fontSize: "12px", fontWeight: "600", fontFamily: font,
      textTransform: "uppercase",
      cursor: guessed ? "default" : "pointer",
      transition: "all 0.1s",
      border:           `1px solid ${wrong ? C.redBorder : C.border}`,
      backgroundColor:  wrong ? C.redBg : guessed ? C.surface : "transparent",
      color:            wrong ? C.red   : guessed ? C.dim      : C.text,
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: "5px" }}>
          {row.map((letter) => (
            <button
              key={letter}
              onClick={() => onGuess(letter)}
              disabled={guessedLetters.includes(letter)}
              style={keyStyle(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function Hangman({ onLogout }) {
  const [phase, setPhase]               = useState("menu");   // menu | playing | over
  const [difficulty, setDifficulty]     = useState("medium");
  const [gameId, setGameId]             = useState(null);
  const [display, setDisplay]           = useState([]);
  const [lives, setLives]               = useState(6);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [status, setStatus]             = useState("ongoing");
  const [revealedWord, setRevealedWord] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // ── Guess handler (also used by keydown listener) ──
  const handleGuess = useCallback(async (letter) => {
    if (phase !== "playing" || guessedLetters.includes(letter)) return;

    // Optimistically mark as guessed so the key dims immediately
    setGuessedLetters((prev) => [...prev, letter]);

    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json", "sessionToken": sessionStorage.getItem("sessionToken") },
        body: JSON.stringify({ game_id: gameId, letter }),
      });
      const data = await res.json();

      if (data.status === "won" || data.status === "lost") {
        setStatus(data.status);
        setRevealedWord(data.word);
        if (data.status === "won") setDisplay(data.word.split(""));
        if (data.status === "lost") setLives(0);
        setPhase("over");
      } else if (data.display) {
        setDisplay(data.display);
        setLives(data.lives);
        setGuessedLetters(data.guessed_letters);
      }
    } catch {
      // Roll back optimistic update on network error
      setGuessedLetters((prev) => prev.filter((l) => l !== letter));
    }
  }, [phase, gameId, guessedLetters]);

  // ── Physical keyboard support ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key))
        handleGuess(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleGuess]);

  // ── Start game ──
  const startGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/new_game", {
        method: "POST",
        headers: { "Content-Type": "application/json", "sessionToken": sessionStorage.getItem("sessionToken") },
        body: JSON.stringify({ difficulty }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGameId(data.game_id);
      setDisplay(data.display);
      setLives(data.lives);
      setGuessedLetters(data.guessed_letters);
      setStatus(data.status);
      setRevealedWord(null);
      setPhase("playing");
    } catch {
      setError("Could not reach the server. Is Flask running?");
    }
    setLoading(false);
  };

  // ── Reset to menu ──
  const resetToMenu = () => {
    setPhase("menu");
    setGameId(null);
    setDisplay([]);
    setLives(6);
    setGuessedLetters([]);
    setStatus("ongoing");
    setRevealedWord(null);
    setError(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: C.bg,
      color: C.text,
      fontFamily: font,
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Header bar ── */}
      <header style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: `1px solid ${C.divider}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={S.dot(C.green)} />
          <h1 style={{ color: C.text, fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px", margin: 0 }}>
            Hangman
          </h1>
          {phase !== "menu" && (
            <span style={{
              fontSize: "11px", fontWeight: "600", letterSpacing: "0.8px",
              textTransform: "uppercase", color: C.muted,
              marginLeft: "6px",
            }}>
              / {difficulty}
            </span>
          )}
        </div>
        <button onClick={onLogout} style={S.ghostBtn}>
          Disconnect
        </button>
      </header>

      {/* ── Main content ── */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "24px", padding: "32px 16px",
      }}>

        {/* ── Menu phase ── */}
        {phase === "menu" && (
          <>
            <div style={{ textAlign: "center" }}>
              <p style={S.label}>Select difficulty</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    style={{
                      padding: "8px 20px", borderRadius: "5px",
                      fontFamily: font, fontSize: "13px", fontWeight: "600",
                      letterSpacing: "0.3px", textTransform: "uppercase",
                      cursor: "pointer", transition: "all 0.15s",
                      backgroundColor: difficulty === d ? C.blue      : "transparent",
                      color:           difficulty === d ? "#ffffff"    : C.muted,
                      border: `1px solid ${difficulty === d ? C.blueBorder : C.border}`,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.divider}`, width: "200px" }} />

            <button
              onClick={startGame}
              disabled={loading}
              style={{ ...S.primaryBtn(loading), width: "200px" }}
            >
              {loading ? "Starting…" : "Start Game"}
            </button>

            {error && <div style={S.statusBox("error")}>{error}</div>}
          </>
        )}

        {/* ── Playing / Over phase ── */}
        {(phase === "playing" || phase === "over") && (
          <>
            <HangmanSVG lives={lives} />

            {/* Lives indicator */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    display: "inline-block",
                    backgroundColor: i < lives ? C.green : C.border,
                    transition: "background-color 0.3s ease",
                  }}
                />
              ))}
              <span style={{ color: C.muted, fontSize: "11px", fontWeight: "600", letterSpacing: "0.8px", marginLeft: "8px", textTransform: "uppercase" }}>
                {lives} {lives === 1 ? "life" : "lives"}
              </span>
            </div>

            <WordDisplay display={display} revealedWord={revealedWord} status={status} />

            {phase === "playing" && (
              <Keyboard
                guessedLetters={guessedLetters}
                display={display}
                onGuess={handleGuess}
              />
            )}

            {phase === "over" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                <div style={S.statusBox(status === "won" ? "success" : "error")}>
                  {status === "won"
                    ? "✓  You got it!"
                    : `✗  The word was "${revealedWord?.toUpperCase()}"`}
                </div>
                <button onClick={resetToMenu} style={S.ghostBtn}>
                  Play Again
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}