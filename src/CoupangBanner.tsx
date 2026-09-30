const COUPANG_PARTNERS_URL = "https://link.coupang.com/a/hsdzLh1vB6";
const COUPANG_NOTICE =
  "이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

/** 하단 쿠팡 파트너스 배너 (광고). 링크는 수익 추적용이므로 수정하지 마세요. */
export function CoupangBanner({ showNotice = true }: { showNotice?: boolean }) {
  return (
    <aside className="coupang-banner" aria-label="광고">
      <a
        className="coupang-banner-link"
        href={COUPANG_PARTNERS_URL}
        target="_blank"
        rel="sponsored noopener noreferrer nofollow"
      >
        <span className="coupang-banner-label">광고</span>
        <span className="coupang-banner-copy">링크는 여기 다 모았으니, 장바구니는 쿠팡에 모아 보세요</span>
        <span className="coupang-banner-arrow" aria-hidden="true">
          →
        </span>
      </a>
      {showNotice && <p className="coupang-banner-notice">{COUPANG_NOTICE}</p>}
    </aside>
  );
}
