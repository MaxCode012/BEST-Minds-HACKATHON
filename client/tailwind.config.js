export default {
  theme: {
    extend: {
      fontFamily: {
        // Înlocuiește serifele vechi cu Plus Jakarta Sans (sau un fallback curat)
        serif: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        sans: [
          '"Plus Jakarta Sans"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
