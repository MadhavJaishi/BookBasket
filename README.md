# 📚 Book Basket – Online Bookstore (MERN Stack)

**Book Basket** is a full-stack MERN-based eCommerce application for books, offering users a smooth and modern experience for discovering, saving, and purchasing books. It features secure JWT authentication, role-based access (User/Admin), admin management (CRUD operations on books and order status management), interactive cart, favourites, and a responsive Tailwind CSS interface built on React & Vite.

---

## 🌟 Features

### 🔐 Authentication & Authorization
- Secure JWT-based login & signup
- Password hashing with `bcrypt`
- Role-based access control (`user` / `admin`)

### 📘 Book Management
- Browse all books and view detailed book information
- Display featured/most searched books
- Admin capabilities: Add, update, and delete books

### ❤️ User Features
- Add & remove books to/from **Favourites**
- Add & remove items to/from **Cart**
- Place orders and view personal **Order History** with delivery status

### 🛒 Admin Features
- View all user orders across the application
- Inspect customer user details (username, email, address)
- Update order delivery status (`Order placed`, `Out for delivery`, `Delivered`, `Cancelled`)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`)
- **Routing**: React Router DOM (`v6`)
- **Icons**: React Icons

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt
- **Validation**: Zod
- **Cross-Origin**: CORS

---

## 🗂️ Project Structure

```
BookBasket/
├── backend/
│   ├── conn/         # Database connection setup
│   ├── models/       # Mongoose Schemas (User, Book, Order)
│   ├── routes/       # Express API route handlers (user, book, cart, favourites, order)
│   ├── .env          # Backend environment variables
│   └── app.js        # Server entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components (Navbar, Footer, BookCard, Profile, etc.)
    │   ├── pages/       # Page views (Home, Cart, Profile, LogIn, SignUp, etc.)
    │   ├── store/       # Redux store & slices
    │   ├── App.jsx      # Main application router
    │   └── main.jsx     # Vite entry point
    └── vite.config.js
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/MadhavJaishi/BookBasket.git
cd BookBasket
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=1000
URI=your-mongodb-connection-string
```

Start the backend server:
```bash
npm start
# or for development with hot reload
npm run dev
```
The backend API will run on `http://localhost:1000`.

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory (if needed):
```env
VITE_BACKEND_URL=http://localhost:1000/api/v1
```

Start the Vite development server:
```bash
npm run dev
```
The web application will run on `http://localhost:5173`.

---

## 📦 API Routes Overview

All backend endpoints are prefixed with `/api/v1`:

### 👤 User & Auth Routes (`/api/v1`)
- `POST /sign-up` – Register a new user
- `POST /sign-in` – User authentication & JWT token generation
- `GET /get-user-information` – Get current logged-in user profile
- `PUT /update-address` – Update user shipping address

### 📚 Book Routes (`/api/v1`)
- `GET /get-all-books` – Retrieve all available books
- `GET /get-recent-books` – Retrieve recently added / featured books
- `GET /get-book-by-id/:id` – Retrieve single book details
- `POST /add-book` – *(Admin only)* Add a new book
- `PUT /update-book` – *(Admin only)* Update existing book details
- `DELETE /delete-book` – *(Admin only)* Delete a book

### ❤️ Favourites Routes (`/api/v1`)
- `PUT /add-book-to-favourite` – Add book to user's favourites
- `PUT /remove-book-from-favourite` – Remove book from user's favourites
- `GET /get-favourite-books` – Fetch user's favourite books

### 🛒 Cart Routes (`/api/v1`)
- `PUT /add-to-cart` – Add book to user's cart
- `PUT /remove-from-cart/:bookid` – Remove book from user's cart
- `GET /get-user-cart` – Fetch user's cart items

### 📦 Order Routes (`/api/v1`)
- `POST /place-order` – Place an order for items in cart
- `GET /get-order-history` – Fetch current user's order history
- `GET /get-all-orders` – *(Admin only)* Fetch all orders across web app
- `PUT /update-status/:id` – *(Admin only)* Update status of an order

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the repository issues.

---

## 📝 License

This project is licensed under the **MIT License**.
