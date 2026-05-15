/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#7126D0",
      },
      fontFamily: {
        poppins: ["Poppins-Regular"],
        "poppins-medium": ["Poppins-Medium"],
        "poppins-bold": ["Poppins-Bold"],
        sans: ["Poppins-Regular"],
      },
    },
  },
  plugins: [],
}
