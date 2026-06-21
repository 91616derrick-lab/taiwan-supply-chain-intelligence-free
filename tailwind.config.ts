import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#080b0f",
          panel: "#0d1218",
          panel2: "#101822",
          line: "#22303d",
          muted: "#8b98a8",
          text: "#eef3f8",
          amber: "#d7a84f",
          green: "#60b579",
          red: "#d96c6c",
          blue: "#6aa9d8"
        }
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans TC", "Segoe UI", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
