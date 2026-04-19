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

export interface BracketProfile {
  id: string;
  name: string;
  avatar: string; // emoji
  color: string;  // hex string used as accent
  matches: Match[];
  createdAt: number;
}

export interface AppState {
  version: 2;
  activeProfileId: string;
  profiles: BracketProfile[];
}

export const AVATAR_OPTIONS = [
  "⚽", "🏆", "🦁", "🐯", "🐉", "🦅", "🐺", "🦊",
  "🐼", "🐸", "🦄", "🐙", "🦖", "🐝", "🌟", "⚡",
  "🔥", "🚀", "💎", "🎯", "🎮", "🎸", "🎲", "🍕",
];

export const PROFILE_COLORS = [
  "#2563eb", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#16a34a", // green
  "#f97316", // orange
  "#06b6d4", // cyan
  "#eab308", // gold
  "#dc2626", // red
];
