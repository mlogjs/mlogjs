import { UserConfig } from "vitepress";

const config: UserConfig = {
  title: "MlogJS",
  description: "Compile javascript into mlog",
  base: "/mlogjs/",

  themeConfig: {
    logo: "/logo.png",
    outline: [2, 3],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Getting Started", link: "/getting-started" },
          { text: "Typescript support", link: "/typescript" },
        ],
      },
      {
        text: "User API",
        items: [
          { text: "Data Types", link: "/data-types" },
          { text: "Namespaces", link: "/namespaces" },
          { text: "Helper methods", link: "/helper-methods" },
          { text: "Commands", link: "/commands" },
          { text: "Memory API", link: "/memory-api" },
          { text: "Supported Syntax", link: "/syntax-support" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/mlogjs/mlogjs" }],
  },
  markdown: {
    theme: "dark-plus",
  },
  lastUpdated: true,
  vite: {
    server: {
      fs: {
        allow: ["../../node_modules", "../"],
      },
    },
  },
};

export default config;
