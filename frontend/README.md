# Frontend
-> create react app using
    npm create vite@latest

// Tailwind Setup
-> Install tailwindcss and its peer dependencies, then generate your tailwind.config.js and postcss.config.js files using
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
-> Replace content in tailwind.config.js from
    content: [], to
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",],
-> remove everything from src/index.css and paste below code
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

// App.jsx Setup
-> remove everything from src/App.jsx and write rafce
-> create pages and components folders inside src
-> install react router dom and axios
    npm i react-router-dom axios
    npm i @reduxjs/toolkit react-redux
    npm i react-icons
-> create Home.jsx inside pages and Footer/Footer.jsx & Navbar/Navbar.jsx inside components and write rafce in all three.
-> write Navbar.jsx details
-> write Footer.jsx details
-> write Home.jsx details before that create Home folder in components and create Hero.jsx in it
-> maintain App.jsx better by implementing Routes
-> create AllBooks.jsx, AboutUs.jsx, Cart.jsx, Profile.jsx, SignUp.jsx & LogIn.jsx inside pages
-> Maintained website responsive in both Navbar.jsx and Hero.jsx 
-> create BookCard folder in components and BookCard.jsx in it

// Frontend Backend Integration
-> Install cors 
    npm i cors
-> create RecentlyAdded.jsx inside Home folder and use axios to fetch all books to display on recently added list
-> create Loader inside components and Loader.jsx in it
-> write in AllBooks.jsx and BookCard
-> create BookDetails inside components and BookDetails.jsx in it and, when BookCard is clicked it takes to BookDetails.jsx
-> implement LogIn, SignUp and About Us pages
 
 // State management using redux
 -> create store folder inside components
 -> create index.js and then auth.js and create reducers to login, logout and change role so to customize access of components to users and admin.
 -> maintain Navbar.jsx, LogIn.jsx & SignUp.jsx better to accomodate login and logout phase with the help of authActions and reducers
 -> use dispatch to dispactch actions to redux store
 -> Now, write in Profile.jsx























# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
