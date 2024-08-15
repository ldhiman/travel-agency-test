// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // Include the app directory if you're using it
    "./src/**/*.{js,ts,jsx,tsx}", // Include the app directory if you're using it
  ],
  theme: {
    extend: {
      colors: {
        "custom-light": "#FFFAFF",
        "custom-pink": "#E8577B",
        "custom-dark": "#1E1B18",
      },
      fontFamily: {
        "barlow-condensed": ["Barlow Condensed", "sans-serif"],
      },
      fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      fontStyle: {
        italic: "italic",
        normal: "normal",
      },
    },
  },
  plugins: [],
};
