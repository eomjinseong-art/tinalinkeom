import raw from "../content/links.json";
import { loadCatalog, type HubLink, type HubSection } from "./shortLinks";

/**
 * Permanent numbers for every hub card.
 * Source of truth: content/links.json — each card stores its own `id`.
 * Ids are not derived from array position.
 *
 * New cards get nextPermanentId() (max id + 1).
 * Deleted numbers are never reused.
 * Adding, removing, or reordering other cards must not change an existing id.
 */
export { nextPermanentId } from "./shortLinks";
export const hubSections: HubSection[] = loadCatalog(raw);
export const hubLinks: HubLink[] = hubSections.flatMap((section) => section.links);
export const hubLinkByNumber = new Map(hubLinks.map((link) => [Number(link.id), link]));

function canonicalHref(href: string): string {
  return href.replace(/\/+$/, "") || "/";
}

export function linkIdForHref(href: string): string | undefined {
  const key = canonicalHref(href);
  // The same site can appear in several places (e.g. a 나두 tab and its original section); use its oldest number.
  const matches = hubLinks.filter((link) => canonicalHref(link.href) === key);
  return matches.sort((a, b) => Number(a.id) - Number(b.id))[0]?.id;
}
