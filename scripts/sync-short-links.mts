import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildRedirects,
  destinationForPath,
  loadCatalog,
  matchShortLinkNumber,
  withShortLinkUtm,
} from "../src/shortLinks.ts";

const root = resolve(import.meta.dirname, "..");
const check = process.argv.includes("--check");
const catalog = loadCatalog(JSON.parse(readFileSync(resolve(root, "content/links.json"), "utf8")));
const links = catalog.flatMap((section) => section.links);

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

assert(links.length > 0, "Catalog is empty");
assert(matchShortLinkNumber("/ebook") === null, "/ebook must not be a short link");
assert(matchShortLinkNumber("/about") === null, "/about must not be a short link");
assert(matchShortLinkNumber("/12abc") === null, "Mixed paths must not match");
assert(matchShortLinkNumber("/assets/index.js") === null, "Assets must not match");
assert(matchShortLinkNumber("/012") === 12, "/012 should resolve to 12");
assert(matchShortLinkNumber("/n/12") === 12, "/n/12 should resolve to 12");

const card12 = links.find((link) => link.id === "12");
assert(card12, "Card 12 is missing");
const dest12 = destinationForPath("/12", links);
assert(
  dest12 === withShortLinkUtm(card12!.href, "12"),
  "Card 12 destination should include short-link utm params",
);
assert(
  dest12?.includes("utm_source=tinalink") &&
    dest12.includes("utm_medium=shortlink") &&
    dest12.includes("utm_campaign=n12"),
  `Unexpected short-link destination: ${dest12}`,
);
assert(
  withShortLinkUtm("https://example.com/?utm_source=keep", "12") === "https://example.com/?utm_source=keep",
  "Existing utm params must be left untouched",
);

const redirects = buildRedirects(links);
const sources = new Set(redirects.map((row) => row.source));
for (const link of links) {
  const n = Number(link.id);
  assert(sources.has(`/${n}`), `Missing /${n}`);
  assert(sources.has(`/n/${n}`), `Missing /n/${n}`);
  assert(sources.has(`/${String(n).padStart(3, "0")}`), `Missing padded path for ${link.id}`);
}
assert(redirects.every((row) => row.statusCode === 302), "Short links must be 302");
assert(!sources.has("/ebook") && !sources.has("/about"), "Named routes must stay untouched");

function parseHomeMdx(source: string): { title: string; links: { title: string; hint?: string; href: string }[] }[] {
  const text = source.replace(/<!--[\s\S]*?-->/g, "");
  const sections: { title: string; links: { title: string; hint?: string; href: string }[] }[] = [];
  let current: (typeof sections)[number] | null = null;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const heading = /^\*\*(.+)\*\*$/.exec(trimmed);
    if (heading?.[1]) {
      current = { title: heading[1], links: [] };
      sections.push(current);
      continue;
    }
    const link = /^\[(.+)\]\((.+)\)$/.exec(trimmed);
    if (link?.[1] && link[2] && current) {
      const parts = link[1].split(/\s+[—–-]\s+/);
      const title = parts[0]?.trim() ?? "";
      const hint = parts.length >= 2 ? parts.slice(1).join(" — ").trim() : undefined;
      current.links.push({ title, hint: hint || undefined, href: link[2] });
    }
  }
  return sections;
}

const homeMdxPath = resolve(root, "content/page/home.mdx");
const homeMdx = `${[
  "<!--",
  "Permanent card numbers live in content/links.json (01, 02, …; three digits only after 99).",
  "New cards get max(id)+1. Deleted numbers are never reused. Do not renumber existing cards.",
  "-->",
  "",
  ...catalog.flatMap((section) => [
    `**${section.title}**`,
    "",
    ...section.links.flatMap((link) => {
      const label = link.hint ? `${link.title} — ${link.hint}` : link.title;
      return [`[${label}](${link.href})`, ""];
    }),
  ]),
].join("\n")}`;

const parsedHome = parseHomeMdx(homeMdx);
assert(parsedHome.length === catalog.length, "Generated home.mdx did not round-trip");
for (let i = 0; i < catalog.length; i += 1) {
  const expected = catalog[i];
  const actual = parsedHome[i];
  assert(expected && actual && expected.title === actual.title, `Section mismatch at ${expected?.title}`);
  assert(expected.links.length === actual.links.length, `Link count mismatch in ${expected.title}`);
  for (let j = 0; j < expected.links.length; j += 1) {
    const want = expected.links[j];
    const got = actual.links[j];
    assert(
      want &&
        got &&
        want.title === got.title &&
        (want.hint ?? "") === (got.hint ?? "") &&
        want.href === got.href,
      `Generated home.mdx does not match ${want?.id} ${want?.title}`,
    );
  }
}

const vercelPath = resolve(root, "vercel.json");
const current = JSON.parse(readFileSync(vercelPath, "utf8")) as {
  $schema?: string;
  rewrites?: unknown;
};
const next = {
  $schema: current.$schema,
  redirects,
  rewrites: current.rewrites,
};
const text = `${JSON.stringify(next, null, 2)}\n`;
const existingVercel = readFileSync(vercelPath, "utf8");
const existingHome = readFileSync(homeMdxPath, "utf8");
const stale = existingVercel !== text || existingHome !== homeMdx;
if (check && stale) {
  console.error("Short-link files are out of date. Run pnpm sync-links.");
  process.exit(1);
}
if (!check && stale) {
  if (existingVercel !== text) writeFileSync(vercelPath, text);
  if (existingHome !== homeMdx) writeFileSync(homeMdxPath, homeMdx);
}

console.log(`Short links ok (${links.length} cards, ${redirects.length} redirects).`);
