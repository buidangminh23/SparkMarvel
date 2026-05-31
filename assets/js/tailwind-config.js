document.documentElement.classList.add("js");

tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1C1A17", soft: "#403A32" },
        muted: "#6F6A60",
        line: "#E7DFD3",
        paper: "#FFFFFF",
        cream: "#FAF6EF",
        sand: "#F1E9DC",
        accent: {
          DEFAULT: "#C2410C",
          hover: "#9A3412",
          soft: "#F6E5D8",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightish: "-0.02em",
      },
      boxShadow: {
        soft: "0 18px 48px -24px rgba(28, 26, 23, 0.22)",
        lift: "0 30px 60px -28px rgba(28, 26, 23, 0.32)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        floatY: "floatY 7s ease-in-out infinite",
      },
    },
  },
};
