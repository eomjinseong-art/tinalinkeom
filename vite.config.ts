import type { ServerResponse } from "node:http";
import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { hubLinks } from "./src/linkCatalog";
import { destinationForPath } from "./src/shortLinks";

function shortLinkPlugin(): Plugin {
  const handler: Connect.NextHandleFunction = (req, res: ServerResponse, next) => {
    const pathname = (req.url ?? "").split("?")[0] ?? "";
    const dest = destinationForPath(pathname, hubLinks);
    if (!dest) {
      next();
      return;
    }
    res.statusCode = 302;
    res.setHeader("Location", dest);
    res.end();
  };

  return {
    name: "tinalink-short-links",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), shortLinkPlugin()],
});
