"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getInitialMatches,
  randomFill,
  randomPick,
  resetAll,
  setMatchResult,
  type SetResultOptions,
} from "./bracket";
import type { Match } from "./types";

const STORAGE_KEY = "paus-worldcup-bracket:v1";

function loadFromStorage(): Match[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Match[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(matches: Match[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch {
    // ignore quota errors
  }
}

export function useBracket() {
  const [matches, setMatches] = useState<Match[]>(() => getInitialMatches());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) setMatches(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(matches);
  }, [matches, hydrated]);

  const updateMatch = useCallback((id: string, opts: SetResultOptions) => {
    setMatches((prev) => setMatchResult(prev, id, opts));
  }, []);

  const reset = useCallback(() => {
    setMatches(resetAll());
  }, []);

  const importJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        setMatches(parsed as Match[]);
        return true;
      }
    } catch {
      /* noop */
    }
    return false;
  }, []);

  const exportJSON = useCallback(() => JSON.stringify(matches, null, 2), [matches]);

  const surpriseMe = useCallback((replaceExisting = false) => {
    setMatches((prev) => randomFill(prev, replaceExisting));
  }, []);

  const pickRandom = useCallback((matchId: string) => {
    setMatches((prev) => randomPick(prev, matchId));
  }, []);

  return {
    matches,
    hydrated,
    updateMatch,
    reset,
    importJSON,
    exportJSON,
    surpriseMe,
    pickRandom,
  };
}
