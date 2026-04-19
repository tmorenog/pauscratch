export type Round =
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "third_place"
  | "final";

export const ROUND_ORDER: Round[] = [
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "third_place",
  "final",
];

export const ROUND_LABELS: Record<Round, string> = {
  round_of_16: "Round of 16",
  quarterfinal: "Quarterfinals",
  semifinal: "Semifinals",
  third_place: "Third-Place Match",
  final: "Final",
};

export type DecidedBy = "regular" | "extra_time" | "penalties";

export interface Team {
  id: string;
  name: string;
  code: string; // 3-letter ISO code
  flag: string; // emoji flag
}

export interface MatchMeta {
  stadium: string;
  city: string;
  country: string;
  date?: string; // ISO string or human readable
}

export type MatchSlot = "team1" | "team2";

export interface Match {
  id: string;
  round: Round;
  matchNumber: number;
  team1: Team | null;
  team2: Team | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  loserId: string | null;
  decidedBy: DecidedBy | null;
  stadium: string;
  city: string;
  country: string;
  date?: string;
  /** Where the winner of this match advances. */
  nextMatchId: string | null;
  nextMatchSlot: MatchSlot | null;
  /** Where the loser of this match goes (used for semifinals -> third place). */
  loserNextMatchId?: string | null;
  loserNextMatchSlot?: MatchSlot | null;
}

export interface TournamentData {
  name: string;
  matches: Match[];
}
