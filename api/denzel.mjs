import { readFileSync } from "node:fs";

// Single manuscript. Replace content/denzel.md to update the reader.
const RAW = readFileSync(new URL("../content/denzel.md", import.meta.url), "utf8");

const SITE = "덴젤 워싱턴";
const HEAD = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">`;
const CSS = `<style>
:root{--bg:#fffdf7;--fg:#2b2620;--mut:#7d7366;--card:#fff;--ln:#eadfca;--ac:#c2611f;--ac2:#2f6f8f}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font-family:'Noto Sans KR',sans-serif;font-size:20px;line-height:1.85;-webkit-text-size-adjust:100%}
main{max-width:720px;margin:0 auto;padding:1.5rem 1.2rem 4rem}
a{color:var(--ac2)}h1{font-size:1.45em;line-height:1.45;margin:.5rem 0 1rem}
h2{font-size:1.15em;margin:2rem 0 .8rem;color:var(--ac)}h3{font-size:1.05em;margin:2rem 0 .8rem;color:var(--ac)}
p{margin:0 0 1em;word-break:keep-all;overflow-wrap:break-word}
blockquote{margin:0 0 1em;padding:.6em 1em;background:#fff4e2;border-left:4px solid var(--ac);border-radius:6px}
hr{border:0;text-align:center;margin:1.6em 0}hr:after{content:"✦ ✦ ✦";color:var(--mut);font-size:.7em}
ul{padding-left:1.2em}.intro{color:var(--mut)}
ol.toc{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.5rem}
ol.toc a{display:block;padding:.7rem .8rem;background:var(--card);border:1px solid var(--ln);border-radius:10px;text-decoration:none;color:var(--fg);line-height:1.35;font-size:.9em}
ol.toc small{color:var(--mut)}
nav.pn{display:flex;gap:.5rem;margin-top:2.5rem}nav.pn a,nav.pn span{flex:1;text-align:center;padding:.85rem .4rem;border:1px solid var(--ln);border-radius:12px;background:var(--card);text-decoration:none;color:var(--fg);font-size:.85em;line-height:1.35}
nav.pn span{opacity:.35}.top{font-size:.8em;color:var(--mut)}.top a{color:var(--mut)}
p.rel{margin:1.35rem 0 0;padding:.75rem .95rem;background:var(--card);border:1px solid var(--ln);border-radius:12px;font-size:.82em;line-height:1.55;color:var(--mut)}
p.rel a{font-weight:700;text-decoration:none}p.rel a:hover{text-decoration:underline}
table{width:100%;border-collapse:collapse;font-size:.82em;margin:0 0 1em}th,td{border:1px solid var(--ln);padding:.4rem .55rem;text-align:left;vertical-align:top}th{background:#fff4e2}
@media(max-width:480px){body{font-size:19px}}
</style>`;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const MOVIE = "https://movie-checklist-sigma.vercel.app/";
const PEOPLE = "https://nadoo-people.vercel.app/";
const relatedNote = `<p class="rel"><a href="${MOVIE}" target="_blank" rel="noopener noreferrer">영화 체크리스트</a>에서 출연작을 체크하고, <a href="${PEOPLE}" target="_blank" rel="noopener noreferrer">나두인물</a>에서 다른 인물 이야기도 읽어 보세요.</p>`;
const TAIL = `<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script><script defer src="/_vercel/insights/script.js"></script><script>(function(){var B="https://abacus.jasoncameron.dev/hit/tinalinkeom/",d=new Date(),day=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);function once(sk,k){try{if(localStorage.getItem(sk)===day)return;localStorage.setItem(sk,day)}catch(e){}fetch(B+k).catch(function(){})}once("abacus:tinalinkeom:visits:day","visits");once("abacus:tinalinkeom:denzel:day","denzel")})();</script>`;

function inline(raw) {
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*/g;
  let out = "";
  let last = 0;
  for (const m of raw.matchAll(re)) {
    out += esc(raw.slice(last, m.index));
    if (m[1] != null) {
      out += `<a href="${esc(m[2])}" target="_blank" rel="noopener noreferrer">${esc(m[1])}</a>`;
    } else {
      out += `<strong>${esc(m[3])}</strong>`;
    }
    last = m.index + m[0].length;
  }
  return out + esc(raw.slice(last));
}

function renderTable(rows) {
  const parsed = rows.map((line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim()),
  );
  const sep = (cells) => cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  let body = parsed;
  let head = null;
  if (parsed.length >= 2 && sep(parsed[1])) {
    head = parsed[0];
    body = parsed.slice(2);
  }
  const cell = (tag, text) => `<${tag}>${inline(text)}</${tag}>`;
  const headHtml = head ? `<thead><tr>${head.map((text) => cell("th", text)).join("")}</tr></thead>` : "";
  const bodyHtml = `<tbody>${body
    .filter((cells) => !sep(cells))
    .map((cells) => `<tr>${cells.map((text) => cell("td", text)).join("")}</tr>`)
    .join("")}</tbody>`;
  return `<table>${headHtml}${bodyHtml}</table>`;
}

