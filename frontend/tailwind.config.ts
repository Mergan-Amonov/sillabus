import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E0F2F7",
          100: "#BAE6F5",
          500: "#0E9DC0",
          600: "#0E7490",
          700: "#0C647E",
        },
        accent: {
          50: "#FEF3C7",
          100: "#FDE68A",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        sidebar: {
          bg: "#0F3460",
          active: "#0E7490",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      backgroundColor: {
        page: "#F8F7F5",
      },
      borderColor: {
        warm: "#E4E2DC",
      },
    },
  },
  plugins: [],
};

export default config;
