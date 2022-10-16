import { UserConfig } from "vite";

const config: UserConfig = {
  server: {
    fs: {
      allow: ["*"],
    },
  },
};
export default config;
