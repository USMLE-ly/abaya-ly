import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "nadine-wishlist";

function loadWishlist(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

let listeners: Array<() => void> = [];
let currentIds = loadWishlist();

function notify() {
  for (const fn of listeners) fn();
}

export function addToWishlist(id: string) {
  if (!currentIds.includes(id)) {
    currentIds = [...currentIds, id];
    saveWishlist(currentIds);
    notify();
  }
}

export function removeFromWishlist(id: string) {
  currentIds = currentIds.filter((i) => i !== id);
  saveWishlist(currentIds);
  notify();
}

export function toggleWishlist(id: string) {
  if (currentIds.includes(id)) removeFromWishlist(id);
  else addToWishlist(id);
}

export function isInWishlist(id: string): boolean {
  return currentIds.includes(id);
}

export function getWishlistIds(): string[] {
  return [...currentIds];
}

export function useWishlist(): { ids: string[]; toggle: (id: string) => void; isIn: (id: string) => boolean } {
  const [ids, setIds] = useState(currentIds);

  useEffect(() => {
    const handler = () => setIds([...currentIds]);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  return {
    ids,
    toggle: toggleWishlist,
    isIn: isInWishlist,
  };
}
