import path from "path";
import type { UserConfig } from "vitepress";
import { rawResolver } from "./raw_resolver";
import { mlogjsOutput } from "./md_plugins/mlogjs_output";
import { commandExample } from "./md_plugins/command_example";

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
      { text: "Examples", link: "/examples/" },
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
      "/examples/": [
        { text: "Examples", link: "/examples/" },
        { text: "3D cube", link: "/examples/3dcube" },
        { text: "Bounce", link: "/examples/bounce" },
        { text: "Breakout", link: "/examples/breakout" },
        { text: "Clock", link: "/examples/clock" },
        { text: "Fibonacci", link: "/examples/fibonacci" },
        { text: "Pascal's Triangle", link: "/examples/pascals_triangle" },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/mlogjs/mlogjs" },
      { icon: "discord", link: "https://discord.gg/98KWSSUPVj" },
    ],
  },
  markdown: {
    theme: {
      dark: "dark-plus",
      light: "light-plus",
    },
    config(md) {
      md.use(mlogjsOutput);
      md.use(commandExample);
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
