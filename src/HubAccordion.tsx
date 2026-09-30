import { useState, type CSSProperties } from "react";
import type { HubSection } from "./shortLinks";
import { SiteLinkCard } from "./SiteLinkCard";

/** Accordion tabs for a section with `tabs`: tap a tab to open its links; only one is open at a time. */
export function HubAccordion({ section }: { section: HubSection & { tabs: NonNullable<HubSection["tabs"]> } }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="hub-accordion">
      {section.tabs.map((tab) => {
        const links = section.links.filter((link) => link.tab === tab.key && !link.hidden);
        if (!links.length) return null;
        const expanded = open === tab.key;
        const panelId = `hub-tab-panel-${tab.key}`;
        return (
          <div
            key={tab.key}
            className={expanded ? "hub-tab hub-tab-open" : "hub-tab"}
            style={{ "--tab-color": tab.color } as CSSProperties}
          >
            <button
              type="button"
              className="hub-tab-btn"
              aria-expanded={expanded}
              aria-controls={panelId}
              data-accordion-tab={tab.key}
              onClick={() => setOpen(expanded ? null : tab.key)}
            >
              <span className="hub-tab-emoji" aria-hidden="true">
                {tab.emoji}
              </span>
              <span className="hub-tab-copy">
                <span className="hub-tab-title">{tab.title}</span>
                {tab.hint ? <span className="hub-tab-hint">{tab.hint}</span> : null}
              </span>
              <span className="hub-tab-count">{links.length}</span>
              <span className="hub-tab-chevron" aria-hidden="true">
                ▾
              </span>
            </button>
            <div id={panelId} className="hub-tab-panel" data-accordion-panel hidden={!expanded}>
              {links.map((link) => (
                <SiteLinkCard key={link.id} id={link.id} title={link.title} hint={link.hint} href={link.href} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
