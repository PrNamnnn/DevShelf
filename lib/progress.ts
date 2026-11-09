"use client";

import { useSyncExternalStore } from "react";

/** Reading state lives only in this browser, under one versioned key. */
const STORAGE_KEY = "devshelf:progress:v1";

export interface Progress {
  learned: string[];
  bookmarks: string[];
  lastRead: string | null;
}

const EMPTY: Progress = { learned: [], bookmarks: [], lastRead: null };

let snapshot: Progress | null = null;
const listeners = new Set<() => void>();

function load(): Progress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): Progress {
  snapshot ??= load();
  return snapshot;
}

function update(change: (current: Progress) => Progress) {
  snapshot = change(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable; the state still works for this page view.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = null;
    listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

function toggled(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function toggleCompleted(id: string) {
  update((current) => ({ ...current, learned: toggled(current.learned, id) }));
}

export function toggleBookmark(id: string) {
  update((current) => ({ ...current, bookmarks: toggled(current.bookmarks, id) }));
}

export function recordRead(id: string) {
  if (getSnapshot().lastRead === id) return;
  update((current) => ({ ...current, lastRead: id }));
}

/** Only lessons that exist count, so renamed or removed lessons can't inflate a percentage. */
export function completion(lessonIds: string[], learned: string[]) {
  const finished = new Set(learned);
  const done = lessonIds.filter((id) => finished.has(id)).length;
  const total = lessonIds.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
