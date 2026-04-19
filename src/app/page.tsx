"use client";

import { useMemo } from "react";
import { Bracket } from "@/components/Bracket";
import { Champion } from "@/components/Champion";
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

export default function HomePage() {
  const { matches, hydrated, updateMatch, reset, importJSON, exportJSON } =
    useBracket();

  const champion = useMemo(() => getChampion(matches), [matches]);
  const runnerUp = useMemo(() => getRunnerUp(matches), [matches]);
  const thirdPlace = useMemo(() => getThirdPlace(matches), [matches]);
  const progress = useMemo(() => roundProgress(matches), [matches]);

  return (
    <main className="page">
      <header className="header">
        <div className="header-title">
          <h1>Pau&rsquo;s Worldcup Bracket</h1>
          <span className="tagline">
            Pick winners and march through the tournament.
          </span>
        </div>
        <div className="header-actions">
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
        <Bracket matches={matches} onUpdate={updateMatch} />
      ) : (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
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
        />
      </section>

      <section className="section" aria-label="How to use">
        <h2>How it works</h2>
        <ul>
          <li>
            Pick match results to advance teams through the bracket. Type the
            score for each team in every match.
          </li>
          <li>
            If a knockout game is tied, choose the winner after{" "}
            <strong>extra time</strong> or <strong>penalties</strong>.
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
    </main>
  );
}
