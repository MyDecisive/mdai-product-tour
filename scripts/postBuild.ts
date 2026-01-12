import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const toAbsolute = (p: string) => path.resolve(__dirname, p);

const index = fs.readFileSync(toAbsolute("../dist/index.html"), "utf-8");

(() => {
  const argv = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.split("=");
      return [k.replace(/^-+/, ""), v];
    })
  );
  const prerenderEnv =
    (argv.env || process.env.PRERENDER_ENV) ??
    process.env.NODE_ENV ??
    "staging";

  let updatedHtml = index;

  if (prerenderEnv !== "production") {
    updatedHtml = index.replace(
      `<!--app-robot-->`,
      `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">`
    );
  }

  const filePath = `../dist/index.html`;

  const absolutePath = toAbsolute(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, updatedHtml);
})();
