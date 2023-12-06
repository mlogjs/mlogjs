/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*!raw" {
  const lib: [string, string][];
  export default lib;
}

interface ImportMetaEnv {
  VITE_POSTHOG_TOKEN?: string;
}
