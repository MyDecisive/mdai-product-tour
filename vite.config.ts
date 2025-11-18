import viteYaml from "@modyfi/vite-plugin-yaml";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePluginRadar } from "vite-plugin-radar";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envVars = loadEnv(mode, process.cwd());
  return {
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      viteYaml(),
      VitePluginRadar({
        enableDev: false,
        analytics: [
          {
            id: envVars.VITE_GOOGLE_ANALYTICS_KEY,
          },
        ],
        gtm: [
          {
            id: envVars.VITE_GOOGLE_ANALYTICS_KEY,
          },
        ],
      }),
    ],
  };
});
