// Runs `tinacms build`. TinaCloud checks bot branches (dependabot/renovate)
// against main's indexed schema, so a Tina upgrade that changes the GraphQL
// schema can never pass there. For those preview builds only, skip the cloud
// checks; main/production still runs them.
import { spawnSync } from "node:child_process";

const branch = process.env.VERCEL_GIT_COMMIT_REF ?? "";
const isBotPreview =
  process.env.VERCEL_ENV !== "production" && /^(dependabot|renovate)\//.test(branch);

const args = ["build", ...(isBotPreview ? ["--skip-cloud-checks"] : [])];
if (isBotPreview) {
  console.log(`Bot branch '${branch}': skipping TinaCloud checks (they run on main).`);
}

const result = spawnSync("tinacms", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
