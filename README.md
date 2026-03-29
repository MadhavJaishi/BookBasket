📚 Book Basket – Online Bookstore (MERN Stack)

Book Basket is a full-stack MERN-based eCommerce application for books, offering users a smooth and modern experience for discovering, saving, and purchasing books.
It includes user authentication, admin features, secure API handling, and a fully responsive UI.

🌟 Features
🔐 Authentication & Authorization

Secure JWT-based login & signup

Password hashing with bcrypt

Role-based access (User / Admin)

📘 Book Management

Browse all books

Detailed book information

Admin can add, update, delete books

❤️ User Features

Add books to Favourites

Add books to Cart

Place Orders

🛒 E-Commerce Essentials

Interactive cart

Order creation & management

Clean & responsive UI

⚛️ Frontend (React)

Modern UI using Tailwind CSS

Smooth state management with Redux

Fully responsive across devices

🛠️ Tech Stack
Frontend

React.js

Tailwind CSS

Redux Toolkit

Backend

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

Bcrypt Password Hashing

Zod for validation

🗂️ Project Structure
BookBasket/
│
├── backend/
│ ├── conn/ # Database connection
│ ├── models/ # User, Book, Order schemas
│ ├── routes/ # API routes (auth, books, cart, favourites, orders)
│ ├── .env # Environment variables (not tracked in Git)
│ └── app.js # Main server entry
│
└── frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── redux/
│ └── App.js
└── tailwind.config.js

🚀 Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/MadhavJaishi/BookBasket.git
cd BookBasket

2️⃣ Backend Setup
cd backend
npm install

Create a .env file:

MONGO_URI=your-mongodb-url
JWT_SECRET=your-secret
PORT=5000

Start backend:

npm start

3️⃣ Frontend Setup
cd ../frontend
npm install
npm start

Your app will run at:
👉 ${process.env.BASE_URL}

📦 MERN Features Breakdown
Backend APIs Include

/auth/signup

/auth/login

/books (CRUD)

/favourites

/cart

/orders

All routes validated with Zod and protected with middleware.

🤝 Contributing

Pull requests are welcome!
Feel free to open issues for improvements or bugs.

📝 License

This project is licensed under the MIT License.
