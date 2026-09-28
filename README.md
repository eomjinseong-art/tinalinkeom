This is a [TinaCMS](https://tina.io/) starter project for Vite + React.

## Local Development

Install dependencies and start the dev server (Tina + Vite):

> [!NOTE]  
> [Do you know the best package manager for Node.js?](https://www.ssw.com.au/rules/best-package-manager-for-node/) Using the right package manager can greatly enhance your development workflow. We recommend using pnpm for its speed and efficient handling of dependencies. Learn more about why pnpm might be the best choice for your projects by checking out this rule from SSW.

```
pnpm install
pnpm dev
```

- App: [http://localhost:5173](http://localhost:5173)
- Admin: [http://localhost:5173/admin/index.html](http://localhost:5173/admin/index.html)

### Building (hosted content API)

Copy `.env.example` to `.env`, fill in your values from [app.tina.io](https://app.tina.io), then:

```
pnpm build
```

No credentials yet? `pnpm build-local` builds against local content.

## Link numbers

Each site card has a permanent `id` in [`content/links.json`](content/links.json) (`01`, `02`, …). Three digits are used only after 99. The number is stored on the card. It is not computed from the list index, so adding, removing, or reordering cards does not change existing numbers.

- New cards get one higher than the current maximum (`nextPermanentId`).
- Deleted numbers are never reused.

`/12`, `/012`, and `/n/12` redirect (302) to that card. If the destination has no `utm_*` params yet, the redirect adds `utm_source=tinalink&utm_medium=shortlink&utm_campaign=n12`. `/#12` scrolls to the card on the hub. Edit `content/links.json`, then run `pnpm sync-links` to refresh `vercel.json` and `content/page/home.mdx`. `pnpm build` runs that same generator before Tina and Vite, so a stale mirror does not fail the deploy. `pnpm sync-links -- --check` still exits if the files were not regenerated.

## Deploying

This is a client-side SPA — `pnpm build` produces one `dist/index.html` plus assets, and `react-router` decides routes in the browser. A host that only serves matching files will 404 on a direct hit or refresh of any route but `/`, so a rewrite/fallback to `index.html` is required:

- **Vercel** — `vercel.json` (included) rewrites every path to `/index.html`.
- **Cloudflare Workers** — `wrangler.jsonc` (included) sets `assets.not_found_handling: "single-page-application"`, which does the same thing. Deploy with `npx wrangler deploy` after `pnpm build`.

## Learn More

- [Tina Docs](https://tina.io/docs)
- [Getting Started](https://tina.io/docs/setup-overview/)
- [TinaCMS on GitHub](https://github.com/tinacms/tinacms)
- [Deploy on Vercel](https://tina.io/guides/tina-cloud/add-tinacms-to-existing-site/deployment/)
