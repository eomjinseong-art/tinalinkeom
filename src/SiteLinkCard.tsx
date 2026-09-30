import { Link } from "react-router-dom";

const FEATURED_SHOP_HREF = "https://b-cat-cpang.vercel.app/";

function isFeaturedShop(href: string): boolean {
  return href.replace(/\/+$/, "") === FEATURED_SHOP_HREF.replace(/\/+$/, "");
}

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function SiteLinkCard({
  id,
  title,
  hint,
  href,
  spotlight = false,
}: {
  id?: string;
  title: string;
  hint?: string;
  href: string;
  /** Flagship card (01 나두Ai): large brand-gradient card with a 대표 badge. */
  spotlight?: boolean;
}) {
  const featured = !spotlight && isFeaturedShop(href);
  const className = spotlight
    ? "link-card link-card-spotlight"
    : featured
      ? "link-card link-card-featured"
      : "link-card";
  const body = spotlight ? (
    <>
      <span className="spotlight-top">
        <span className="spotlight-badge">★ 대표</span>
        {id ? <span className="link-id spotlight-id">{id}</span> : null}
      </span>
      <span className="spotlight-title">{title}</span>
      {hint ? <span className="spotlight-hint">{hint}</span> : null}
      <span className="spotlight-cta">
        바로가기 <span aria-hidden="true">→</span>
      </span>
    </>
  ) : (
    <>
      <span className="link-main">
        {id ? <span className="link-id">{id}</span> : null}
        <span className="link-copy">
          <span className="link-label">{title}</span>
          {hint ? <span className="link-hint">{hint}</span> : null}
        </span>
      </span>
      <span className="link-arrow" aria-hidden="true">
        →
      </span>
    </>
  );

  const shared = {
    className,
    id: id ? `link-${id}` : undefined,
    "data-link-id": id ? String(Number(id)) : undefined,
  };

  if (isInternalHref(href)) {
    return (
      <Link {...shared} to={href}>
        {body}
      </Link>
    );
  }

  return (
    <a {...shared} href={href} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  );
}
