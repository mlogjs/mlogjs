import { UserConfig } from "vitepress";

const config: UserConfig = {
  title: "MlogJS",
  description: "Compile javascript into mlog",
  base: "/mlogjs/",

  themeConfig: {
    logo: "/logo.png",
    outline: [2, 3],
    nav: [
      { text: "Docs", link: "/guide/" },
      { text: "Editor", link: "/editor" },
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
  vite: {
    server: {
      fs: {
        allow: ["../../node_modules"],
      },
    },
  },
};

export default config;
