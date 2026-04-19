"use client";

import {
  getChampion,
  getRunnerUp,
  getThirdPlace,
  roundProgress,
} from "@/lib/bracket";
import type { BracketProfile } from "@/lib/types";

interface Props {
  profiles: BracketProfile[];
  activeId: string;
  onClose: () => void;
}

export function CompareModal({ profiles, activeId, onClose }: Props) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal compare-modal">
        <h3 id="compare-title">👀 Who picked what?</h3>
        <p>Side-by-side picks for the podium and tournament progress.</p>

        <div className="compare-grid">
          {profiles.map((p) => {
            const champ = getChampion(p.matches);
            const runner = getRunnerUp(p.matches);
            const third = getThirdPlace(p.matches);
            const progress = roundProgress(p.matches);
            const totalDone = progress.reduce((a, b) => a + b.done, 0);
            const totalAll = progress.reduce((a, b) => a + b.total, 0);
            const pct = totalAll === 0 ? 0 : Math.round((totalDone / totalAll) * 100);
            const isActive = p.id === activeId;
            return (
              <div
                key={p.id}
                className={`compare-card ${isActive ? "active" : ""}`}
                style={{ borderTopColor: p.color }}
              >
                <div className="compare-head">
                  <span className="avatar" aria-hidden>{p.avatar}</span>
                  <span className="name">{p.name}</span>
                  {isActive ? <span className="you-tag">You</span> : null}
                </div>
                <div className="compare-row">
                  <span className="medal">🏆</span>
                  <span className="pick">
                    {champ ? `${champ.flag} ${champ.name}` : "—"}
                  </span>
                </div>
                <div className="compare-row">
                  <span className="medal">🥈</span>
                  <span className="pick">
                    {runner ? `${runner.flag} ${runner.name}` : "—"}
                  </span>
                </div>
                <div className="compare-row">
                  <span className="medal">🥉</span>
                  <span className="pick">
                    {third ? `${third.flag} ${third.name}` : "—"}
                  </span>
                </div>
                <div className="compare-progress">
                  <div className="bar">
                    <div style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                  <div className="pct">
                    {totalDone}/{totalAll} matches · {pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
