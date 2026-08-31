# 📚 BookBasket — Complete Project Context & Architecture

**BookBasket** is a full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** e-commerce bookstore application. It provides an intuitive platform for users to discover, like/dislike, save, and purchase books, alongside an admin dashboard to manage inventory and user orders.

---

## 📑 Table of Contents
1. [Tech Stack & Dependencies](#-tech-stack--dependencies)
2. [Folder Structure](#-folder-structure)
3. [Core Features](#-core-features)
4. [Database Schemas & Models](#-database-schemas--models)
5. [API Endpoint Reference](#-api-endpoint-reference)
6. [Frontend Architecture & Routes](#-frontend-architecture--routes)
7. [Environment & Setup Guide](#-environment--setup-guide)

---

## 🛠 Tech Stack & Dependencies

### Backend (`/backend`)
- **Runtime & Framework**: Node.js (ES Modules), Express.js (`v4.19.2`)
- **Database & ORM**: MongoDB, Mongoose (`v8.6.0`)
- **Authentication & Security**: JSON Web Tokens (`jsonwebtoken v9.0.2`), Password Hashing (`bcrypt v5.1.1` / `bcryptjs`), CORS (`cors v2.8.5`)
- **Validation**: Zod (`v3.23.8`)
- **Utilities & Development**: Dotenv (`v16.4.5`), Nodemon (`v3.1.4`)

### Frontend (`/frontend`)
- **Core & Build Tool**: React 18 (`v18.3.1`), Vite (`v5.4.1`)
- **Styling**: Tailwind CSS (`v3.4.11`), PostCSS, Autoprefixer
- **State Management**: Redux Toolkit (`@reduxjs/toolkit v2.2.7`), React Redux (`v9.1.2`)
- **Routing**: React Router DOM (`v6.26.2`)
- **HTTP Client**: Axios (`v1.7.7`)
- **UI Components & Icons**: React Icons (`react-icons v5.3.0`)

---

## 🗂 Folder Structure

```
BookBasket/
├── README.md                 # Brief project summary & setup instructions
├── PROJECT_CONTEXT.md        # Comprehensive context, architecture & specs (this file)
├── package.json              # Workspace root package definition
├── backend/                  # Node.js + Express REST API server
│   ├── app.js                # Express app initialization, CORS, middleware & route definitions
│   ├── package.json          # Backend dependencies and scripts
│   ├── conn/
│   │   └── conn.js           # Mongoose MongoDB connection handler
│   ├── models/
│   │   ├── user.js           # User Mongoose schema (Auth, role, cart, favourites, order refs)
│   │   ├── book.js           # Book Mongoose schema (Title, author, price, likes/dislikes, metadata)
│   │   └── order.js          # Order Mongoose schema (User ref, Book ref, delivery status)
│   └── routes/
│       ├── userAuth.js       # JWT authorization middleware (`authenticateToken`)
│       ├── user.js           # Signup, login, user details, address updates
│       ├── book.js           # Book CRUD operations, like/dislike handling
│       ├── favourites.js     # User favourite books operations
│       ├── cart.js           # User cart operations
│       └── order.js          # Order placement, order history, admin status updates
└── frontend/                 # Vite + React single-page application
    ├── index.html            # Main HTML entry point
    ├── vite.config.js        # Vite bundler configuration
    ├── tailwind.config.js    # Tailwind CSS configuration
    ├── postcss.config.js     # PostCSS configuration
    ├── package.json          # Frontend dependencies and scripts
    └── src/
        ├── main.jsx          # React app entry point (Provider & BrowserRouter wrapper)
        ├── App.jsx           # Top-level routing, route protection, global dispatch
        ├── App.css           # Custom layout styles
        ├── index.css         # Tailwind directive imports
        ├── assets/           # Static asset files
        ├── store/            # Redux Toolkit global store setup
        │   ├── store.js      # Store configuration combining reducers
        │   ├── auth.js       # Auth slice (login/logout, user role state)
        │   └── bookSlice.js  # Async thunk book slice (fetching & storing books state)
        ├── pages/            # Page-level components
        │   ├── Home.jsx      # Landing page wrapper
        │   ├── AllBooks.jsx  # Full catalog view with loader
        │   ├── LogIn.jsx     # User authentication form
        │   ├── SignUp.jsx    # User registration form
        │   ├── Profile.jsx   # Profile container layout (Sidebar & nested views)
        │   ├── Cart.jsx      # Shopping cart page & checkout trigger
        │   ├── AboutUs.jsx   # Information page
        │   ├── UpdateBook.jsx# Admin interface for editing book metadata
        │   └── SeeUserData.jsx# Admin modal/view for user details
        └── components/       # Reusable components
            ├── Navbar/
            │   └── Navbar.jsx# Navigation bar with responsive links & auth controls
            ├── Footer/
            │   └── Footer.jsx# Site footer component
            ├── Home/
            │   ├── Hero.jsx  # Hero banner component
            │   └── RecentlyAdded.jsx # Recently added books section on home page
            ├── BookCard/
            │   └── BookCard.jsx # Reusable book card display component
            ├── BookDetails/
            │   └── BookDetails.jsx # Detailed view for individual books with actions
            ├── Loader/
            │   └── Loader.jsx# Spinner / loading component
            └── Profile/
                ├── Sidebar.jsx        # Navigation sidebar for profile page
                ├── MobileNav.jsx      # Mobile drawer navigation for profile
                ├── Favourites.jsx      # Display list of user's favourited books
                ├── UserOrderHistory.jsx# User's past order list & status indicators
                ├── AllOrders.jsx       # Admin dashboard listing all customer orders
                ├── AddBook.jsx         # Admin form to add a new book to catalog
                └── Settings.jsx       # User settings page to view/update address
```

---

## ⚡ Core Features

### 🔐 Authentication & Authorization
- **JWT-Based Security**: Tokens issued on login and validated on protected endpoints via `authenticateToken` middleware.
- **Password Security**: Passwords hashed using `bcrypt` prior to storage.
- **Request Validation**: Payload validation via `Zod` schemas for authentication input.
- **Role-Based Access Control**: Two distinct roles:
  - `user`: Standard customer access.
  - `admin`: Elevated permissions to manage books and modify order statuses.

### 📘 Book Management
- **Catalog Browsing**: Retrieve all books or fetch recently added books (limit 4).
- **Detailed Book View**: Detailed view showing cover image, title, author, price, genre, language, description, and likes/dislikes.
- **Community Interaction**: Users can increment `likes` or `dislikes` on any book.
- **Admin Inventory Management**: Admin users can create new books, update existing book details, and delete books from the system.

### ❤️ Favourites & 🛒 Cart Operations
- **Favourites List**: Users can add books to or remove books from their personal favourites list.
- **Shopping Cart**: Users can manage items in their cart, view total cost, and proceed to checkout.

### 📦 Order System
- **Checkout / Order Creation**: Place orders for items in cart, saving order records linked to the user and book.
- **User Order History**: Users can view their order history along with current status (`Order placed`, `Out for delivery`, `Delivered`, `Cancelled`).
- **Admin Order Dashboard**: Admins can view all orders across all users, inspect user shipping addresses/details, and update order fulfillment status.

---

## 🗃 Database Schemas & Models

### 1. User Model (`backend/models/user.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `username` | `String` | Required, Unique | User's unique display handle |
| `email` | `String` | Required, Unique | User email address |
| `password` | `String` | Required | Hashed password string |
| `address` | `String` | Required | Delivery address |
| `avatar` | `String` | Default | URL avatar image |
| `role` | `String` | Enum `["user", "admin"]`, Default: `"user"` | User authorization role |
| `favourites` | `[ObjectId]` | Ref: `"books"` | Array of favourited book IDs |
| `cart` | `[ObjectId]` | Ref: `"books"` | Array of book IDs in cart |
| `orders` | `[ObjectId]` | Ref: `"order"` | Array of placed order IDs |
| `createdAt / updatedAt` | `Timestamp` | Managed by Mongoose | Creation & modification timestamps |

### 2. Book Model (`backend/models/book.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `url` | `String` | Required | Image cover URL |
| `title` | `String` | Required | Title of the book |
| `author` | `String` | Required | Author name |
| `price` | `Number` | Required | Book price |
| `genre` | `String` | Required | Book category / genre |
| `desc` | `String` | Required | Full description |
| `language` | `String` | Required | Book language |
| `likes` | `Number` | Default: `0` | Upvote count |
| `dislikes` | `Number` | Default: `0` | Downvote count |
| `createdAt / updatedAt` | `Timestamp` | Managed by Mongoose | Timestamps |

### 3. Order Model (`backend/models/order.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Ref: `"user"` | Reference to the buyer |
| `book` | `ObjectId` | Ref: `"books"` | Reference to the ordered book |
| `status` | `String` | Enum `["Order placed", "Out for delivery", "Delivered", "Cancelled"]` | Order fulfillment status |
| `createdAt / updatedAt` | `Timestamp` | Managed by Mongoose | Timestamps |

---

## 📡 API Endpoint Reference

Base Path: `/api/v1`

### 👤 User & Auth Routes (`/backend/routes/user.js`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/sign-in` | Public | Register a new user account |
| `POST` | `/log-in` | Public | Authenticate user and receive JWT token |
| `GET` | `/get-user-information` | Protected | Fetch profile details of logged-in user |
| `PUT` | `/update-address` | Protected | Update delivery address for user |

### 📚 Book Routes (`/backend/routes/book.js`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/add-book` | Protected (Admin) | Add a new book to inventory |
| `PUT` | `/update-book` | Protected (Admin) | Modify existing book information |
| `DELETE` | `/delete-book` | Protected (Admin) | Remove a book from catalog |
| `GET` | `/get-all-books` | Public | Fetch all available books |
| `GET` | `/get-recent-books` | Public | Fetch 4 recently added books |
| `GET` | `/get-book-by-id/:id` | Public | Fetch book details by ID |
| `PUT` | `/like-book/:id` | Protected | Increment like counter on a book |
| `PUT` | `/dislike-book/:id` | Protected | Increment dislike counter on a book |

### ❤️ Favourite Routes (`/backend/routes/favourites.js`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `PUT` | `/add-book-to-favourite` | Protected | Add a book to user's favourites list |
| `PUT` | `/remove-book-from-favourite` | Protected | Remove a book from user's favourites list |
| `GET` | `/get-favourite-books` | Protected | Retrieve all favourited books for user |

### 🛒 Cart Routes (`/backend/routes/cart.js`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `PUT` | `/add-to-cart` | Protected | Add a book to user's shopping cart |
| `PUT` | `/remove-from-cart/:bookid` | Protected | Remove a book from user's shopping cart |
| `GET` | `/get-user-cart` | Protected | Get populated list of books in cart |

### 📦 Order Routes (`/backend/routes/order.js`)
| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/place-order` | Protected | Convert items in cart into placed orders |
| `GET` | `/get-order-history` | Protected | Retrieve logged-in user's past orders |
| `GET` | `/get-all-orders` | Protected (Admin) | Admin view of all orders in system |
| `PUT` | `/update-status/:id` | Protected (Admin) | Admin route to update order status |

---

## 🎨 Frontend Architecture & Routes

### Route Table (`frontend/src/App.jsx`)
| Route Path | Access | Component | Description |
| :--- | :--- | :--- | :--- |
| `/` | Public | `Home` | Landing page (Hero + Recently Added books) |
| `/all-books` | Public | `AllBooks` | Grid view of all catalog books |
| `/login` | Public | `LogIn` | User login form |
| `/signup` | Public | `SignUp` | User registration form |
| `/about-us` | Public | `AboutUs` | Information about BookBasket |
| `/view-book-details/:id` | Public | `BookDetails` | Full details, cart/favourite/edit buttons |
| `/cart` | User / Protected | `Cart` | View cart items, order submission |
| `/update-book/:id` | Admin Protected | `UpdateBook` | Form to edit existing book details |
| `/profile` | Protected | `Profile` | Layout container for sub-routes: |
| ↳ `/profile` (index) | User | `Favourites` | Favourites list view for regular user |
| ↳ `/profile` (index) | Admin | `AllOrders` | Order management dashboard for admin |
| ↳ `/profile/orderHistory` | User | `UserOrderHistory` | Order history list for regular user |
| ↳ `/profile/add-book` | Admin | `AddBook` | Inventory addition form for admin |
| ↳ `/profile/settings` | Protected | `Settings` | Address viewing and editing component |

### Redux State Management (`frontend/src/store/`)
- **`authSlice`** (`auth.js`):
  - State: `isLoggedIn` (boolean), `role` (`"user"` \| `"admin"`).
  - Reducers: `login()`, `logout()`, `changeRole(role)`.
- **`bookSlice`** (`bookSlice.js`):
  - Async Thunk: `fetchBooks()`.
  - State: `books` (array), `status` (`"idle"` \| `"loading"` \| `"succeeded"` \| `"failed"`), `error`.

---

## ⚙️ Environment & Setup Guide

### 1. Environment Variables

#### Backend `.env` (`/backend/.env`)
```env
PORT=1000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/BookBasket
JWT_SECRET=BookBasket
```

#### Frontend `.env` (`/frontend/.env`)
```env
VITE_BACKEND_URL=http://localhost:1000
```

### 2. Running Locally

#### Start Backend Server:
```bash
cd backend
npm install
npm start
```
*Backend runs at `http://localhost:1000`*

#### Start Frontend Application:
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server runs via Vite (typically `http://localhost:5173`)*

---
