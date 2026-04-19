"use client";

import type { DecidedBy, Match, MatchSlot } from "@/lib/types";
import { ROUND_LABELS } from "@/lib/types";
import { MatchCard } from "./MatchCard";

interface Props {
  matches: Match[];
  onUpdate: (
    id: string,
    opts: {
      score1?: number | null;
      score2?: number | null;
      tiebreakWinnerSlot?: MatchSlot | null;
      decidedBy?: DecidedBy | null;
    },
  ) => void;
}

export function Bracket({ matches, onUpdate }: Props) {
  const r16 = matches.filter((m) => m.round === "round_of_16");
  const qf = matches.filter((m) => m.round === "quarterfinal");
  const sf = matches.filter((m) => m.round === "semifinal");
  const tp = matches.find((m) => m.round === "third_place");
  const final = matches.find((m) => m.round === "final");

  return (
    <div className="bracket-wrapper" aria-label="Tournament bracket">
      <div className="bracket">
        <Column title={ROUND_LABELS.round_of_16} matches={r16} onUpdate={onUpdate} />
        <Column title={ROUND_LABELS.quarterfinal} matches={qf} onUpdate={onUpdate} />
        <Column title={ROUND_LABELS.semifinal} matches={sf} onUpdate={onUpdate} />
        <div className="round finals-column">
          <div className="round-title">Finals</div>
          {final ? (
            <div>
              <div
                className="round-title"
                style={{ border: 0, marginBottom: 4 }}
              >
                {ROUND_LABELS.final}
              </div>
              <MatchCard
                match={final}
                onChange={(opts) => onUpdate(final.id, opts)}
              />
            </div>
          ) : null}
          {tp ? (
            <div>
              <div
                className="round-title"
                style={{ border: 0, marginBottom: 4 }}
              >
                {ROUND_LABELS.third_place}
              </div>
              <MatchCard
                match={tp}
                onChange={(opts) => onUpdate(tp.id, opts)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Column({
  title,
  matches,
  onUpdate,
}: {
  title: string;
  matches: Match[];
  onUpdate: Props["onUpdate"];
}) {
  return (
    <div className="round">
      <div className="round-title">{title}</div>
      <div className="round-column">
        {matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            onChange={(opts) => onUpdate(m.id, opts)}
          />
        ))}
      </div>
    </div>
  );
}
