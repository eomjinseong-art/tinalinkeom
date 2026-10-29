import { createHash, timingSafeEqual } from "node:crypto";
import { TITLE, CHAPTERS } from "./_novel-data.mjs";

const PASSWORD = "8285";
const COOKIE = "scacco_auth";
const TOKEN = createHash("sha256").update("scacco-reader-v1:" + PASSWORD).digest("hex");

function authed(req) {
  const c = req.headers.cookie || "";
  const m = c.match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([a-f0-9]+)"));
  if (!m || m[1].length !== TOKEN.length) return false;
  return timingSafeEqual(Buffer.from(m[1]), Buffer.from(TOKEN));
}
async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? req.body : new URLSearchParams(req.body).toString();
  let d = ""; for await (const ch of req) d += ch; return d;
}
const HEAD = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet">`;

function send(res, status, html) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.end(html);
}

function loginPage(err) {
  return `<!doctype html><html lang="ko"><head>${HEAD}<title>잠긴 책</title><style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4ecd8;font-family:'Noto Serif KR',serif;color:#3b2f22}
form{background:#fffaf0;padding:2.2rem 2rem;border-radius:14px;box-shadow:0 6px 30px #0001;text-align:center;width:min(320px,86vw)}
h1{font-size:1.15rem;margin:0 0 1.2rem}input{font:inherit;font-size:1.2rem;padding:.6rem;width:100%;box-sizing:border-box;border:1px solid #cbb994;border-radius:8px;text-align:center;letter-spacing:.3em;background:#fff}
button{margin-top:1rem;font:inherit;padding:.6rem 1.4rem;border:0;border-radius:8px;background:#6b4f2a;color:#fff;cursor:pointer;width:100%}.e{color:#a33;font-size:.9rem;margin-top:.8rem}</style></head><body>
<form method="post" action="/novel"><h1>비밀번호를 입력하세요</h1><input type="password" name="password" inputmode="numeric" autocomplete="current-password" autofocus required><button>열기</button>${err ? '<div class="e">비밀번호가 맞지 않습니다.</div>' : ""}</form></body></html>`;
}

