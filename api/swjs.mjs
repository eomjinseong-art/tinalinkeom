import { EPS } from "./_swjs-data.mjs";

const SITE = "쉽재성 · 쉽고 재미있는 성경이야기";
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
@media(max-width:480px){body{font-size:19px}}
</style>`;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const TAIL = `<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script><script defer src="/_vercel/insights/script.js"></script><script>(function(){var B="https://abacus.jasoncameron.dev/hit/tinalinkeom/",d=new Date(),day=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);function once(sk,k){try{if(localStorage.getItem(sk)===day)return;localStorage.setItem(sk,day)}catch(e){}fetch(B+k).catch(function(){})}once("abacus:tinalinkeom:visits:day","visits");once("abacus:tinalinkeom:swjs:day","swjs")})();</script>`;

function send(res, status, html) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.end(html);
}
const page = (title, body) => `<!doctype html><html lang="ko"><head>${HEAD}<title>${esc(title)}</title>${CSS}</head><body><main>${body}</main>${TAIL}</body></html>`;
const item = (e) => `<li><a href="/swjs/${e.n}"><small>제${e.n}편</small><br><strong>${esc(e.b)}</strong><br><small>${esc(e.s)}</small></a></li>`;

function index() {
  return page(SITE, `<h1>📖 ${SITE}</h1><p class="intro">성경 66권을 한 권에 한 편씩, 영화 줄거리처럼 쉽고 재미있게 풀어 쓴 이야기예요. 초등학생도 읽을 수 있어요. 창세기부터 요한계시록까지, 한 편씩 읽어 보세요!</p>
<h2>구약 39권</h2><ol class="toc">${EPS.slice(0, 39).map(item).join("")}</ol>
<h2>신약 27권</h2><ol class="toc">${EPS.slice(39).map(item).join("")}</ol>`);
}
function episode(e) {
  const p = EPS[e.n - 2], n = EPS[e.n];
  const nav = `<nav class="pn">${p ? `<a href="/swjs/${p.n}">← 이전<br>${esc(p.b)}</a>` : `<span>← 이전</span>`}<a href="/swjs">☰ 목차</a>${n ? `<a href="/swjs/${n.n}">다음 →<br>${esc(n.b)}</a>` : `<span>다음 →</span>`}</nav>`;
  return page(`${e.t} · 쉽재성`, `<div class="top"><a href="/swjs">쉽재성</a> · ${e.n <= 39 ? "구약" : "신약"} ${e.n}/66</div><h1>${esc(e.t)}</h1>${e.h}${nav}`);
}
export default async function handler(req, res) {
  const raw = (req.query && req.query.n) || new URL(req.url, "http://x").searchParams.get("n");
  if (!raw) return send(res, 200, index());
  const n = parseInt(raw, 10);
  const e = EPS.find((x) => x.n === n);
  if (!e || String(n) !== String(raw)) return send(res, 404, page("없는 페이지 · 쉽재성", `<h1>찾는 이야기가 없어요</h1><p><a href="/swjs">목차로 가기</a></p>`));
  return send(res, 200, episode(e));
}
