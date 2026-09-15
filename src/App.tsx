import { createBrowserRouter, RouterProvider, Link, useLoaderData, useParams, type LoaderFunctionArgs } from "react-router-dom";
import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
import { tinaField, useTina } from "tinacms/dist/react";
import client from "../tina/__generated__/client";
import { VisitCounter } from "./VisitCounter";
import "./App.css";

type AstNode = {
  type?: string;
  text?: string;
  bold?: boolean;
  url?: string;
  children?: AstNode[];
};

const load = ({ params }: LoaderFunctionArgs) =>
  client.queries.page({ relativePath: `${params.slug ?? "home"}.mdx` });

function astToText(node: AstNode | AstNode[] | undefined): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(astToText).join("");
  if (typeof node.text === "string") return node.text;
  return astToText(node.children);
}

function findUrl(node: AstNode | AstNode[] | undefined): string | null {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const url = findUrl(child);
      if (url) return url;
    }
    return null;
  }
  if (node.type === "a" && node.url) return node.url;
  return findUrl(node.children);
}

function isBoldHeading(node: AstNode): boolean {
  const kids = (node.children ?? []).filter((child) => astToText(child).trim());
  return kids.length > 0 && kids.every((child) => Boolean(child.bold));
}

function LinkCard({ href, label }: { href: string; label: string }) {
  return (
    <a className="link-card" href={href} target="_blank" rel="noopener noreferrer">
      <span className="link-label">{label}</span>
      <span className="link-arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}

const markdownComponents: Components<{}> = {
  h1: (props) => <h2 className="section-title">{props?.children}</h2>,
  h2: (props) => <h2 className="section-title">{props?.children}</h2>,
  h3: (props) => <h2 className="section-title">{props?.children}</h2>,
  bold: (props) => <h2 className="section-title">{props?.children}</h2>,
  a: (props) => (
    <a className="link-card" href={props?.url} target="_blank" rel="noopener noreferrer">
      <span className="link-label">{props?.children || props?.url}</span>
      <span className="link-arrow" aria-hidden="true">
        →
      </span>
    </a>
  ),
};

function BioContent({ body }: { body: AstNode | null | undefined }) {
  const nodes = Array.isArray(body) ? body : body?.children;
  if (!nodes?.length) {
    return <TinaMarkdown content={body as never} components={markdownComponents} />;
  }

  return (
    <>
      {nodes.map((node, index) => {
        if (node.type && /^h[1-6]$/.test(node.type)) {
          return (
            <h2 key={index} className="section-title">
              {astToText(node)}
            </h2>
          );
        }

        if (node.type === "p") {
          const href = findUrl(node);
          const text = astToText(node).replace(/\\:/g, ":").replace(/\\\./g, ".").trim();
          if (href) {
            const label = text.replace(href, "").trim() || href;
            return <LinkCard key={index} href={href} label={label} />;
          }
          if (isBoldHeading(node) && text) {
            return (
              <h2 key={index} className="section-title">
                {text}
              </h2>
            );
          }
        }

        return <TinaMarkdown key={index} content={[node] as never} components={markdownComponents} />;
      })}
    </>
  );
}

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
          <BioContent body={data.page.body} />
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

const router = createBrowserRouter([
  { path: "/", loader: load, element: <Page /> },
  { path: "/:slug", loader: load, element: <Page /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
