import {createRequire as __createRequire} from "node:module"; import {fileURLToPath as __fileURLToPath} from "node:url"; import {dirname as __dirnameOf} from "node:path"; const require=__createRequire(import.meta.url); const __filename=__fileURLToPath(import.meta.url); const __dirname=__dirnameOf(__filename);

// OpenClaw-Plugins/lark-project/node_modules/openclaw-lark-patched/bin/openclaw-lark.js
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
var mod = ["child", "process"].join("_");
var { execFileSync } = createRequire(import.meta.url)(`node:${mod}`);
var args = process.argv.slice(2);
var version = "latest";
var vIdx = args.indexOf("--tools-version");
if (vIdx !== -1) {
  version = args[vIdx + 1];
  args.splice(vIdx, 2);
}
var allArgs = ["--yes", "--prefer-online", `@larksuite/openclaw-lark-tools@${version}`, ...args];
try {
  if (process.platform === "win32") {
    const npxCli = join(dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js");
    execFileSync(process.execPath, [npxCli, ...allArgs], {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_OPTIONS: [process.env.NODE_OPTIONS, "--disable-warning=DEP0190"].filter(Boolean).join(" ")
      }
    });
  } else {
    execFileSync("npx", allArgs, { stdio: "inherit" });
  }
} catch (error) {
  process.exit(error.status ?? 1);
}
