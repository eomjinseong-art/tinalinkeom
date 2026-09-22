import { useEffect } from "react";
import { Link } from "react-router-dom";
import { VisitCounter } from "./VisitCounter";

const EBOOKS = [
  {
    href: "/guides/nadoo-github-guide.pdf",
    filename: "nadoo-github-guide.pdf",
    title: "AI 하는 사람을 위한 깃허브 초간단",
    hint: "무료 PDF 받기",
  },
  {
    href: "/guides/nadoo-vercel-guide.pdf",
    filename: "nadoo-vercel-guide.pdf",
    title: "AI 하는 사람을 위한 Vercel 초간단",
    hint: "무료 PDF 받기",
  },
  {
    href: "/guides/nadoo-cat-guide.pdf",
    filename: "nadoo-cat-guide.pdf",
    title: "첫 고양이 집사 초간단",
    hint: "숨숨마을 · 숨숨위키",
  },
] as const;

/** GitHub guide path — kept for callers that still import the first ebook. */
export const EBOOK_PDF_HREF = EBOOKS[0].href;
export const VERCEL_EBOOK_PDF_HREF = EBOOKS[1].href;
export const CAT_EBOOK_PDF_HREF = EBOOKS[2].href;

const PAGE_TITLE = "나두Ai 전자책모음";

const COUPANG_DISCLOSURE =
  "이 포스팅(페이지)은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

const CTAS = [
  {
    href: "https://b-cat-cpang.vercel.app/",
    title: "숨숨마을",
    hint: "고양이 용품 · 추천",
    featured: true,
  },
  {
    href: "https://car-parts-cpang.vercel.app/",
    title: "오토픽스",
    hint: "자동차용품",
    featured: false,
  },
  {
    href: "https://surfwikikoreacpang.vercel.app/",
    title: "서핑용품",
    hint: "서핑 쇼핑몰",
    featured: false,
  },
] as const;

function CtaCard({ href, title, hint, featured }: (typeof CTAS)[number]) {
  const className = featured ? "link-card link-card-featured" : "link-card";

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      <span className="link-copy">
        <span className="link-label">{title}</span>
        <span className="link-hint">{hint}</span>
      </span>
      <span className="link-arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}

export function EbookPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="page-shell">
      <div className="bio-card">
        <header className="hero">
          <div className="avatar" aria-hidden="true">
            📖
          </div>
          <h1 className="hero-title hero-title-ebook">{PAGE_TITLE}</h1>
          <p className="hero-sub">
            GitHub·Vercel 초간단과 첫 고양이 집사 가이드를 무료 PDF로 받아 보세요.
          </p>
        </header>
        <main className="content">
          <div className="download-list">
            {EBOOKS.map((ebook) => (
              <a
                key={ebook.href}
                className="download-btn"
                href={ebook.href}
                download={ebook.filename}
              >
                <span className="download-btn-title">{ebook.title}</span>
                <span className="download-btn-hint">{ebook.hint}</span>
              </a>
            ))}
          </div>

          <h2 className="section-title">함께 보기</h2>
          <div className="bio-links">
            {CTAS.map((cta) => (
              <CtaCard key={cta.href} {...cta} />
            ))}
          </div>
          <p className="partner-disclosure">{COUPANG_DISCLOSURE}</p>
        </main>
      </div>
      <footer className="footer">
        <VisitCounter />
        <nav className="footer-nav">
          <Link to="/">Home</Link>
          <span aria-hidden="true">·</span>
          <Link to="/about">About</Link>
          <span aria-hidden="true">·</span>
          <a href="/admin/index.html">Admin</a>
        </nav>
      </footer>
    </div>
  );
}
