import { createBrowserRouter, RouterProvider, Link, useLoaderData, useParams, type LoaderFunctionArgs } from "react-router-dom";
import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
import { tinaField, useTina } from "tinacms/dist/react";
import client from "../tina/__generated__/client";
import "./App.css";

const load = ({ params }: LoaderFunctionArgs) =>
  client.queries.page({ relativePath: `${params.slug ?? "home"}.mdx` });

function childrenToText(children: unknown): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (typeof children === "object" && children !== null && "props" in children) {
    return childrenToText((children as { props?: { children?: unknown } }).props?.children);
  }
  return "";
}

function parseLinkParagraph(text: string): { label: string; href: string } | null {
  const cleaned = text.replace(/\\:/g, ":").replace(/\\\./g, ".").trim();
  const m = cleaned.match(/^(.*?)\s+(https?:\/\/\S+)\s*$/);
  if (!m) return null;
  return { label: m[1].trim(), href: m[2].trim() };
}

function isBoldNode(node: unknown): boolean {
  if (typeof node !== "object" || node === null || !("type" in node)) return false;
  const type = (node as { type?: unknown }).type;
  if (type === "strong" || type === "b") return true;
  if (typeof type === "function") {
    const name = (type as { displayName?: string; name?: string }).displayName || (type as { name?: string }).name;
    return /bold/i.test(name || "");
  }
  return false;
}

function isHeadingParagraph(children: unknown): boolean {
  const list = Array.isArray(children) ? children : [children];
  const meaningful = list.filter((child) => childrenToText(child).trim().length > 0);
  return meaningful.length > 0 && meaningful.every(isBoldNode);
}

const markdownComponents: Components<{}> = {
  h1: (props) => <h2 className="section-title">{props?.children}</h2>,
  h2: (props) => <h2 className="section-title">{props?.children}</h2>,
  h3: (props) => <h2 className="section-title">{props?.children}</h2>,
  bold: (props) => <strong>{props?.children}</strong>,
  p: (props) => {
    const text = childrenToText(props?.children);
    const link = parseLinkParagraph(text);
    if (link) {
      return (
        <a className="link-card" href={link.href} target="_blank" rel="noopener noreferrer">
          <span className="link-label">{link.label}</span>
          <span className="link-arrow" aria-hidden="true">
            →
          </span>
        </a>
      );
    }
    if (!text.trim()) return null;
    if (isHeadingParagraph(props?.children)) {
      return <h2 className="section-title">{text}</h2>;
    }
    return <p className="body-text">{props?.children}</p>;
  },
  a: (props) => (
    <a className="link-card" href={props?.url} target="_blank" rel="noopener noreferrer">
      <span className="link-label">{props?.children || props?.url}</span>
      <span className="link-arrow" aria-hidden="true">
        →
      </span>
    </a>
  ),
};

function Page() {
  const { slug } = useParams();
  const { data } = useTina(useLoaderData() as Awaited<ReturnType<typeof load>>);
  const isAbout = slug === "about";

  return (
    <div className="page-shell">
      <div className="bio-card">
        <header className="hero">
          <div className="avatar" aria-hidden="true">
            {isAbout ? "👋" : "🔗"}
          </div>
          <h1 className="hero-title">{isAbout ? "About" : "Links"}</h1>
          {!isAbout && <p className="hero-sub">프로젝트 · 블로그 · 유튜브 모음</p>}
        </header>
        <main className="content" data-tina-field={tinaField(data.page, "body")}>
          <TinaMarkdown content={data.page.body} components={markdownComponents} />
        </main>
      </div>
      <footer className="footer">
        <Link to="/">Home</Link>
        <span aria-hidden="true">·</span>
        <Link to="/about">About</Link>
        <span aria-hidden="true">·</span>
        <a href="/admin/index.html">Admin</a>
      </footer>
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/", loader: load, element: <Page /> },
  { path: "/:slug", loader: load, element: <Page /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
