"use client";

import type { Team } from "@/lib/types";

interface Props {
  champion: Team | null;
  runnerUp: Team | null;
  thirdPlace: Team | null;
  playerName?: string;
  playerAvatar?: string;
}

export function Champion({
  champion,
  runnerUp,
  thirdPlace,
  playerName,
  playerAvatar,
}: Props) {
  if (!champion) return null;
  return (
    <div className="champion" role="status" aria-live="polite">
      <span className="trophy" aria-hidden>
        🏆
      </span>
      <div>
        <div className="label">
          {playerName ? (
            <>
              {playerAvatar ? <span aria-hidden>{playerAvatar} </span> : null}
              {playerName}&rsquo;s champion
            </>
          ) : (
            "Champion"
          )}
        </div>
        <div className="name">
          <span className="flag" aria-hidden>
            {champion.flag}
          </span>{" "}
          {champion.name}
        </div>
        <div className="podium">
          {runnerUp ? (
            <span>
              🥈 {runnerUp.flag} {runnerUp.name}
            </span>
          ) : null}
          {thirdPlace ? (
            <span>
              🥉 {thirdPlace.flag} {thirdPlace.name}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
