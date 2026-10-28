"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AgentUserContext } from "@/lib/agent/types";

export type UserKeys = NonNullable<AgentUserContext["userKeys"]>;
export type KeyProvider = keyof UserKeys;
interface AgentConfigContextValue {
  keys: UserKeys;
  setKey: (provider: KeyProvider, value: string) => void;
  clearKeys: () => void;
}
const AgentConfigContext = createContext<AgentConfigContextValue | null>(null);
const STORAGE_KEY = "frooty_provider_keys_v1";

function loadPersistedKeys(): UserKeys {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const record = parsed as Record<string, unknown>;
    const keys: UserKeys = {};
    for (const provider of ["openai", "gemini", "groq", "openrouter"] as const) {
      const value = record[provider];
      if (typeof value === "string" && value.trim().length >= 8 && value.length <= 512) keys[provider] = value.trim();
    }
    return keys;
  } catch {
    return {};
  }
}

export default function AgentConfigProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<UserKeys>(loadPersistedKeys);

  useEffect(() => {
    try {
      const entries = Object.entries(keys).filter(([, value]) => typeof value === "string" && value.trim());
      if (entries.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Private browsing etc: keys simply won't persist.
    }
  }, [keys]);

  const setKey = useCallback((provider: KeyProvider, value: string) => {
    const cleaned = value.trim();
    setKeys((current) => {
      const next = { ...current };
      if (cleaned) next[provider] = cleaned;
      else delete next[provider];
      return next;
    });
  }, []);
  const clearKeys = useCallback(() => {
    setKeys({});
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);
  const value = useMemo(() => ({ keys, setKey, clearKeys }), [keys, setKey, clearKeys]);
  return <AgentConfigContext.Provider value={value}>{children}</AgentConfigContext.Provider>;
}

export function useAgentConfig() {
  const context = useContext(AgentConfigContext);
  if (!context) throw new Error("useAgentConfig must be used inside AgentConfigProvider");
  return context;
}
