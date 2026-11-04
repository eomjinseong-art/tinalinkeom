import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COUPANG_HOME,
  DISCLOSURE,
  IMAGE_CREDIT,
  PERFUMES,
  SEASONS,
  SITE_URL,
  SITUATIONS,
  coupangSearch,
} from "./perfumes.js";

const dir = dirname(fileURLToPath(import.meta.url));

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bottle(perfume) {
  const fill = perfume.tint;
  const stroke = perfume.ink || "#2a2622";
  const glass = perfume.tint === "#efe8dc" ? "#d9cbb8" : fill;
  const shine = `<rect x="30" y="34" width="7" height="48" rx="3" fill="#fff" opacity="0.28"/>`;
  const cap = `<rect x="30" y="6" width="20" height="12" rx="2" fill="${stroke}"/>`;
  const body = {
    slab: `<rect x="18" y="20" width="44" height="88" rx="4" fill="${glass}" stroke="${stroke}" stroke-width="2"/>`,
    cylinder: `<rect x="22" y="20" width="36" height="88" rx="18" fill="${glass}" stroke="${stroke}" stroke-width="2"/>`,
    oval: `<ellipse cx="40" cy="66" rx="22" ry="40" fill="${glass}" stroke="${stroke}" stroke-width="2"/>`,
    flask: `<path d="M30 20 h20 v16 c14 10 18 22 18 36 c0 22 -12 38 -28 38 s-28 -16 -28 -38 c0 -14 4 -26 18 -36 z" fill="${glass}" stroke="${stroke}" stroke-width="2"/>`,
  }[perfume.shape];
  return `<svg viewBox="0 0 80 120" aria-hidden="true">${cap}${body}${shine}</svg>`;
}

function notes(perfume) {
  if (perfume.notesMode === "materials") {
    return `<p class="materials"><strong>공식 원료</strong> ${perfume.materials.map(esc).join(" · ")}</p>
      <div class="notes" aria-label="탑, 하트, 베이스">
        <div><h4>탑</h4><p>브랜드 미공개</p></div>
        <div><h4>하트</h4><p>브랜드 미공개</p></div>
        <div><h4>베이스</h4><p>브랜드 미공개</p></div>
      </div>`;
  }
  const heads =
    perfume.notesMode === "sequence"
      ? ["먼저", "이어서", "나중에"]
      : ["탑", "하트", "베이스"];
  const cols = [perfume.top, perfume.heart, perfume.base];
  return `<div class="notes" aria-label="${heads.join(", ")}">
    ${heads
      .map(
        (head, index) =>
          `<div><h4>${head}</h4><p>${cols[index].map(esc).join(", ")}</p></div>`,
      )
      .join("")}
  </div>`;
}

