"use client";

import { ROUND_LABELS, type Round } from "@/lib/types";

interface Props {
  progress: { round: Round; done: number; total: number }[];
}

export function Progress({ progress }: Props) {
  return (
    <div className="progress" aria-label="Tournament progress">
      {progress.map(({ round, done, total }) => {
        const pct = total === 0 ? 0 : Math.round((done / total) * 100);
        return (
          <div key={round} className="progress-step">
            <span className="label">{ROUND_LABELS[round]}</span>
            <span className="value">
              {done} / {total}
            </span>
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${ROUND_LABELS[round]} progress`}
            >
              <div style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
