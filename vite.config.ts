import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteYaml from "@modyfi/vite-plugin-yaml";
import { VitePluginRadar } from "vite-plugin-radar";


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envVars = loadEnv(mode, process.cwd());
  return {
    plugins: [
      react(),
      viteYaml(),
      VitePluginRadar({
        enableDev: false,
        analytics: [
        {
          id: envVars.VITE_GOOGLE_ANALYTICS_KEY,
          // FIXME: DO NOT PROD THIS
          consentDefaults: {
            ad_storage: 'granted',
            analytics_storage: 'granted'
          },
        }
      ],
      }),
    ],
  };
})
