import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#627D98",
          500: "#486581",
          600: "#334E68",
          700: "#243B53",
          800: "#102A43",
          900: "#0A2540",
          950: "#061629",
        },
        gold: {
          400: "#E5C158",
          500: "#D4AF37",
          600: "#B8941E",
        },
        mint: {
          400: "#33D4A8",
          500: "#00C896",
          600: "#00A37A",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(10,37,64,0.04), 0 4px 16px rgba(10,37,64,0.06)",
        "card-hover": "0 4px 12px rgba(10,37,64,0.08), 0 12px 32px rgba(10,37,64,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
