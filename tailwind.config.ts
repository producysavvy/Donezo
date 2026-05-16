import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        line: "#d8dee4",
        paper: "#fbfcfd",
        brand: "#2563eb",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(23, 32, 38, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
