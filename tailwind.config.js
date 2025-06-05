/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./src/**/*.js"],
  theme: {
    extend: {
      backgroundImage: {
        valex: "url('/valexbackground.png')",
        //           ↑ pas de point, car on part de la racine du serveur
      },
    },
  },
  plugins: [],
};
