/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: "#2EF3D0",
        blue: "#2B8EF7",
        deep: "#1D60BD",

        background: {
          DEFAULT: "#04070C",
          soft: "#0D1420",
          elevated: "#111827",
        },

        text: {
          DEFAULT: "#E9F4FF",
          muted: "#9CAEC4",
          soft: "#6B7C8F",
        },

        border: "#1F2937",

        success: "#4ADE80",
        warning: "#FACC15",
        error: "#EF4444",
      },

      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "sans-serif",
        ],
        display: ["DM Sans", "Poppins", "system-ui", "sans-serif"],
      },

      backgroundImage: {
        "innernode-gradient":
          "linear-gradient(135deg, #2EF3D0 0%, #2B8EF7 40%, #1D60BD 80%)",
      },

      boxShadow: {
        aura: "0 0 20px #2EF3D0, 0 0 40px #2B8EF7",
      },
    },
  },
  plugins: [],
};
