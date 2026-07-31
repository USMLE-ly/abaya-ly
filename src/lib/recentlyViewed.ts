import { useState, useEffect } from "react";

const STORAGE_KEY = "nadine-recently-viewed";
const MAX_ITEMS = 8;

function load(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

let listeners: Array<() => void> = [];
let current = load();

function notify() {
  for (const fn of listeners) fn();
}

export function trackProductView(id: string) {
  current = [id, ...current.filter((x) => x !== id)].slice(0, MAX_ITEMS);
  save(current);
  notify();
}

export function getRecentIds(): string[] {
  return [...current];
}

export function useRecentlyViewed(): { ids: string[] } {
  const [ids, setIds] = useState(current);

  useEffect(() => {
    const handler = () => setIds([...current]);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  return { ids };
}
