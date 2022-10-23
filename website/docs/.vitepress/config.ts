import type { UserConfig } from "vitepress";
import { rawResolver } from "./raw_resolver";

const config: UserConfig = {
  title: "MlogJS",
  description: "Compile javascript into mlog",
  base: "/mlogjs/",

  themeConfig: {
    logo: "/logo.png",
    outline: [2, 3],
    editLink: {
      pattern: "https://github.com/mlogjs/mlogjs/website/docs/:path",
    },
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "Editor", link: "/editor" },
      {
        text: "Resources",
        items: [
          {
            text: "Examples",
            link: "https://github.com/mlogjs/mlogjs/tree/main/compiler/test/examples",
          },
          { text: "Discord", link: "https://discord.gg/xjJFpERd" },
        ],
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Typescript support", link: "/guide/typescript" },
          ],
        },
        {
          text: "User API",
          items: [
            { text: "Data Types", link: "/guide/data-types" },
            { text: "Namespaces", link: "/guide/namespaces" },
            { text: "Helper methods", link: "/guide/helper-methods" },
            { text: "Commands", link: "/guide/commands" },
            { text: "Memory API", link: "/guide/memory-api" },
            { text: "Supported Syntax", link: "/guide/syntax-support" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/mlogjs/mlogjs" }],
  },
  markdown: {
    theme: "dark-plus",
  },
  lastUpdated: true,
  head: [["link", { rel: "icon", type: "image/png", href: "/logo.png" }]],
  vite: {
    define: {
      "process.env": {},
    },
    server: {
      fs: {
        allow: ["../../node_modules", "../../compiler"],
      },
    },
    plugins: [rawResolver()],
  },
};

export default config;
