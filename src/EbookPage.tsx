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
] as const;

/** GitHub guide path — kept for callers that still import the first ebook. */
export const EBOOK_PDF_HREF = EBOOKS[0].href;
export const VERCEL_EBOOK_PDF_HREF = EBOOKS[1].href;

const PAGE_TITLE = "나두Ai 무료 전자책 — 깃허브 · Vercel 초간단";

const CTAS = [
  {
    href: "https://b-cat-cpang.vercel.app/",
    title: "숨숨마을",
    hint: "고양이 용품 · 추천",
    external: true,
    featured: true,
  },
  {
    href: "https://car-parts-cpang.vercel.app/",
    title: "오토픽스",
    hint: "자동차용품",
    external: true,
    featured: false,
  },
  {
    href: "https://surfwikikoreacpang.vercel.app/",
    title: "서핑용품",
    hint: "서핑 쇼핑몰",
    external: true,
    featured: false,
  },
  {
    href: "/",
    title: "허브 홈",
    hint: "링크 모음",
    external: false,
    featured: false,
  },
] as const;

function CtaCard({
  href,
  title,
  hint,
  external,
  featured,
}: (typeof CTAS)[number]) {
  const className = featured ? "link-card link-card-featured" : "link-card";
  const body = (
    <>
      <span className="link-copy">
        <span className="link-label">{title}</span>
        <span className="link-hint">{hint}</span>
      </span>
      <span className="link-arrow" aria-hidden="true">
        →
      </span>
    </>
  );

  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }

  return (
    <Link className={className} to={href}>
      {body}
    </Link>
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
            계정 만들기부터 올리고 배포하기까지, AI 작업에 필요한 GitHub과 Vercel만 짧게 정리했어요.
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
