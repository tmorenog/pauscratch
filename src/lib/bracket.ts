import type { DecidedBy, Match, MatchSlot, Team } from "./types";
import { ROUND_ORDER } from "./types";
import rawData from "@/data/tournament.json";

/**
 * Returns a fresh copy of the initial tournament bracket from the bundled JSON
 * data. All dynamic result fields (scores, winner) are initialised to null so
 * the state is a clean starting point.
 */
export function getInitialMatches(): Match[] {
  const data = rawData as unknown as { matches: Match[] };
  return data.matches.map((m) => ({
    ...m,
    team1: m.team1 ? { ...m.team1 } : null,
    team2: m.team2 ? { ...m.team2 } : null,
    score1: null,
    score2: null,
    winnerId: null,
    loserId: null,
    decidedBy: null,
  }));
}

/** Returns a deep-ish clone of matches suitable for local mutation. */
export function cloneMatches(matches: Match[]): Match[] {
  return matches.map((m) => ({
    ...m,
    team1: m.team1 ? { ...m.team1 } : null,
    team2: m.team2 ? { ...m.team2 } : null,
  }));
}

export function findMatch(matches: Match[], id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

/**
 * Decide the winner of a single match given the scores and tiebreaker hint.
 * Returns `null` if the match cannot yet be decided.
 */
export function computeWinner(match: Match): {
  winnerId: string | null;
  loserId: string | null;
  decidedBy: DecidedBy | null;
} {
  const { team1, team2, score1, score2, decidedBy } = match;
  if (!team1 || !team2) {
    return { winnerId: null, loserId: null, decidedBy: null };
  }
  if (score1 == null || score2 == null) {
    return { winnerId: null, loserId: null, decidedBy: null };
  }
  if (score1 > score2) {
    return { winnerId: team1.id, loserId: team2.id, decidedBy: "regular" };
  }
  if (score2 > score1) {
    return { winnerId: team2.id, loserId: team1.id, decidedBy: "regular" };
  }
  // Tied — tiebreaker must be provided explicitly via `decidedBy` and the
  // caller chooses the winner through setMatchResult(...).
  return { winnerId: null, loserId: null, decidedBy: decidedBy ?? null };
}

/**
 * Apply a match update and propagate the result through dependent rounds.
 *
 * - If the new result gives a different winner (or clears it), any downstream
 *   slots previously filled by this match's winner/loser are cleared. This
 *   cascades through the bracket recursively.
 */
export interface SetResultOptions {
  score1?: number | null;
  score2?: number | null;
  /** Manual winner selection (e.g. after penalties). Ignored if scores are not tied. */
  tiebreakWinnerSlot?: MatchSlot | null;
  decidedBy?: DecidedBy | null;
}

export function setMatchResult(
  matches: Match[],
  matchId: string,
  opts: SetResultOptions,
): Match[] {
  const next = cloneMatches(matches);
  const match = findMatch(next, matchId);
  if (!match) return matches;

  if (opts.score1 !== undefined) match.score1 = opts.score1;
  if (opts.score2 !== undefined) match.score2 = opts.score2;

  const prevWinnerId = match.winnerId;
  const prevLoserId = match.loserId;

  const { team1, team2, score1, score2 } = match;
  let winnerId: string | null = null;
  let loserId: string | null = null;
  let decidedBy: DecidedBy | null = null;

  if (team1 && team2 && score1 != null && score2 != null) {
    if (score1 > score2) {
      winnerId = team1.id;
      loserId = team2.id;
      decidedBy = "regular";
    } else if (score2 > score1) {
      winnerId = team2.id;
      loserId = team1.id;
      decidedBy = "regular";
    } else if (opts.tiebreakWinnerSlot) {
      const pickedTeam =
        opts.tiebreakWinnerSlot === "team1" ? team1 : team2;
      const otherTeam =
        opts.tiebreakWinnerSlot === "team1" ? team2 : team1;
      winnerId = pickedTeam.id;
      loserId = otherTeam.id;
      decidedBy = opts.decidedBy ?? "penalties";
    }
  }

  match.winnerId = winnerId;
  match.loserId = loserId;
  match.decidedBy = decidedBy;

  // Propagate: if winner changed, update the next match's slot; same for loser slot.
  if (prevWinnerId !== winnerId) {
    propagateSlot(next, match.nextMatchId, match.nextMatchSlot, teamById(match, winnerId));
  }
  if (prevLoserId !== loserId) {
    propagateSlot(
      next,
      match.loserNextMatchId ?? null,
      match.loserNextMatchSlot ?? null,
      teamById(match, loserId),
    );
  }

  return next;
}

function teamById(match: Match, id: string | null): Team | null {
  if (!id) return null;
  if (match.team1?.id === id) return match.team1;
  if (match.team2?.id === id) return match.team2;
  return null;
}

/**
 * Sets the given slot on the target match to the new team. If that changes
 * the slot, the target match's result is cleared and the change cascades.
 */
function propagateSlot(
  matches: Match[],
  targetId: string | null,
  slot: MatchSlot | null,
  team: Team | null,
): void {
  if (!targetId || !slot) return;
  const target = findMatch(matches, targetId);
  if (!target) return;

  const prev = slot === "team1" ? target.team1 : target.team2;
  const sameTeam = prev?.id === team?.id && (prev === null) === (team === null);
  if (sameTeam) return;

  if (slot === "team1") {
    target.team1 = team ? { ...team } : null;
  } else {
    target.team2 = team ? { ...team } : null;
  }

  // Clear the target's result and cascade further.
  const hadResult =
    target.winnerId != null ||
    target.loserId != null ||
    target.score1 != null ||
    target.score2 != null;

  target.score1 = null;
  target.score2 = null;
  target.winnerId = null;
  target.loserId = null;
  target.decidedBy = null;

  if (hadResult) {
    propagateSlot(matches, target.nextMatchId, target.nextMatchSlot, null);
    propagateSlot(
      matches,
      target.loserNextMatchId ?? null,
      target.loserNextMatchSlot ?? null,
      null,
    );
  }
}

export function resetAll(): Match[] {
  return getInitialMatches();
}

export function getMatchesByRound(matches: Match[]) {
  return ROUND_ORDER.map((round) => ({
    round,
    matches: matches.filter((m) => m.round === round),
  }));
}

export function getChampion(matches: Match[]): Team | null {
  const finalMatch = matches.find((m) => m.round === "final");
  if (!finalMatch || !finalMatch.winnerId) return null;
  return teamById(finalMatch, finalMatch.winnerId);
}

export function getRunnerUp(matches: Match[]): Team | null {
  const finalMatch = matches.find((m) => m.round === "final");
  if (!finalMatch || !finalMatch.loserId) return null;
  return teamById(finalMatch, finalMatch.loserId);
}

export function getThirdPlace(matches: Match[]): Team | null {
  const tp = matches.find((m) => m.round === "third_place");
  if (!tp || !tp.winnerId) return null;
  return teamById(tp, tp.winnerId);
}

export function isMatchComplete(m: Match): boolean {
  return m.winnerId != null;
}

export function isTied(m: Match): boolean {
  return (
    m.score1 != null &&
    m.score2 != null &&
    m.score1 === m.score2 &&
    m.team1 != null &&
    m.team2 != null
  );
}

export function roundProgress(matches: Match[]) {
  return ROUND_ORDER.map((round) => {
    const rm = matches.filter((m) => m.round === round);
    const done = rm.filter(isMatchComplete).length;
    return { round, done, total: rm.length };
  });
}
