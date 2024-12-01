import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import run from "@rollup/plugin-run";

const isProd = process.env.NODE_ENV === "prod";

export default {
  input: "app/index.ts",
  output: {
    file: "dist/server.js",
    format: "cjs",
  },
  plugins: [
    typescript(),
    isProd ? terser() : run(),
    copy({
      targets: [
        { src: "app/.env", dest: "dist/" },
        { src: "package.json", dest: "dist/" },
      ],
    }),
  ],
};
