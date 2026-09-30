import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { hubLinkByNumber, hubSections } from "./linkCatalog";
import { parseLinkNumber } from "./shortLinks";
import { HubAccordion } from "./HubAccordion";
import { SiteLinkCard } from "./SiteLinkCard";

const MISSING_NUMBER = "없는 번호입니다.";

function revealLinkCard(card: HTMLElement): void {
  let node: HTMLElement | null = card.parentElement;
  while (node) {
    if (node instanceof HTMLDetailsElement) node.open = true;
    if (node.hidden) node.hidden = false;
    node = node.parentElement;
  }

  const accordionPanel = card.closest<HTMLElement>("[data-accordion-panel]");
  if (accordionPanel?.id) {
    const toggle = document.querySelector<HTMLElement>(
      `[data-accordion-tab][aria-controls="${CSS.escape(accordionPanel.id)}"]`,
    );
    if (toggle && toggle.getAttribute("aria-expanded") === "false") toggle.click();
  }

  const panel = card.closest<HTMLElement>('[role="tabpanel"]');
  if (!panel?.id) return;
  const tab = document.querySelector<HTMLElement>(
    `[role="tab"][aria-controls="${CSS.escape(panel.id)}"]`,
  );
  if (tab && tab.getAttribute("aria-selected") === "false") tab.click();
}

export function focusLinkByNumber(n: number): boolean {
  const card = document.querySelector<HTMLElement>(`[data-link-id="${n}"]`);
  if (!card) return false;
  revealLinkCard(card);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.requestAnimationFrame(() => {
    card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    card.classList.remove("link-card-highlight");
    void card.offsetWidth;
    card.classList.add("link-card-highlight");
    const clear = () => card.classList.remove("link-card-highlight");
    card.addEventListener("animationend", clear, { once: true });
    window.setTimeout(clear, 1800);
    card.focus({ preventScroll: true });
  });
  return true;
}

/** `#12`, `#012`, and `#link-12` scroll to that card. Other hashes are ignored. */
export function numberFromHash(hash: string): number | null | undefined {
  let raw = hash.replace(/^#/, "").trim();
  if (!raw) return undefined;
  try {
    raw = decodeURIComponent(raw);
  } catch {
    return undefined;
  }
  raw = raw.replace(/^link-/i, "").replace(/번$/, "").trim();
  if (!/^\d+$/.test(raw)) return undefined;
  return parseLinkNumber(raw);
}

export function LinkHub() {
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function applyHash() {
      const parsed = numberFromHash(window.location.hash);
      if (parsed === undefined) return;
      if (parsed == null || !focusLinkByNumber(parsed)) setError(MISSING_NUMBER);
      else setError("");
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseLinkNumber(inputRef.current?.value ?? "");
    if (parsed == null || !hubLinkByNumber.has(parsed)) {
      setError(MISSING_NUMBER);
      return;
    }
    setError("");
    const hash = `#${parsed}`;
    if (window.location.hash === hash) focusLinkByNumber(parsed);
    else window.location.hash = hash;
  }

  return (
    <>
      <form className="link-finder" onSubmit={onSubmit}>
        <label className="link-finder-label" htmlFor="link-number-query">
          번호로 찾기
        </label>
        <div className="link-finder-row">
          <input
            ref={inputRef}
            id="link-number-query"
            name="link-number"
            inputMode="numeric"
            enterKeyHint="go"
            autoComplete="off"
            placeholder="12"
            maxLength={4}
            aria-describedby={error ? "link-number-error" : undefined}
          />
          <button type="submit">이동</button>
        </div>
        {error ? (
          <p id="link-number-error" className="link-finder-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
      <div className="bio-links">
        {hubSections.map((section) => (
          <Fragment key={section.title}>
            <h2 className="section-title">{section.title}</h2>
            {section.intro ? <p className="section-intro">{section.intro}</p> : null}
            {section.tabs ? (
              <HubAccordion section={{ ...section, tabs: section.tabs }} />
            ) : (
              section.links
                .filter((link) => !link.hidden)
                .map((link) => (
                  <SiteLinkCard
                    key={link.id}
                    id={link.id}
                    title={link.title}
                    hint={link.hint}
                    href={link.href}
                    spotlight={link.spotlight}
                  />
                ))
            )}
          </Fragment>
        ))}
      </div>
    </>
  );
}

export function MissingNumberPage() {
  return (
    <div className="page-shell">
      <div className="bio-card">
        <header className="hero">
          <div className="avatar" aria-hidden="true">
            🔗
          </div>
          <h1 className="hero-title">Links</h1>
        </header>
        <p className="link-finder-error missing-number" role="alert">
          {MISSING_NUMBER}
        </p>
        <p className="missing-number-home">
          <Link to="/">전체 링크로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
