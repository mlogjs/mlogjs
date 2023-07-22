import path from "path";
import type { UserConfig } from "vitepress";
import { rawResolver } from "./raw_resolver";
import { mlogjsOutputContainer } from "./mlogjs_output_container";

const base = process.env.BASE ?? "/mlogjs/";

const unreleased = process.env.BUILD_VERSION === "unreleased";

const config: UserConfig = {
  title: unreleased ? "MlogJS (unreleased)" : "MlogJS",
  description: "Compile javascript into mindustry logic code",
  base,

  themeConfig: {
    search: {
      provider: "local",
    },
    logo: "/logo.png",
    outline: [2, 3],
    editLink: {
      pattern: "https://github.com/mlogjs/mlogjs/tree/main/website/docs/:path",
    },
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Editor", link: "/editor" },
      {
        text: "Resources",
        items: [
          {
            text: "Examples",
            link: "https://github.com/mlogjs/mlogjs/tree/main/compiler/test/examples",
          },
          {
            text: "Changelog",
            link: "https://github.com/mlogjs/mlogjs/blob/main/compiler/CHANGELOG.md",
          },
          { text: "Discord", link: "https://discord.gg/98KWSSUPVj" },
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
            { text: "Dynamic Array API", link: "/guide/dynamic-array-api" },
            { text: "Supported Syntax", link: "/guide/syntax-support" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/mlogjs/mlogjs" },
      { icon: "discord", link: "https://discord.gg/98KWSSUPVj" },
    ],
  },
  markdown: {
    theme: "dark-plus",
    config(md) {
      md.use(mlogjsOutputContainer);
    },
    languages: [
      {
        id: "mlog",
        scopeName: "source.mlog",
        path: path.resolve(__dirname, "./langs/mlog.tmLanguage.json"),
      },
    ],
  },
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/png", href: `${base}logo.png` }],
    [
      "meta",
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
  ],
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
