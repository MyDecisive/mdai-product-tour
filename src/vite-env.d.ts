/// <reference types="vite/client" />
// vite-env.d.ts
/// <reference types="@modyfi/vite-plugin-yaml/modules" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_API_URL: string;
  readonly VITE_GOOGLE_ANALYTICS_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
