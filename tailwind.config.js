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
        customLightGreen: "#e2e5e2",
        customMintGreen: "#ddf8ec",
        customLightBlue: "#bad7f2",
        customPink: "#dd5a7d",
      },
      fontFamily: {
        ubuntu: ["Ubuntu", "sans-serif"],
      },
    },
  },
  plugins: [],
};
