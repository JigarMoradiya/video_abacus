// NUMBER DETECTIVE SIM — a scripted, frame-driven recreation of the real game (confirmed from
// the user's own gameplay contact-sheet: a classic "guess the secret number" game, NOT
// Mastermind — a numeric keypad + orange "Guess" button, a big result box that shows "?" then
// the typed guess, a "Too low"/"Too high"/"Correct!" tag underneath, and a row of small dots
// for tries remaining). Not a playable engine — three scripted rounds (10 → too low,
// 16 → too high, 14 → correct) walk the real binary-search strategy the narration teaches.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export type Judge = "low" | "high" | "correct";

export interface DetectiveRound {
  guess: number;
  judge: Judge;
  /** frame the digits pop into the result box (hook flashes only — real rounds instead type
   *  digit-by-digit on the keypad, ending right at `tapAt`) */
  revealAt: number;
  /** frame the tag flips (too low / too high / correct) and the box judges color */
  judgeAt: number;
  /** frame the "Guess" button is pressed — when set, the digits type in one at a time on the
   *  keypad in the frames leading up to this, instead of popping into the box all at once */
  tapAt?: number;
  activeUntil: number;
  /** 1-based try count this round counts as on the dot row — omitted for hook flashes,
   *  which show a number but are never a "real" submitted guess */
  tryNumber?: number;
}

const DIGIT_PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "Guess"];
/** frames between each digit's key-press when typing a guess, ending at `tapAt` */
const TYPE_GAP = 9;

