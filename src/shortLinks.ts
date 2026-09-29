export type HubLink = {
  id: string;
  title: string;
  hint?: string;
  href: string;
  section: string;
  /** Kept for its short URL (/02 etc.) but not shown on the hub page. */
  hidden?: boolean;
};

export type HubSection = {
  title: string;
  links: HubLink[];
};

type RawLink = {
  id?: unknown;
  title?: unknown;
  hint?: unknown;
  href?: unknown;
  hidden?: unknown;
};

/** Two digits through 99. Three digits only after that. */
export function formatLinkId(n: number): string {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Invalid link id ${n}`);
  }
  return n > 99 ? String(n) : String(n).padStart(2, "0");
}

/**
 * Next id for a new card: one higher than the current maximum.
 * Never reuse a deleted number, and never renumber existing cards.
 */
export function nextPermanentId(links: { id: string }[]): string {
  const max = links.reduce((highest, link) => Math.max(highest, Number(link.id)), 0);
  return formatLinkId(max + 1);
}

export function loadCatalog(data: unknown): HubSection[] {
  if (!data || typeof data !== "object" || !("sections" in data) || !Array.isArray(data.sections)) {
    throw new Error("content/links.json must have a sections array");
  }

  const seen = new Set<number>();
  return data.sections.map((section) => {
    if (
      !section ||
      typeof section !== "object" ||
      typeof (section as { title?: unknown }).title !== "string" ||
      !(section as { title: string }).title.trim() ||
      !Array.isArray((section as { links?: unknown }).links)
    ) {
      throw new Error("Each section needs a title and a links array");
    }

    const title = (section as { title: string }).title;
    const links = (section as { links: RawLink[] }).links.map((link) => {
      if (typeof link.id !== "string" || typeof link.title !== "string" || typeof link.href !== "string") {
        throw new Error(`Invalid card in ${title}`);
      }
      if (!/^\d{2,3}$/.test(link.id) || formatLinkId(Number(link.id)) !== link.id) {
        throw new Error(`Card id ${link.id} must be 01, 02, … (three digits only after 99)`);
      }
      const n = Number(link.id);
      if (seen.has(n)) throw new Error(`Duplicate card id ${link.id}`);
      seen.add(n);
      if (!link.title.trim() || !link.href.trim()) {
        throw new Error(`Card ${link.id} needs a title and href`);
      }
      const hint = typeof link.hint === "string" && link.hint.trim() ? link.hint : undefined;
      const hidden = link.hidden === true ? true : undefined;
      return { id: link.id, title: link.title, hint, href: link.href, section: title, hidden };
    });

    return { title, links };
  });
}

/** Accepts "12", "012", or "12번". Returns null when it is not a positive integer. */
export function parseLinkNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(/번$/, "");
  if (!/^\d{1,4}$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

const SHORT_LINK_PATH = /^\/(?:n\/)?(\d+)\/?$/;

/** Pure numeric paths only: /12, /012, /n/12. Leaves /ebook, /about, and assets alone. */
export function matchShortLinkNumber(pathname: string): number | null {
  const match = SHORT_LINK_PATH.exec(pathname);
  if (!match?.[1]) return null;
  const n = Number(match[1]);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

export function withShortLinkUtm(href: string, id: string | number): string {
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const beforeHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const queryIndex = beforeHash.indexOf("?");
  const path = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : "";
  const params = new URLSearchParams(query);
  const hasUtm = [...params.keys()].some((key) => key.toLowerCase().startsWith("utm_"));
  if (!hasUtm) {
    params.set("utm_source", "tinalink");
    params.set("utm_medium", "shortlink");
    params.set("utm_campaign", `n${Number(id)}`);
  }
  const qs = params.toString();
  return `${path}${qs ? `?${qs}` : ""}${hash}`;
}

export function shortLinkPaths(id: string): string[] {
  const n = Number(id);
  const forms = new Set<string>([String(n), formatLinkId(n), String(n).padStart(3, "0")]);
  const paths: string[] = [];
  for (const form of forms) {
    paths.push(`/${form}`, `/n/${form}`);
  }
  return paths;
}

export function destinationForPath(
  pathname: string,
  links: { id: string; href: string }[],
): string | null {
  const n = matchShortLinkNumber(pathname);
  if (n == null) return null;
  const link = links.find((item) => Number(item.id) === n);
  if (!link) return null;
  return withShortLinkUtm(link.href, link.id);
}

export function buildRedirects(links: { id: string; href: string }[]): {
  source: string;
  destination: string;
  statusCode: 302;
}[] {
  const rows: { source: string; destination: string; statusCode: 302 }[] = [];
  const seen = new Set<string>();
  const ordered = [...links].sort((a, b) => Number(a.id) - Number(b.id) || a.id.localeCompare(b.id));
  for (const link of ordered) {
    const destination = withShortLinkUtm(link.href, link.id);
    for (const source of shortLinkPaths(link.id).sort()) {
      if (seen.has(source)) throw new Error(`Duplicate short link path ${source}`);
      seen.add(source);
      rows.push({ source, destination, statusCode: 302 });
    }
  }
  return rows;
}