function readerPage() {
  const toc = CHAPTERS.map((c, i) => `<li><a href="#c${i}" data-i="${i}">${c.t}</a></li>`).join("");
  const secs = CHAPTERS.map((c, i) => `<section id="c${i}" class="ch" hidden><h2>${c.t}</h2>${c.h}</section>`).join("");
  return `<!doctype html><html lang="ko"><head>${HEAD}<title>${TITLE}</title><style>
:root{--bg:#f4ecd8;--fg:#3b2f22;--mut:#8a7a62;--card:#fffaf0;--ln:#e0d3b6;--ac:#8b5e2b;--fs:18px}
[data-theme=light]{--bg:#fff;--fg:#222;--mut:#888;--card:#f7f7f7;--ln:#e5e5e5;--ac:#7a4b1e}
[data-theme=dark]{--bg:#16171a;--fg:#d6d2c8;--mut:#8b877e;--card:#212226;--ln:#33343a;--ac:#d0a86e}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font-family:'Noto Serif KR','Nanum Myeongjo',serif;font-size:var(--fs);line-height:1.9;transition:background .2s,color .2s;-webkit-text-size-adjust:100%}
#bar{position:fixed;top:0;left:0;height:3px;background:var(--ac);width:0;z-index:20}
header{position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--ln);display:flex;align-items:center;gap:.4rem;padding:.45rem .8rem;font-size:14px;line-height:1.3}
header .t{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--mut)}
header button{font:inherit;font-size:14px;background:var(--card);color:var(--fg);border:1px solid var(--ln);border-radius:6px;padding:.3rem .55rem;cursor:pointer}
main{max-width:680px;margin:0 auto;padding:2.5rem 1.4rem 4rem}
.cover{text-align:center;margin:1rem 0 2.5rem}.cover h1{font-size:1.5em;line-height:1.5;margin:0}
h2{font-size:1.3em;line-height:1.55;margin:.5rem 0 2.2rem;text-align:center;font-weight:700}
p{margin:0 0 1.15em;text-align:justify;word-break:keep-all;overflow-wrap:break-word}
blockquote{margin:0 0 2em;padding:.2em 1.1em;border-left:3px solid var(--ac);color:var(--mut);font-size:.95em}
hr{border:0;text-align:center;margin:2em 0}hr:after{content:"◆  ◆  ◆";color:var(--mut);font-size:.7em;letter-spacing:.3em}
nav.pn{display:flex;justify-content:space-between;gap:1rem;margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--ln)}
nav.pn button{font:inherit;font-size:15px;flex:1;padding:.8rem;border-radius:10px;border:1px solid var(--ln);background:var(--card);color:var(--fg);cursor:pointer;line-height:1.4}
nav.pn button:disabled{opacity:.35;cursor:default}
#toc{position:fixed;inset:0;background:#0006;z-index:30;display:none}#toc.on{display:block}
#toc .p{position:absolute;top:0;left:0;bottom:0;width:min(360px,88vw);background:var(--card);overflow:auto;padding:1.2rem 1rem;font-size:15px;line-height:1.5}
#toc ol{list-style:none;padding:0;margin:0}#toc li a{display:block;padding:.65rem .5rem;color:var(--fg);text-decoration:none;border-bottom:1px solid var(--ln)}#toc li a.cur{color:var(--ac);font-weight:700}
@media(max-width:480px){main{padding:1.8rem 1.15rem 3rem}}
</style></head><body>
<div id="bar"></div>
<header><button id="bt">☰ 목차</button><span class="t" id="ht">${TITLE}</span><button id="fm">가−</button><button id="fp">가+</button><button id="th">테마</button></header>
<div id="toc"><div class="p"><strong>목차</strong><ol>${toc}</ol></div></div>
<main><div class="cover"><h1>${TITLE}</h1></div>${secs}
<nav class="pn"><button id="pv">← 이전 장</button><button id="nx">다음 장 →</button></nav></main>
<script>
(function(){
var K='scacco_reader_',S=document.querySelectorAll('.ch'),N=S.length,cur=0,R=document.documentElement;
function g(k,d){try{var v=localStorage.getItem(K+k);return v===null?d:v}catch(e){return d}}
function s(k,v){try{localStorage.setItem(K+k,v)}catch(e){}}
var themes=['sepia','light','dark'],names={sepia:'세피아',light:'밝게',dark:'어둡게'},th=g('theme','sepia'),fs=+g('fs',18);
function applyT(){R.setAttribute('data-theme',th);document.getElementById('th').textContent=names[th]}
function applyF(){R.style.setProperty('--fs',fs+'px');s('fs',fs)}
applyT();applyF();
document.getElementById('th').onclick=function(){th=themes[(themes.indexOf(th)+1)%3];s('theme',th);applyT()};
document.getElementById('fp').onclick=function(){if(fs<26){fs++;applyF()}};
document.getElementById('fm').onclick=function(){if(fs>14){fs--;applyF()}};
var toc=document.getElementById('toc'),links=toc.querySelectorAll('a');
document.getElementById('bt').onclick=function(){toc.classList.add('on')};
toc.onclick=function(e){if(e.target===toc)toc.classList.remove('on')};
links.forEach(function(a){a.onclick=function(e){e.preventDefault();toc.classList.remove('on');show(+a.dataset.i,0)}});
function show(i,y){cur=Math.max(0,Math.min(N-1,i));S.forEach(function(x,j){x.hidden=j!==cur});
document.querySelector('.cover').style.display=cur===0?'':'none';
document.getElementById('pv').disabled=cur===0;document.getElementById('nx').disabled=cur===N-1;
links.forEach(function(a,j){a.classList.toggle('cur',j===cur)});
document.getElementById('ht').textContent=S[cur].querySelector('h2').textContent;
history.replaceState(null,'','#c'+cur);s('ch',cur);
requestAnimationFrame(function(){window.scrollTo(0,y||0);prog()})}
document.getElementById('pv').onclick=function(){show(cur-1,0)};
document.getElementById('nx').onclick=function(){show(cur+1,0)};
var bar=document.getElementById('bar'),t;
function prog(){var h=document.documentElement.scrollHeight-innerHeight,f=h>0?scrollY/h:1;bar.style.width=(((cur+Math.min(1,f))/N)*100).toFixed(2)+'%'}
addEventListener('scroll',function(){prog();clearTimeout(t);t=setTimeout(function(){var h=document.documentElement.scrollHeight-innerHeight;s('pos',h>0?(scrollY/h).toFixed(4):0)},200)},{passive:true});
addEventListener('resize',prog);
var m=location.hash.match(/^#c(\\d+)$/),start=m?+m[1]:+g('ch',0),pos=(!m||+m[1]===+g('ch',-1))?+g('pos',0):0;
show(start,0);
setTimeout(function(){var h=document.documentElement.scrollHeight-innerHeight;window.scrollTo(0,pos*h);prog()},120);
addEventListener('keydown',function(e){if(e.key==='ArrowRight')show(cur+1,0);if(e.key==='ArrowLeft')show(cur-1,0)});
})();
</script></body></html>`;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const pw = new URLSearchParams(await readBody(req)).get("password") || "";
    if (pw.trim() === PASSWORD) {
      res.statusCode = 303;
      res.setHeader("Set-Cookie", `${COOKIE}=${TOKEN}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
      res.setHeader("Location", "/novel");
      res.setHeader("Cache-Control", "no-store");
      return res.end();
    }
    return send(res, 401, loginPage(true));
  }
  if (!authed(req)) return send(res, 401, loginPage(false));
  return send(res, 200, readerPage());
}
