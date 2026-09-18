import { isValidElement, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider, Link, useLoaderData, useParams, type LoaderFunctionArgs } from "react-router-dom";
import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
import { tinaField, useTina } from "tinacms/dist/react";
import client from "../tina/__generated__/client";
import { ContactForm } from "./ContactForm";
import { VisitCounter } from "./VisitCounter";
import "./App.css";

function normalizeUrl(url: string): string {
  return url.replace(/\\:/g, ":").replace(/\\\./g, ".");
}

function splitLabel(label: string): { title: string; hint?: string } {
  const parts = label.split(/\s+[—–-]\s+/);
  if (parts.length >= 2 && parts[0]?.trim()) {
    return { title: parts[0].trim(), hint: parts.slice(1).join(" — ").trim() };
  }
  return { title: label };
}

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

function nodeToText(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement(node)) return nodeToText((node.props as { children?: ReactNode }).children);
  if (typeof node === "object" && ("text" in node || "children" in node)) {
    return astToText(node as AstNode);
  }
  return "";
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
  const { title, hint } = splitLabel(label);
  return (
    <a className="link-card" href={href} target="_blank" rel="noopener noreferrer">
      <span className="link-copy">
        <span className="link-label">{title}</span>
        {hint ? <span className="link-hint">{hint}</span> : null}
      </span>
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
  a: (props) => {
    const href = props?.url ? normalizeUrl(props.url) : "";
    const rawLabel = nodeToText(props?.children).trim() || href;
    return <LinkCard href={href} label={rawLabel} />;
  },
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
          const text = normalizeUrl(astToText(node)).trim();
          if (href) {
            const normalizedHref = normalizeUrl(href);
            const label = text.replace(normalizedHref, "").trim() || normalizedHref;
            return <LinkCard key={index} href={normalizedHref} label={label} />;
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
          {!isAbout && <p className="hero-sub">운영 중인 서비스 · 콘텐츠 · 채널</p>}
        </header>
        <main className="content">
          <div className="bio-links" data-tina-field={tinaField(data.page, "body")}>
            <BioContent body={data.page.body} />
          </div>
          {!isAbout && <ContactForm />}
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
