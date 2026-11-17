const COUPANG_CARD_URL = "https://link.coupang.com/a/hsdzLh1vB6";
const COPY = "링크는 여기 다 모았으니, 장바구니는 쿠팡에 모아 보세요";
const DISCLOSURE =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

/** 허브 홈 링크 목록 아래용 쿠팡 파트너스 카드 (광고). */
export function CoupangCard() {
  return (
    <aside className="coupang-card" aria-label="광고">
      <a
        className="coupang-card-link"
        href={COUPANG_CARD_URL}
        target="_blank"
        rel="sponsored noopener"
        aria-label={`광고: ${COPY} — 쿠팡에서 보기 (새 창)`}
        data-coupang-card=""
      >
        <span className="link-main">
          <span className="coupang-card-label">광고</span>
          <span className="link-copy">
            <span className="link-label">{COPY}</span>
          </span>
        </span>
        <span className="link-arrow" aria-hidden="true">
          →
        </span>
      </a>
      <p className="coupang-card-notice">{DISCLOSURE}</p>
    </aside>
  );
}
