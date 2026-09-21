import { useEffect } from "react";
import { Link } from "react-router-dom";
import { VisitCounter } from "./VisitCounter";

/** Drop the finished PDF at `public/guides/nadoo-github-guide.pdf`. */
export const EBOOK_PDF_HREF = "/guides/nadoo-github-guide.pdf";
const EBOOK_PDF_FILENAME = "nadoo-github-guide.pdf";

const PAGE_TITLE = "나두Ai 「AI 하는 사람을 위한 깃허브 초간단」 전자책 소개 (무료)";

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
            계정 만들기부터 올리고 공유하기까지, AI 작업에 필요한 GitHub만 짧게 정리했어요.
          </p>
        </header>
        <main className="content">
          <a className="download-btn" href={EBOOK_PDF_HREF} download={EBOOK_PDF_FILENAME}>
            무료 PDF 다운로드
          </a>

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
