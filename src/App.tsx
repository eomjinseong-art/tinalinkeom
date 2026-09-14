import { createBrowserRouter, RouterProvider, Link, useLoaderData, useParams, type LoaderFunctionArgs } from "react-router-dom";
import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
import { tinaField, useTina } from "tinacms/dist/react";
import client from "../tina/__generated__/client";
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

function isSimpleText(node: AstNode): boolean {
  return node.type === "text" || (typeof node.text === "string" && !node.type);
}

function asLinkCard(node: AstNode): { href: string; label: string } | null {
  const kids = node.children ?? [];
  const links = kids.filter((child) => child.type === "a" && child.url);
  if (links.length !== 1) return null;
  if (!kids.every((child) => child.type === "a" || isSimpleText(child))) return null;
  const href = links[0].url!;
  const label = kids
    .filter((child) => child.type !== "a")
    .map(astToText)
    .join("")
    .replace(/\\:/g, ":")
    .replace(/\\\./g, ".")
    .trim();
  return { href, label: label || astToText(links[0]).trim() || href };
}

function asPlainUrlParagraph(node: AstNode): { href: string; label: string } | null {
  const kids = node.children ?? [];
  if (!kids.length || !kids.every(isSimpleText)) return null;
  const cleaned = astToText(node).replace(/\\:/g, ":").replace(/\\\./g, ".").trim();
  const match = cleaned.match(/^(.*?)\s+(https?:\/\/\S+)\s*$/);
  if (!match || /https?:\/\/\S+/.test(match[1])) return null;
  return { href: match[2], label: match[1].trim() || match[2] };
}

function isBoldHeading(node: AstNode): boolean {
  const kids = (node.children ?? []).filter((child) => astToText(child).trim());
  return kids.length > 0 && kids.every((child) => Boolean(child.bold) && isSimpleText(child));
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
  bold: (props) => <strong>{props?.children}</strong>,
  a: (props) => (
    <a href={props?.url} target="_blank" rel="noopener noreferrer">
      {props?.children || props?.url}
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
          const card = asLinkCard(node) ?? asPlainUrlParagraph(node);
          if (card) {
            return <LinkCard key={index} href={card.href} label={card.label} />;
          }
          if (isBoldHeading(node)) {
            const text = astToText(node).trim();
            if (text) {
              return (
                <h2 key={index} className="section-title">
                  {text}
                </h2>
              );
            }
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
