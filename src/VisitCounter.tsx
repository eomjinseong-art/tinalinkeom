import { useEffect, useState } from "react";

const ABACUS_BASE = "https://abacus.jasoncameron.dev";
const NAMESPACE = "tinalinkeom";
const KEY = "visits";
const STORAGE_KEY = "abacus:tinalinkeom:visits:day";

function localDayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readHitDay(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeHitDay(day: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, day);
  } catch {
    // Private mode or blocked storage — still show the fetched count.
  }
}

async function fetchCount(path: "hit" | "get"): Promise<number | null> {
  const response = await fetch(`${ABACUS_BASE}/${path}/${NAMESPACE}/${KEY}`);
  if (!response.ok) return null;
  const data = (await response.json()) as { value?: unknown };
  return typeof data.value === "number" && Number.isFinite(data.value) ? data.value : null;
}

let inflight: Promise<number | null> | null = null;
let cached: number | null | undefined;

function loadVisitCount(): Promise<number | null> {
  if (cached !== undefined) return Promise.resolve(cached);
  if (!inflight) {
    inflight = (async () => {
      const today = localDayKey();
      const alreadyHitToday = readHitDay() === today;
      const value = await fetchCount(alreadyHitToday ? "get" : "hit");
      if (value !== null && !alreadyHitToday) writeHitDay(today);
      cached = value;
      return value;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadVisitCount()
      .then((value) => {
        if (!cancelled) setCount(value);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <p className="visit-counter">
      <span aria-hidden="true">👁</span>
      <span>{count.toLocaleString()}</span>
    </p>
  );
}
