import { PERFUMES, SEASONS, SITUATIONS, DISCLOSURE } from "./perfumes.js";

const $ = (sel, root = document) => root.querySelector(sel);
const situationLabel = (id) => SITUATIONS.find((item) => item.id === id)?.label ?? id;
const seasonLabel = (id) => SEASONS.find((item) => item.id === id)?.label ?? id;

function checked(name) {
  return document.querySelector(`#picker input[name="${name}"]:checked`)?.value;
}

function readQuery() {
  const situation = checked("situation") || "office";
  const season = checked("season") || "spring";
  const min = $("#tmin");
  const max = $("#tmax");
  if (Number(min.value) > Number(max.value)) {
    const active = document.activeElement;
    if (active === min) max.value = min.value;
    else min.value = max.value;
  }
  return { situation, season, tMin: Number(min.value), tMax: Number(max.value) };
}

function scoreOf(perfume, query) {
  let score = 0;
  const bits = [];
  if (perfume.situations.includes(query.situation)) {
    score += 6;
    bits.push(perfume.reasons[query.situation]);
  } else {
    score -= 1;
    bits.push(perfume.reasons[query.situation]);
  }
  if (perfume.seasons.includes(query.season)) {
    score += 3;
  } else {
    score -= 1;
  }
  const [lo, hi] = perfume.temp;
  const overlap = Math.min(hi, query.tMax) - Math.max(lo, query.tMin);
  if (overlap > 0) {
    const asked = Math.max(1, query.tMax - query.tMin);
    score += Math.round(4 * Math.min(1, overlap / asked));
    bits.push(`편한 기온 ${lo}–${hi}°C와 겹칩니다.`);
  } else {
    score -= 3;
    bits.push(`편한 기온은 ${lo}–${hi}°C입니다.`);
  }
  return { score, reason: bits.filter(Boolean).slice(0, 2).join(" ") };
}

function recommend() {
  const query = readQuery();
  $("#tmin-val").textContent = `${$("#tmin").value}°C`;
  $("#tmax-val").textContent = `${$("#tmax").value}°C`;
  const ranked = PERFUMES.map((perfume) => ({ perfume, ...scoreOf(perfume, query) })).sort(
    (a, b) => b.score - a.score || a.perfume.name.localeCompare(b.perfume.name),
  );
  const top = ranked.slice(0, 3);
  const weak = top[0].score < 4;
  const intro = weak
    ? `${situationLabel(query.situation)}, ${seasonLabel(query.season)}, ${query.tMin}–${query.tMax}°C. 이 14병 안에서는 아래가 가장 가깝습니다.`
    : `${situationLabel(query.situation)}, ${seasonLabel(query.season)}, ${query.tMin}–${query.tMax}°C에 맞춰 이 컬렉션에서 골랐습니다.`;
  $("#results").innerHTML = `<h3>이 컬렉션에서</h3><p class="source-note">${intro}</p>${top
    .map(
      (item, index) => `<a class="result" href="#${item.perfume.id}">
        <span class="rank">${index + 1}</span>
        <span><strong>${item.perfume.brandKo} ${item.perfume.nameKo}</strong><p>${item.reason}</p></span>
      </a>`,
    )
    .join("")}`;
  document.querySelectorAll(".card").forEach((card) => {
    const hit = top.findIndex((item) => item.perfume.id === card.dataset.id);
    card.classList.toggle("is-pick", hit >= 0);
    const mark = card.querySelector(".pick-mark");
    if (mark) mark.hidden = hit < 0;
    if (mark && hit >= 0) mark.textContent = `추천 ${hit + 1}`;
  });
}

function wire() {
  $("#picker").addEventListener("submit", (event) => event.preventDefault());
  document.querySelectorAll("#picker input").forEach((input) => {
    input.addEventListener("input", recommend);
    input.addEventListener("change", recommend);
  });
  document.querySelectorAll("[data-temp]").forEach((button) => {
    button.addEventListener("click", () => {
      const [min, max] = button.dataset.temp.split(",").map(Number);
      $("#tmin").value = String(min);
      $("#tmax").value = String(max);
      recommend();
    });
  });
  recommend();
}

function visits() {
  const slot = $("#visits");
  if (!slot) return;
  const hosts = ["nadoo-perfume.vercel.app"];
  const test =
    navigator.webdriver ||
    /headless|bot|crawler|spider|lighthouse/i.test(navigator.userAgent) ||
    !hosts.includes(location.hostname);
  const key = "nadoo-perfume-visit-day";
  const today = new Date().toLocaleDateString("en-CA");
  let last = null;
  try {
    last = localStorage.getItem(key);
  } catch {
    /* ignore */
  }
  const path = test || last === today ? "get" : "hit";
  fetch(`https://abacus.jasoncameron.dev/${path}/nadoo-perfume/visits`)
    .then((res) => (res.ok ? res.json() : Promise.reject(res)))
    .then((data) => {
      if (typeof data.value !== "number") return;
      slot.hidden = false;
      $("#visit-count").textContent = data.value.toLocaleString("ko-KR");
      if (!test && last !== today) localStorage.setItem(key, today);
    })
    .catch(() => {
      /* decorative */
    });
}

document.querySelectorAll(".disclosure").forEach((node) => {
  if (!node.textContent.trim()) node.textContent = DISCLOSURE;
});
wire();
visits();
