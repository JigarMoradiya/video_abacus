# Abacus Video Series — Episode Roadmap

Reference sequence agreed with the user on 2026-09-25. Supersedes the per-case episode counts in
`VIDEO_SERIES_PLAN.md` (that doc was written before production started and gave nearly every
complement case its own episode — actual production consolidated hard: "All Small Friends" is one
episode instead of four, "All Five Big Friends" is one instead of five, etc.). This file tracks the
real, current plan going forward.

Status as of 2026-09-25: **13 episodes made, 6 uploaded (E01–E06).**

## 1–6 · Basics

| # | Episode |
|---|---|
| 1 | Introduction & Parts of Abacus |
| 2 | Learn to Count 0–9 |
| 3 | Adding Two Numbers |
| 4 | Bigger Numbers (place value — tens & hundreds) |
| 5 | Taking Away |
| 6 | Adding & Subtracting on Two Rods |

## 7–10 · Small Friend (complements of 5)

| # | Episode |
|---|---|
| 7 | The Trick That Fixes It (hook) |
| 8 | All Small Friends (Adding) |
| 9 | Small Friends for Taking Away |
| 10 | Beat the Beads — Small Friend Recap |

## 11–14 · Big Friend (complements of 10)

| # | Episode |
|---|---|
| 11 | The Big Friend Trick (hook) |
| 12 | All Five Big Friends (Adding) |
| 13 | Big Friend Taking Away |
| 14 | Big Friend Recap *(not yet scripted — mirrors E10's role)* |

## 15–17 · Family (both formulas combined)

| # | Episode |
|---|---|
| 15 | Family Plus (−5+10) |
| 16 | Family Minus (+5−10) |
| 17 | Family Recap |

*Label fix (2026-10): the earlier rows read "Family Plus (+5−10)" and "Family Minus (−5+10)" — the signs were swapped. The app is the source of truth (iOS `Level2FormulaView.swift`, Android `Level2FormulaScreen.kt`): Family + is −5+10 and Family − is +5−10. Adding must net a positive number, and −5+10 is +5.*

## 18–19 · Formula wrap-up

| # | Episode |
|---|---|
| 18 | Choosing the Right Formula — How to Choose Between Small, Big and Family |
| 19 | Mixed Practice — Small + Big + Family Formulas Together |

*Order set by the user (2026-10): learn how to choose the trick FIRST (18), then practise them mixed (19).*

## 20–26 · Multiplication

| # | Episode |
|---|---|
| 20 | Multiplication Setup — Columns, Zero Rule & Shortcuts |
| 21 | 2-Digit × 1-Digit Multiplication |
| 22 | 2-Digit × 2-Digit Multiplication |
| 23 | 3-Digit × 1-Digit Multiplication |
| 24 | 3-Digit × 2-Digit Multiplication |
| 25 | 3-Digit × 3-Digit Multiplication |
| 26 | Multiplication Mixed Practice |

## 27–31 · Division

| # | Episode |
|---|---|
| 27 | Division Setup — Columns & Division Tricks |
| 28 | Division — 2–3 Digit Dividend ÷ 1-Digit Divisor |
| 29 | Division — 3–4 Digit Dividend ÷ 2-Digit Divisor |
| 30 | Division — 4–5 Digit Dividend ÷ 1–2 Digit Divisor *(open question: strict progression to 2-digit divisor only, or a mixed-difficulty capstone? — unconfirmed)* |
| 31 | Division Mixed Practice |

## 32–34 · Anzan & Speed

Deliberately compressed from the original plan's 5 episodes — semi-anzan, full-anzan and the
speed drill are one skill deepening in difficulty, not three separate teachable ideas.

| # | Episode |
|---|---|
| 32 | Beads in Your Head — Introducing Anzan |
| 33 | Anzan Practice — Getting Faster |
| 34 | Flash Challenge — Faster Than a Calculator |

---

## Proposed extension (35–38) — pending confirmation

Grounded in real app modules from `iOS/APP_FEATURES.md`, none of which any episode above teaches
how to use:

| # | Episode | Why |
|---|---|---|
| 35 | Exercise Mode — Practice Makes Perfect | Timed fluency drills (digit count / lines / questions-per-minute), abacus or keypad input |
| 36 | Exam Mode — Test What You Know | 4-choice MCQ across all 4 operations; walk through its 3 question types (equation / missing number / abacus visual) |
| 37 | Custom Challenge Mode — Build Your Own Challenge | Mental-math-only, configurable digit range — reuses the same engine as Anzan, so a natural follow-up to episode 33 |
| 38 | Math Game Zone — Learn While You Play | One tour episode pointing to the game zone as bonus practice — NOT one episode per game (the 20 games already have their own separate reels; `APP_FEATURES.md`'s "4 games" listing is stale) |

**Total if extension is included: 38 episodes.** Times Tables (app Level 4 / multiplication) is
already covered above as its own series — the original plan's separate deferred "Times Tables"
mini-season is superseded by episodes 20–26.
