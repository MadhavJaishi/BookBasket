# Backend
// Server Creation Setup
-> npm init -y
-> npm i express mongoose nodemon
-> nodemon app.js or node app.js
-> npm i dotenv and created .env file inside backend folder

// Connection with db setup
-> Create conn folder and conn.js for connecting with db
-> Goto mongodb atlas, create project and set the network access to every url and create the cluster0

// Model Schema Setup
-> Create models folder in backend and user, book & order in it to store schemas

// APIs Setup
-> Create routes in backend and user.js in it and add zod in it too.
-> npm i bcrypt // to hash the password before saving to db
-> for signin post request, npm i bcryptjs
-> npm i jsonwebtoken and set the secret key as "ReadingRoom"
-> create userAuth.js in routes to authenticate users with their token and secret key
-> create book.js to write apis for the book crud operations
-> create favourites.js
-> create cart.js and then order.js

# Frontend
-> Create react app



