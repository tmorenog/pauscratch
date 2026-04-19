"use client";

import { useMemo } from "react";
import type { DecidedBy, Match, MatchSlot, Team } from "@/lib/types";
import { ROUND_LABELS } from "@/lib/types";

interface Props {
  match: Match;
  onChange: (
    opts: {
      score1?: number | null;
      score2?: number | null;
      tiebreakWinnerSlot?: MatchSlot | null;
      decidedBy?: DecidedBy | null;
    },
  ) => void;
  onRandom: () => void;
}

function parseScore(raw: string): number | null {
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

function TeamRow({
  team,
  score,
  isWinner,
  isLoser,
  onScoreChange,
  disabled,
  label,
}: {
  team: Team | null;
  score: number | null;
  isWinner: boolean;
  isLoser: boolean;
  onScoreChange: (v: number | null) => void;
  disabled: boolean;
  label: string;
}) {
  const inputId = useMemo(
    () => `score-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );
  const current = score ?? 0;
  return (
    <div
      className={`team-row ${isWinner ? "winner" : ""} ${isLoser ? "loser" : ""}`}
    >
      <div className={`team-name ${team ? "" : "empty"}`}>
        {team ? (
          <>
            <span className="flag" aria-hidden>
              {team.flag}
            </span>
            <span className="label" title={team.name}>
              {team.name}
            </span>
          </>
        ) : (
          <span className="label">TBD</span>
        )}
      </div>
      <div className="score-controls">
        <button
          type="button"
          className="score-step"
          aria-label={`Decrease ${team?.name ?? label} score`}
          disabled={disabled || current <= 0}
          onClick={() => onScoreChange(Math.max(0, current - 1))}
        >
          −
        </button>
        <label htmlFor={inputId} style={{ display: "none" }}>
          {`${label} score`}
        </label>
        <input
          id={inputId}
          className="score-input"
          type="number"
          min={0}
          inputMode="numeric"
          value={score ?? ""}
          disabled={disabled}
          aria-label={`${team?.name ?? label} score`}
          onChange={(e) => onScoreChange(parseScore(e.target.value))}
        />
        <button
          type="button"
          className="score-step"
          aria-label={`Increase ${team?.name ?? label} score`}
          disabled={disabled}
          onClick={() => {
            const next = (score ?? 0) + 1;
            onScoreChange(next);
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function MatchCard({ match, onChange, onRandom }: Props) {
  const { team1, team2, score1, score2, winnerId, loserId } = match;
  const disabled = !team1 || !team2;
  const tied =
    score1 != null &&
    score2 != null &&
    score1 === score2 &&
    !!team1 &&
    !!team2;

  const complete = winnerId != null;

  const decidedByLabel = (() => {
    if (!complete) return null;
    if (match.decidedBy === "extra_time") return "after extra time";
    if (match.decidedBy === "penalties") return "on penalties";
    return null;
  })();

  const winningTeamName = complete
    ? winnerId === team1?.id
      ? team1?.name
      : team2?.name
    : null;

  return (
    <div
      className={`match ${complete ? "complete" : ""} ${
        !complete && team1 && team2 ? "ready" : ""
      }`}
      aria-label={`${ROUND_LABELS[match.round]} match ${match.matchNumber}`}
    >
      <div className="match-header">
        <span className="num">
          {shortRound(match.round)} · #{match.matchNumber}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {match.date ? <span>{match.date}</span> : null}
          <button
            type="button"
            className="dice-btn"
            onClick={onRandom}
            disabled={disabled}
            aria-label="Pick a random winner"
            title="Pick a random winner"
          >
            🎲
          </button>
        </div>
      </div>

      <TeamRow
        team={team1}
        score={score1}
        isWinner={complete && winnerId === team1?.id}
        isLoser={complete && loserId === team1?.id}
        disabled={disabled}
        label="Team 1"
        onScoreChange={(v) => onChange({ score1: v })}
      />
      <TeamRow
        team={team2}
        score={score2}
        isWinner={complete && winnerId === team2?.id}
        isLoser={complete && loserId === team2?.id}
        disabled={disabled}
        label="Team 2"
        onScoreChange={(v) => onChange({ score2: v })}
      />

      {tied && !complete ? (
        <div className="tiebreak">
          <span className="label">Tied — pick a winner</span>
          <div className="tiebreak-row">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() =>
                onChange({
                  tiebreakWinnerSlot: "team1",
                  decidedBy: "extra_time",
                })
              }
            >
              {team1?.flag} {team1?.code} (ET)
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() =>
                onChange({
                  tiebreakWinnerSlot: "team2",
                  decidedBy: "extra_time",
                })
              }
            >
              {team2?.flag} {team2?.code} (ET)
            </button>
          </div>
          <div className="tiebreak-row">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() =>
                onChange({
                  tiebreakWinnerSlot: "team1",
                  decidedBy: "penalties",
                })
              }
            >
              {team1?.flag} {team1?.code} (Pens)
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() =>
                onChange({
                  tiebreakWinnerSlot: "team2",
                  decidedBy: "penalties",
                })
              }
            >
              {team2?.flag} {team2?.code} (Pens)
            </button>
          </div>
        </div>
      ) : null}

      <div className="match-meta">
        <span className="stadium">📍 {match.stadium}</span>
        <span>
          {match.city}, {match.country}
        </span>
        {complete && decidedByLabel ? (
          <span className="match-winner-tag extra">
            {winningTeamName} wins {decidedByLabel} 🎉
          </span>
        ) : complete ? (
          <span className="match-winner-tag">{winningTeamName} advances ⚽</span>
        ) : null}
      </div>
    </div>
  );
}

function shortRound(round: Match["round"]): string {
  switch (round) {
    case "round_of_16":
      return "R16";
    case "quarterfinal":
      return "QF";
    case "semifinal":
      return "SF";
    case "third_place":
      return "3rd";
    case "final":
      return "Final";
  }
}
