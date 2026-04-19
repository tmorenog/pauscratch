"use client";

import { useEffect, useMemo, useState } from "react";
import { Bracket } from "@/components/Bracket";
import { Champion } from "@/components/Champion";
import { Confetti } from "@/components/Confetti";
import { Controls } from "@/components/Controls";
import { Progress } from "@/components/Progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  getChampion,
  getRunnerUp,
  getThirdPlace,
  roundProgress,
} from "@/lib/bracket";
import { useBracket } from "@/lib/useBracket";

const TAGLINES = [
  "Pick winners and march through the tournament. ⚽",
  "Who's lifting the trophy this year? 🏆",
  "Goals, glory, and a few penalty shootouts. 🥅",
  "Build your dream bracket, one match at a time. ✨",
  "Upsets welcome. Nothing is decided until the final whistle. 🔔",
];

export default function HomePage() {
  const {
    matches,
    hydrated,
    updateMatch,
    reset,
    importJSON,
    exportJSON,
    surpriseMe,
    pickRandom,
  } = useBracket();

  const champion = useMemo(() => getChampion(matches), [matches]);
  const runnerUp = useMemo(() => getRunnerUp(matches), [matches]);
  const thirdPlace = useMemo(() => getThirdPlace(matches), [matches]);
  const progress = useMemo(() => roundProgress(matches), [matches]);

  const [tagline, setTagline] = useState(TAGLINES[0]);
  useEffect(() => {
    setTagline(TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);
  }, []);

  // Re-trigger confetti every time the champion id changes to a non-null value.
  const championId = champion?.id ?? null;
  const [confettiKey, setConfettiKey] = useState<string | null>(null);
  useEffect(() => {
    if (championId) setConfettiKey(`${championId}-${Date.now()}`);
  }, [championId]);

  return (
    <main className="page">
      <div className="bg-pattern" aria-hidden />

      <header className="header">
        <div className="header-title">
          <h1>
            <span className="title-ball" aria-hidden>
              ⚽
            </span>
            Pau&rsquo;s Worldcup Bracket
          </h1>
          <span className="tagline">{tagline}</span>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm surprise-btn"
            onClick={() => surpriseMe(false)}
            title="Randomly fill in any matches that don't have a winner yet"
          >
            ✨ Surprise Me!
          </button>
          <ThemeToggle />
        </div>
      </header>

      <Progress progress={progress} />

      <Champion
        champion={champion}
        runnerUp={runnerUp}
        thirdPlace={thirdPlace}
      />

      {hydrated ? (
        <Bracket
          matches={matches}
          onUpdate={updateMatch}
          onRandom={pickRandom}
        />
      ) : (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          Loading bracket…
        </div>
      )}

      <section className="section">
        <h2>Controls</h2>
        <Controls
          onReset={reset}
          onExport={exportJSON}
          onImport={importJSON}
          onPrint={() => {
            if (typeof window !== "undefined") window.print();
          }}
          onSurpriseAll={() => surpriseMe(true)}
        />
      </section>

      <section className="section" aria-label="How to use">
        <h2>How it works</h2>
        <ul>
          <li>
            Pick match results to advance teams through the bracket. Type the
            score, tap <strong>+ / −</strong>, or hit <strong>🎲</strong> to
            roll a random winner.
          </li>
          <li>
            If a knockout game is tied, choose the winner after{" "}
            <strong>extra time</strong> or <strong>penalties</strong>.
          </li>
          <li>
            Press <strong>✨ Surprise Me!</strong> in the header to auto-fill
            any matches that don&rsquo;t have a winner yet.
          </li>
          <li>
            Winners move up automatically. If you change an earlier result,
            later rounds are recalculated and cleared where needed.
          </li>
          <li>Results are saved in your browser, so you can come back later.</li>
        </ul>
      </section>

      <footer
        style={{
          marginTop: 32,
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        Built with Next.js · Deploys to Vercel · Made for Pau 🏆
      </footer>

      <Confetti trigger={confettiKey} />
    </main>
  );
}