function renderMd(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let para = [];
  const flush = () => {
    const text = para.join(" ").trim();
    para = [];
    if (text) out.push(`<p>${inline(text)}</p>`);
  };
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      flush();
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      out.push(`<h3>${inline(line.slice(4).trim())}</h3>`);
      i += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      flush();
      const quote = [];
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }
    if (line.trim().startsWith("|")) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i]);
        i += 1;
      }
      out.push(renderTable(rows));
      continue;
    }
    para.push(line.trim());
    i += 1;
  }
  flush();
  return out.join("");
}

function splitHeading(heading) {
  const parts = heading.split(/\s+—\s+/);
  const head = parts[0].trim();
  const sub = parts.slice(1).join(" — ").trim();
  const numbered = /^(\d+장)\.\s+(.+)$/.exec(head);
  if (numbered) return { label: numbered[1], name: numbered[2], sub };
  const appendix = /^(부록\s+\S+)\.\s+(.+)$/.exec(head);
  if (appendix) return { label: appendix[1], name: appendix[2], sub };
  if (sub) return { label: head, name: sub, sub: "" };
  return { label: head, name: head, sub: "" };
}

function parseBook(md) {
  const text = md.replace(/\r\n/g, "\n");
  const chunks = text.split(/^## /m);
  const subtitle = (chunks[1] ?? "").split("\n")[0].trim();
  const introMd = (chunks[1] ?? "").slice((chunks[1] ?? "").indexOf("\n") + 1).trim();
  const chapters = chunks.slice(2).map((block, i) => {
    const nl = block.indexOf("\n");
    const heading = (nl < 0 ? block : block.slice(0, nl)).trim();
    const body = nl < 0 ? "" : block.slice(nl + 1).trim();
    return { n: i + 1, heading, ...splitHeading(heading), h: renderMd(body) };
  });
  return { subtitle, intro: renderMd(introMd), chapters };
}

const BOOK = parseBook(RAW);
const EPS = BOOK.chapters;

function send(res, status, html) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.end(html);
}
const page = (title, body) => `<!doctype html><html lang="ko"><head>${HEAD}<title>${esc(title)}</title>${CSS}</head><body><main>${body}</main>${TAIL}</body></html>`;
const item = (e) => {
  const sub = e.sub ? `<br><small>${esc(e.sub)}</small>` : "";
  return `<li><a href="/denzel/${e.n}"><small>제${e.n}편 · ${esc(e.label)}</small><br><strong>${esc(e.name)}</strong>${sub}</a></li>`;
};
const toc = (list, heading) => (list.length ? `<h2>${esc(heading)}</h2><ol class="toc">${list.map(item).join("")}</ol>` : "");

function index() {
  const front = EPS.filter((e) => e.label === "서문");
  const body = EPS.filter((e) => /^\d+장$/.test(e.label));
  const back = EPS.filter((e) => e.label !== "서문" && !/^\d+장$/.test(e.label));
  return page(`${SITE} · ${BOOK.subtitle}`, `<h1>📖 ${SITE}</h1><p class="intro">${esc(BOOK.subtitle)}</p>
${BOOK.intro}
${relatedNote}
${toc(front, "서문")}${toc(body, `본문 ${body.length}장`)}${toc(back, "에필로그 · 부록")}`);
}
function episode(e) {
  const p = EPS[e.n - 2], n = EPS[e.n];
  const nav = `<nav class="pn">${p ? `<a href="/denzel/${p.n}">← 이전<br>${esc(p.name)}</a>` : `<span>← 이전</span>`}<a href="/denzel">☰ 목차</a>${n ? `<a href="/denzel/${n.n}">다음 →<br>${esc(n.name)}</a>` : `<span>다음 →</span>`}</nav>`;
  return page(`${e.heading} · ${SITE}`, `<div class="top"><a href="/denzel">${SITE}</a> · ${e.n}/${EPS.length}</div><h1>${esc(e.heading)}</h1>${e.h}${nav}${relatedNote}`);
}
export default async function handler(req, res) {
  const raw = (req.query && req.query.n) || new URL(req.url || "/", "http://x").searchParams.get("n");
  if (!raw) return send(res, 200, index());
  const n = parseInt(raw, 10);
  const e = EPS.find((x) => x.n === n);
  if (!e || String(n) !== String(raw)) return send(res, 404, page(`없는 페이지 · ${SITE}`, `<h1>찾는 장이 없어요</h1><p><a href="/denzel">목차로 가기</a></p>`));
  return send(res, 200, episode(e));
}
