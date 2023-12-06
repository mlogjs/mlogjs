// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme";

import "./vars.css";
import type { Theme } from "vitepress";
import posthog from "posthog-js";

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (import.meta.env.SSR) return;
    const token = import.meta.env.VITE_POSTHOG_TOKEN;
    if (!token) return;

    posthog.init(token, {
      api_host: "https://app.posthog.com",
      autocapture: false,
    });

    router.onAfterRouteChanged = () => {
      posthog.capture("$pageview");
    };
  },
};

export default theme;
