/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Yaser USMLE brand tokens ─────────────────────── */
        "yu-blue": {
          950: "#0A1628",
          900: "#0F2448",
          800: "#153577",
          700: "#1B4FBF",  // brand primary
          600: "#2563EB",
          500: "#3B82F6",  // brand accent
          400: "#60A5FA",
          300: "#93C5FD",
          200: "#BFDBFE",
          100: "#DBEAFE",
          50:  "#EFF6FF",
          DEFAULT: "#1B4FBF",
        },
        "yu-amber": {
          600: "#D97706",
          500: "#F59E0B",
          400: "#FBBf24",
          50:  "#FFFBEB",
          DEFAULT: "#F59E0B",
        },

        /* ── Semantic color aliases referencing CSS vars ─────
           These work for arbitrary color utilities: text-brand, bg-surface, etc. */
        brand: {
          primary:   "var(--color-brand-primary)",
          secondary: "var(--color-brand-secondary)",
          accent:    "var(--color-brand-accent)",
        },

        /* ── Legacy pioneer aliases (do not remove — many
           existing components still use pioneer-* classes) ── */
        "pioneer-orange": "var(--pioneer-orange)",
        "pioneer-bg-dark": "#0F172A",
        "pioneer-card-dark": "#1E293B",
        "pioneer-accent-blue": {
          light:   "var(--pioneer-accent-blue-light)",
          DEFAULT: "var(--pioneer-accent-blue)",
          hover:   "var(--pioneer-accent-blue-hover)",
          active:  "var(--yu-blue-700)",
          dark:    "#1E293B",
        },
        pioneer: {
          orange: {
            light:   "var(--pioneer-orange-light)",
            normal:  "var(--pioneer-orange)",
            hover:   "var(--pioneer-orange-hover)",
            active:  "var(--yu-blue-600)",
            dark:    "var(--yu-blue-950)",
            DEFAULT: "var(--pioneer-orange)",
          },
          "bg-dark":    "#0F172A",
          "card-dark":  "#1E293B",
          "accent-blue": {
            light:   "var(--pioneer-teal-light)",
            normal:  "var(--pioneer-teal)",
            hover:   "var(--pioneer-teal-hover)",
            active:  "var(--yu-blue-600)",
            dark:    "#1E293B",
            DEFAULT: "var(--pioneer-teal)",
          },
          teal: {
            light:   "var(--pioneer-teal-light)",
            normal:  "var(--pioneer-teal)",
            hover:   "var(--pioneer-teal-hover)",
            active:  "var(--yu-blue-600)",
            dark:    "#1E293B",
            DEFAULT: "var(--pioneer-teal)",
          },
          navy:      { DEFAULT: "#1E293B" },
          accent:    { blue: "var(--pioneer-teal)" },
          primary:   "var(--pioneer-orange)",
          secondary: "var(--pioneer-teal)",
          light: {
            bg:            "#F8FAFD",
            card:          "#FFFFFF",
            textPrimary:   "#0F172A",
            textSecondary: "#475569",
          },
          dark: {
            bg:            "#0F172A",
            card:          "#1E293B",
            textPrimary:   "#F8FAFC",
            textSecondary: "#94A3B8",
          },
        },
      },

      fontFamily: {
        sans: [
          "var(--font-app)",
          "Inter",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        times:     ["Times New Roman", "Times", "serif"],
        helvetica: ["Helvetica", "Arial", "sans-serif"],
        inter:     ["Inter", "Helvetica Neue", "Helvetica", "Arial", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic:    ["Cairo", "Alexandria", "sans-serif"],
        cairo:     ["Cairo", "Alexandria", "sans-serif"],
      },

      boxShadow: {
        brand: "var(--shadow-brand)",
        cta:   "var(--shadow-cta)",
      },

      borderRadius: {
        "2xl": "14px",
        "3xl": "20px",
        "4xl": "28px",
      },

      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "fade-up":        "fade-up 0.5s ease-out forwards",
        "fade-in":        "fade-in 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        shimmer:          "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
};
