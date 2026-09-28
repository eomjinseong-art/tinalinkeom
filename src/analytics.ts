import { inject, track } from "@vercel/analytics";

const UTM_SRC_KEY = "utm_src";
const LANDING_SENT_KEY = "landing_sent";

let started = false;

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage — tracking still runs for this view.
  }
}

function clip(value: string): string {
  return value.trim().slice(0, 255);
}

function referrerHostname(): string {
  const referrer = document.referrer;
  if (!referrer) return "";
  try {
    return new URL(referrer).hostname;
  } catch {
    return "";
  }
}

function externalHostname(target: EventTarget | null): string | null {
  const element = target instanceof Element ? target : null;
  const anchor = element?.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return null;

  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!url.hostname || url.hostname === window.location.hostname) return null;
  return url.hostname;
}

function onClickCapture(event: MouseEvent): void {
  const dest = externalHostname(event.target);
  if (!dest) return;

  track("cta_click", {
    dest,
    src: clip(readSession(UTM_SRC_KEY) ?? "") || "none",
  });
}

function startAnalytics(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  // track() drops events until inject() creates the queue. <Analytics /> loads the script.
  inject({ framework: "react" });

  const params = new URLSearchParams(window.location.search);
  const utmSource = clip(params.get("utm_source") ?? "");
  const utmCampaign = clip(params.get("utm_campaign") ?? "");

  if (utmSource) writeSession(UTM_SRC_KEY, utmSource);

  if (readSession(LANDING_SENT_KEY) !== "1") {
    writeSession(LANDING_SENT_KEY, "1");
    track("landing", {
      src: utmSource || referrerHostname() || "none",
      campaign: utmCampaign || "none",
    });
  }

  document.addEventListener("click", onClickCapture, true);
}

startAnalytics();