function card(perfume, index) {
  const shop = coupangSearch(perfume.query);
  return `<article class="card" id="${esc(perfume.id)}" data-id="${esc(perfume.id)}">
    <div class="bottle">${bottle(perfume)}</div>
    <div class="card-body">
      <p class="card-kicker">${String(index + 1).padStart(2, "0")} · ${esc(perfume.brandKo)} <span class="pick-mark" hidden>추천</span></p>
      <h3>${esc(perfume.name)}</h3>
      <p class="ko">${esc(perfume.nameKo)} · ${esc(perfume.concentration)}${perfume.year ? ` · ${esc(perfume.year)}` : ""}</p>
      <div class="meta"><span>${esc(perfume.family)}</span><span>${esc(perfume.when)}</span></div>
      <p class="character">${esc(perfume.character)}</p>
      ${notes(perfume)}
      <p class="source-note">${esc(perfume.notesLabel)}</p>
      <ul class="sources">${perfume.sources
        .map(
          (source) =>
            `<li><a href="${esc(source.href)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a></li>`,
        )
        .join("")}</ul>
      <div class="shop-row">
        <a class="shop" href="${esc(shop)}" target="_blank" rel="sponsored nofollow noopener noreferrer">[광고] 쿠팡에서 검색</a>
        <p class="disclosure">${esc(DISCLOSURE)}</p>
      </div>
    </div>
    <p class="credit">${esc(IMAGE_CREDIT)}</p>
  </article>`;
}

const choices = (name, items, checked) =>
  items
    .map(
      (item) =>
        `<label><input type="radio" name="${name}" value="${item.id}" ${item.id === checked ? "checked" : ""}> ${item.label}</label>`,
    )
    .join("");

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "나두향수",
  inLanguage: "ko",
  url: `${SITE_URL}/`,
  description: "향수 14병의 브랜드, 계열, 노트, 계절과 상황을 모아 두고, 그 안에서만 고르는 추천.",
  about: PERFUMES.map((perfume) => ({
    "@type": "Product",
    name: `${perfume.brand} ${perfume.name} ${perfume.concentration}`.trim(),
    brand: perfume.brand,
    category: perfume.family,
  })),
};

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>나두향수 — 14병 노트와 상황 추천</title>
  <meta name="description" content="샤넬 블루 드 샤넬부터 산타 마리아 노벨라 타바코 토스카노까지 향수 14병. 노트, 계열, 계절과 기온으로 이 컬렉션 안에서만 고릅니다.">
  <link rel="canonical" href="${SITE_URL}/">
  <meta property="og:title" content="나두향수">
  <meta property="og:description" content="향수 14병의 노트와, 출근·데이트·모임·비 오는 날 추천.">
  <meta property="og:image" content="${SITE_URL}/og.svg">
  <meta property="og:url" content="${SITE_URL}/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ko_KR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="robots" content="index,follow">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&display=swap">
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <header class="mast">
    <div class="wrap mast-inner">
      <div>
        <p class="brand-kicker">Nadoo Perfume</p>
        <h1>나두향수</h1>
        <p class="lede">가지고 있는 14병만 적었습니다. 브랜드가 공개한 노트와, 출근·데이트·모임·비 오는 날 그리고 계절·기온으로 이 안에서만 고릅니다.</p>
      </div>
      <p class="visit" id="visits" hidden><span aria-hidden="true">👁</span> <span id="visit-count"></span></p>
    </div>
  </header>
  <div class="ad-strip">
    <div class="wrap ad-strip-inner">
      <p><span class="ad-badge">[광고]</span> <a class="ad-home" href="${esc(COUPANG_HOME)}" target="_blank" rel="sponsored nofollow noopener noreferrer">쿠팡에서 둘러보기</a></p>
      <p class="disclosure">${esc(DISCLOSURE)}</p>
    </div>
  </div>
  <main class="wrap">
    <form class="picker" id="picker">
      <h2>오늘 뭐 뿌리지</h2>
      <p class="picker-help">상황, 계절, 기온 범위를 고르면 이 14병 중에서만 이유를 붙여 추천합니다.</p>
      <div class="controls">
        <fieldset class="field">
          <legend>상황</legend>
          <div class="choices">${choices("situation", SITUATIONS, "office")}</div>
        </fieldset>
        <fieldset class="field">
          <legend>계절</legend>
          <div class="choices">${choices("season", SEASONS, "spring")}</div>
        </fieldset>
        <fieldset class="field temp-field">
          <legend>기온 범위</legend>
          <div class="temp-row">
            <label>최저 <strong id="tmin-val">15°C</strong><input id="tmin" name="tmin" type="range" min="-5" max="40" value="15"></label>
            <span class="tilde" aria-hidden="true">–</span>
            <label>최고 <strong id="tmax-val">24°C</strong><input id="tmax" name="tmax" type="range" min="-5" max="40" value="24"></label>
          </div>
          <div class="presets">
            <button type="button" data-temp="-5,5">영하·한파</button>
            <button type="button" data-temp="6,14">쌀쌀</button>
            <button type="button" data-temp="15,22">선선</button>
            <button type="button" data-temp="23,28">따뜻</button>
            <button type="button" data-temp="29,36">더움</button>
          </div>
        </fieldset>
      </div>
      <div class="results" id="results" aria-live="polite"></div>
    </form>
    <div class="catalog-head">
      <h2>열네 병</h2>
      <p>노트는 각 카드의 출처를 따릅니다.</p>
    </div>
    <div class="grid">
      ${PERFUMES.map(card).join("\n")}
    </div>
  </main>
  <div class="ad-foot">
    <div class="wrap ad-foot-inner">
      <p><span class="ad-badge">[광고]</span> <a href="${esc(COUPANG_HOME)}" target="_blank" rel="sponsored nofollow noopener noreferrer">쿠팡 파트너스</a></p>
      <p class="disclosure">${esc(DISCLOSURE)}</p>
    </div>
  </div>
  <footer class="wrap site-footer">
    <nav aria-label="나두">
      <a href="https://tinalinkeom.vercel.app/">나두 허브</a>
      <a href="https://nadoo-arts.vercel.app/">나두예술</a>
      <a href="https://nadoo-musical.vercel.app/">나두뮤지컬</a>
    </nav>
    <p>추천은 이 목록 밖 향수를 가져오지 않습니다. 기온과 자리는 향의 성격으로 맞춘 제안입니다.</p>
  </footer>
  <script type="module" src="/app.js"></script>
</body>
</html>
`;

if (PERFUMES.length !== 14) {
  throw new Error(`expected 14 perfumes, got ${PERFUMES.length}`);
}
for (const perfume of PERFUMES) {
  const url = coupangSearch(perfume.query);
  if (!url.includes("lptag=AF9731569") || !url.includes("pageKey=")) {
    throw new Error(`bad shop link for ${perfume.id}`);
  }
  if (!perfume.reasons.office || !perfume.reasons.date || !perfume.reasons.gathering || !perfume.reasons.rain) {
    throw new Error(`missing reasons for ${perfume.id}`);
  }
}
writeFileSync(join(dir, "index.html"), html);
console.log(`wrote index.html (${PERFUMES.length} cards)`);
