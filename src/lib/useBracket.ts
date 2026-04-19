"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getInitialMatches,
  randomFill,
  randomPick,
  resetAll,
  setMatchResult,
  type SetResultOptions,
} from "./bracket";
import {
  AVATAR_OPTIONS,
  PROFILE_COLORS,
  type AppState,
  type BracketProfile,
  type Match,
} from "./types";

const STORAGE_KEY = "paus-worldcup-bracket:v2";
const LEGACY_KEY = "paus-worldcup-bracket:v1";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function makeProfile(
  name: string,
  avatar = AVATAR_OPTIONS[0],
  color = PROFILE_COLORS[0],
  matches: Match[] = getInitialMatches(),
): BracketProfile {
  return {
    id: uid(),
    name: name.trim() || "Player",
    avatar,
    color,
    matches,
    createdAt: Date.now(),
  };
}

function defaultState(): AppState {
  const pau = makeProfile("Pau", "⚽", PROFILE_COLORS[0]);
  return {
    version: 2,
    activeProfileId: pau.id,
    profiles: [pau],
  };
}

function loadFromStorage(): AppState | null {
  if (typeof window === "undefined") return null;

  // Try v2 first
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && parsed.version === 2 && Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        return parsed;
      }
    }
  } catch {
    /* fall through */
  }

  // Migrate v1 if present
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const matches = JSON.parse(raw) as Match[];
      if (Array.isArray(matches)) {
        const pau = makeProfile("Pau", "⚽", PROFILE_COLORS[0], matches);
        return { version: 2, activeProfileId: pau.id, profiles: [pau] };
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}

function saveToStorage(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Read an inbound shared bracket from `?bracket=<base64-json>` and return the
 * decoded matches if valid. Removes the param from the URL after reading.
 */
function consumeSharedBracket(): Match[] | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("bracket");
    if (!raw) return null;
    const json = atob(decodeURIComponent(raw));
    const parsed = JSON.parse(json) as Match[];
    if (!Array.isArray(parsed)) return null;
    // Strip the param so it doesn't re-import on refresh
    params.delete("bracket");
    const newSearch = params.toString();
    const newUrl =
      window.location.pathname +
      (newSearch ? `?${newSearch}` : "") +
      window.location.hash;
    window.history.replaceState({}, "", newUrl);
    return parsed;
  } catch {
    return null;
  }
}

export function useBracket() {
  const [state, setState] = useState<AppState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [pendingShare, setPendingShare] = useState<Match[] | null>(null);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) setState(stored);
    const shared = consumeSharedBracket();
    if (shared) setPendingShare(shared);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(state);
  }, [state, hydrated]);

  const activeProfile = useMemo<BracketProfile>(() => {
    return (
      state.profiles.find((p) => p.id === state.activeProfileId) ??
      state.profiles[0]
    );
  }, [state]);

  const matches = activeProfile.matches;

  const updateActive = useCallback((mutator: (p: BracketProfile) => BracketProfile) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId ? mutator(p) : p,
      ),
    }));
  }, []);

  const updateMatch = useCallback(
    (id: string, opts: SetResultOptions) => {
      updateActive((p) => ({ ...p, matches: setMatchResult(p.matches, id, opts) }));
    },
    [updateActive],
  );

  const reset = useCallback(() => {
    updateActive((p) => ({ ...p, matches: resetAll() }));
  }, [updateActive]);

  const importJSON = useCallback(
    (json: string) => {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          updateActive((p) => ({ ...p, matches: parsed as Match[] }));
          return true;
        }
      } catch {
        /* noop */
      }
      return false;
    },
    [updateActive],
  );

  const exportJSON = useCallback(() => JSON.stringify(matches, null, 2), [matches]);

  const surpriseMe = useCallback(
    (replaceExisting = false) => {
      updateActive((p) => ({ ...p, matches: randomFill(p.matches, replaceExisting) }));
    },
    [updateActive],
  );

  const pickRandom = useCallback(
    (matchId: string) => {
      updateActive((p) => ({ ...p, matches: randomPick(p.matches, matchId) }));
    },
    [updateActive],
  );

  // ----- Profile management -----

  const switchProfile = useCallback((id: string) => {
    setState((prev) =>
      prev.profiles.some((p) => p.id === id)
        ? { ...prev, activeProfileId: id }
        : prev,
    );
  }, []);

  const addProfile = useCallback(
    (
      name: string,
      avatar: string,
      color: string,
      seedFromActive = false,
    ): string => {
      let newId = "";
      setState((prev) => {
        const seedMatches = seedFromActive
          ? prev.profiles.find((p) => p.id === prev.activeProfileId)?.matches ??
            getInitialMatches()
          : getInitialMatches();
        const profile = makeProfile(
          name,
          avatar,
          color,
          // deep-ish clone via JSON to make sure profiles never share refs
          JSON.parse(JSON.stringify(seedMatches)) as Match[],
        );
        newId = profile.id;
        return {
          ...prev,
          activeProfileId: profile.id,
          profiles: [...prev.profiles, profile],
        };
      });
      return newId;
    },
    [],
  );

  const renameProfile = useCallback(
    (id: string, name: string, avatar: string, color: string) => {
      setState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === id
            ? {
                ...p,
                name: name.trim() || p.name,
                avatar,
                color,
              }
            : p,
        ),
      }));
    },
    [],
  );

  const deleteProfile = useCallback((id: string) => {
    setState((prev) => {
      if (prev.profiles.length <= 1) return prev; // keep at least one
      const remaining = prev.profiles.filter((p) => p.id !== id);
      const activeId =
        prev.activeProfileId === id ? remaining[0].id : prev.activeProfileId;
      return { ...prev, activeProfileId: activeId, profiles: remaining };
    });
  }, []);

  // ----- Sharing -----

  const buildShareUrl = useCallback((): string => {
    if (typeof window === "undefined") return "";
    const json = JSON.stringify(matches);
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?bracket=${encoded}`;
  }, [matches]);

  const acceptShared = useCallback(
    (name: string, avatar: string, color: string): string | null => {
      if (!pendingShare) return null;
      let newId = "";
      setState((prev) => {
        const profile = makeProfile(
          name || "Shared",
          avatar,
          color,
          pendingShare,
        );
        newId = profile.id;
        return {
          ...prev,
          activeProfileId: profile.id,
          profiles: [...prev.profiles, profile],
        };
      });
      setPendingShare(null);
      return newId;
    },
    [pendingShare],
  );

  const dismissShared = useCallback(() => setPendingShare(null), []);

  return {
    matches,
    hydrated,
    updateMatch,
    reset,
    importJSON,
    exportJSON,
    surpriseMe,
    pickRandom,

    // profiles
    profiles: state.profiles,
    activeProfile,
    switchProfile,
    addProfile,
    renameProfile,
    deleteProfile,

    // sharing
    buildShareUrl,
    pendingShare,
    acceptShared,
    dismissShared,
  };
}