export const NumberDetectiveSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  rounds: DetectiveRound[];
  range: [number, number];
  triesTotal: number;
  /** frame the "Range: 1-20" header pill appears */
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, rounds, range, triesTotal, headerAt, scale = 1 }) => {
  // When a round has a `tapAt` (every real guess), the guess is "submitted" the moment Guess
  // is pressed — the digits type onto the keypad one at a time in the frames before that,
  // ending exactly at `tapAt`. Hook flashes (no `tapAt`) skip typing and just pop in at
  // `revealAt`, since they're a quick look, not a played-out guess.
  const submittedAt = (r: DetectiveRound) => r.tapAt ?? r.revealAt;
  const digitsOf = (r: DetectiveRound) => String(r.guess).split("");
  /** absolute frame the i-th digit of `r.guess` gets pressed on the keypad */
  const digitPressAt = (r: DetectiveRound, i: number) => {
    const digits = digitsOf(r);
    return r.tapAt !== undefined ? r.tapAt - (digits.length - i) * TYPE_GAP : r.revealAt;
  };
  /** the frame THIS round's own display (typing → box → tag) starts taking over */
  const roundStart = (r: DetectiveRound) => (r.tapAt !== undefined ? digitPressAt(r, 0) : r.revealAt);

  // Picking the active round by `activeUntil` (the previous round's own cutoff) put the
  // switchover too LATE for rounds 2 and 3: their digit-typing needs to start BEFORE their
  // own `tapAt`, but the pointer was still parked on the previous round until that previous
  // round's `activeUntil` — which landed at or after the next round's Guess-press, so the
  // "1"/"6" and "1"/"4" key-presses were computed against the WRONG round's digits and never
  // rendered (only round 1's did, because nothing upstream delayed its own handoff). Scanning
  // forward by each round's own `roundStart` instead means a round takes over the instant its
  // OWN typing begins, whichever round that is.
  let roundIdx = 0;
  for (let i = 0; i < rounds.length; i++) {
    if (frame >= roundStart(rounds[i])) roundIdx = i;
  }
  const round = rounds[roundIdx];

  // Only rounds tagged with a `tryNumber` are real submitted guesses — the hook flashes at
  // the top show a number too but must NOT advance the tries-used dot row. Scanning every
  // round (not just the active one) means a dot fills the moment ITS OWN guess is submitted,
  // not the instant the active-round pointer moves on to the next one.
  const triesUsed = rounds.reduce((acc, r) => (r.tryNumber !== undefined && frame >= submittedAt(r) ? Math.max(acc, r.tryNumber) : acc), 0);

  const digits = digitsOf(round);
  // how many digits of THIS round's guess have been typed onto the keypad so far
  const typedCount = round.tapAt !== undefined
    ? digits.filter((_, i) => frame >= digitPressAt(round, i)).length
    : frame >= round.revealAt
    ? digits.length
    : 0;
  const revealed = typedCount > 0;
  const displayedGuess = digits.slice(0, typedCount).join("");
  const lastDigitAt = typedCount > 0 ? digitPressAt(round, typedCount - 1) : round.revealAt;

  const judged = frame >= round.judgeAt;
  const judgeIn = judged
    ? interpolate(frame, [round.judgeAt, round.judgeAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  // a small bump on EVERY new digit typed, not just the first — each keystroke should read on
  // the box, the same way a real keypad updates its display as you type
  const popIn = revealed
    ? interpolate(frame, [lastDigitAt, lastDigitAt + 4, lastDigitAt + 8], [0.85, 1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const t = frame / fps;
  const idleBob = judged ? Math.sin(t * 1.2) * 5 : Math.sin(t * 1.6) * 7;
  const correct = round.judge === "correct";
  const boxBorder = judged ? (correct ? "#2E7D32" : round.judge === "low" ? "#1976D2" : "#E65100") : "#00897B";
  const boxBg = judged && correct ? "#E8F5E9" : "rgba(255,255,255,0.96)";
  const judgedGlow = judged ? 0.5 + Math.sin(t * 2.4) * 0.5 : 0;

  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const tagText = round.judge === "low" ? "Too low! ⬆️" : round.judge === "high" ? "Too high! ⬇️" : "Correct! 🎉";
  const tagColor = round.judge === "low" ? "#1976D2" : round.judge === "high" ? "#E65100" : "#2E7D32";

  const showTapRing = round.tapAt !== undefined && frame >= round.tapAt - 8 && frame <= round.tapAt + 4;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 560, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {/* header pill — matches the real "Range: 1-20" pill */}
      <div style={{ textAlign: "center", marginBottom: 22, opacity: headerIn, transform: `scale(${0.7 + headerIn * 0.3})` }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 32,
            color: "#1B1440",
            background: "rgba(255,255,255,0.96)",
            border: "3px solid #7C4DFF",
            borderRadius: 999,
            padding: "9px 30px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          🔍 Range: {range[0]}-{range[1]}
        </span>
      </div>

      {/* the result box + judge tag */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${idleBob}px)` }}>
        <div
          style={{
            width: 176,
            height: 176,
            borderRadius: 32,
            background: boxBg,
            border: `7px solid ${boxBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: judged ? `0 0 ${16 + 8 * judgedGlow}px ${5 + 3 * judgedGlow}px ${boxBorder}66` : "0 8px 0 rgba(0,0,0,0.18)",
            transform: `scale(${popIn})`,
          }}
        >
          <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 84, color: boxBorder }}>
            {revealed ? displayedGuess : "?"}
          </span>
        </div>

        <div
          style={{
            marginTop: 20,
            opacity: judgeIn,
            transform: `scale(${0.6 + judgeIn * 0.4})`,
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 34,
              color: "#FFFFFF",
              background: tagColor,
              borderRadius: 999,
              padding: "10px 28px",
              boxShadow: "0 5px 0 rgba(0,0,0,0.2)",
            }}
          >
            {tagText}
          </span>
        </div>
      </div>

      {/* tries-remaining dot row */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 30 }}>
        {Array.from({ length: triesTotal }, (_, i) => {
          const used = i < triesUsed;
          return (
            <div
              key={i}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: used ? "#7C4DFF" : "rgba(255,255,255,0.5)",
                border: "3px solid rgba(255,255,255,0.7)",
                transform: used && i === triesUsed - 1 ? `scale(${1 + judgeIn * 0.25})` : "scale(1)",
              }}
            />
          );
        })}
      </div>

      {/* the numeric keypad + Guess button — simplified, but the real 12-key layout. Every
          digit of the guess actually gets "typed" here: the matching key presses down and
          flashes right as its digit lands in the box above, so a guess reads as someone
          tapping it in rather than the number just appearing on its own. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 34 }}>
        {DIGIT_PAD.map((key, i) => {
          const isGuessBtn = key === "Guess";
          const guessPressed = isGuessBtn && showTapRing;
          // how hard THIS digit key is being pressed right now — 0..1, peaking the instant
          // its digit lands in the box, decaying just as fast on either side
          let digitPress = 0;
          if (!isGuessBtn && key !== "⌫" && round.tapAt !== undefined) {
            digits.forEach((d, di) => {
              if (d !== key) return;
              const at = digitPressAt(round, di);
              digitPress = Math.max(digitPress, Math.max(0, 1 - Math.abs(frame - at) / 5));
            });
          }
          const pressed = guessPressed || digitPress > 0.05;
          return (
            <div key={i} style={{ position: "relative" }}>
              {pressed && (
                <div
                  style={{
                    position: "absolute",
                    inset: -8,
                    border: "5px solid #FFFFFF",
                    borderRadius: 18,
                    opacity: guessPressed
                      ? interpolate(frame, [round.tapAt! - 8, round.tapAt!], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                      : digitPress,
                  }}
                />
              )}
              <div
                style={{
                  height: 66,
                  borderRadius: 14,
                  background: isGuessBtn ? "#FB8C00" : digitPress > 0.05 ? "#E3E8FF" : "rgba(255,255,255,0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 0 rgba(0,0,0,0.18)",
                  transform: `scale(${guessPressed ? 0.94 : 1 - digitPress * 0.08})`,
                }}
              >
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 34, color: isGuessBtn ? "#FFF" : "#3A281A" }}>
                  {key}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
