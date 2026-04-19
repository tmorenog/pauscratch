"use client";

import { useEffect, useMemo, useState } from "react";
import { Bracket } from "@/components/Bracket";
import { Champion } from "@/components/Champion";
import { CompareModal } from "@/components/CompareModal";
import { Confetti } from "@/components/Confetti";
import { Controls } from "@/components/Controls";
import { ProfileBar } from "@/components/ProfileBar";
import { ProfileEditor } from "@/components/ProfileEditor";
import { Progress } from "@/components/Progress";
import { ShareModal } from "@/components/ShareModal";
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
  "The whole family can play. Pick yours, compare, and trash-talk. 🎯",
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
    profiles,
    activeProfile,
    switchProfile,
    addProfile,
    renameProfile,
    deleteProfile,
    buildShareUrl,
    pendingShare,
    acceptShared,
    dismissShared,
  } = useBracket();

  const champion = useMemo(() => getChampion(matches), [matches]);
  const runnerUp = useMemo(() => getRunnerUp(matches), [matches]);
  const thirdPlace = useMemo(() => getThirdPlace(matches), [matches]);
  const progress = useMemo(() => roundProgress(matches), [matches]);

  const [tagline, setTagline] = useState(TAGLINES[0]);
  useEffect(() => {
    setTagline(TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);
  }, []);

  const championKey = champion ? `${activeProfile.id}:${champion.id}` : null;
  const [confettiKey, setConfettiKey] = useState<string | null>(null);
  useEffect(() => {
    if (championKey) setConfettiKey(`${championKey}-${Date.now()}`);
  }, [championKey]);

  const [showCompare, setShowCompare] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showImportShared, setShowImportShared] = useState(false);

  // When a shared bracket is detected on first load, prompt to import.
  useEffect(() => {
    if (pendingShare) setShowImportShared(true);
  }, [pendingShare]);

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
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setShareUrl(buildShareUrl())}
            title="Copy a shareable link to this bracket"
          >
            📤 Share
          </button>
          <ThemeToggle />
        </div>
      </header>

      {hydrated ? (
        <ProfileBar
          profiles={profiles}
          activeId={activeProfile.id}
          onSwitch={switchProfile}
          onAdd={(name, avatar, color, seed) =>
            addProfile(name, avatar, color, seed)
          }
          onRename={renameProfile}
          onDelete={deleteProfile}
          onCompare={() => setShowCompare(true)}
        />
      ) : null}

      <Progress progress={progress} />

      <Champion
        champion={champion}
        runnerUp={runnerUp}
        thirdPlace={thirdPlace}
        playerName={activeProfile?.name}
        playerAvatar={activeProfile?.avatar}
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
            Each player can have <strong>their own bracket</strong>. Add
            mom, dad, brother, friends — pick an avatar and a team color.
          </li>
          <li>
            Pick match results to advance teams. Type the score, tap{" "}
            <strong>+ / −</strong>, or hit <strong>🎲</strong> to roll a
            random winner.
          </li>
          <li>
            If a knockout game is tied, choose the winner after{" "}
            <strong>extra time</strong> or <strong>penalties</strong>.
          </li>
          <li>
            Press <strong>👀 Compare</strong> to see everyone&rsquo;s podium
            picks side-by-side.
          </li>
          <li>
            Press <strong>📤 Share</strong> to copy a link — anyone who opens
            it can save your bracket as their own and tweak it.
          </li>
          <li>
            Hit <strong>✨ Surprise Me!</strong> to auto-fill any missing
            picks. Everything is saved in your browser.
          </li>
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
        Built with Next.js · Deploys to Vercel · Made for the whole family 🏆
      </footer>

      <Confetti trigger={confettiKey} />

      {showCompare ? (
        <CompareModal
          profiles={profiles}
          activeId={activeProfile.id}
          onClose={() => setShowCompare(false)}
        />
      ) : null}

      {shareUrl ? (
        <ShareModal url={shareUrl} onClose={() => setShareUrl(null)} />
      ) : null}

      {showImportShared && pendingShare ? (
        <ProfileEditor
          title="Save this shared bracket?"
          submitLabel="Save as new player"
          onCancel={() => {
            setShowImportShared(false);
            dismissShared();
          }}
          onSubmit={({ name, avatar, color }) => {
            acceptShared(name || "Shared", avatar, color);
            setShowImportShared(false);
          }}
        />
      ) : null}
    </main>
  );
}
