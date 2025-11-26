import React, { useEffect } from 'react'
import Home from './pages/Home'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import AllBooks from "./pages/AllBooks"
import LogIn from "./pages/LogIn"
import SignUp from "./pages/SignUp"
import Profile from "./pages/Profile"
import Cart from "./pages/Cart"
import AboutUs from "./pages/AboutUs"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import BookDetails from './components/BookDetails/BookDetails'
import { useDispatch, useSelector } from 'react-redux'
import auth, { authActions } from "./store/auth"
import Favourites from './components/Profile/Favourites'
import UserOrderHistory from './components/Profile/UserOrderHistory'
import AllOrders from './components/Profile/AllOrders'
import AddBook from './components/Profile/AddBook'
import Settings from './components/Profile/Settings'
import UpdateBook from './pages/UpdateBook'

const App = () => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);
  useEffect(() => {
    if (localStorage.getItem("id") && localStorage.getItem("token") && localStorage.getItem("role")) {
      dispatch(authActions.login());
      dispatch(authActions.changeRole(localStorage.getItem("role")));
    }
  })
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-books" element={<AllBooks />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} >
          {role === "user" ? <Route index element={<Favourites />}/> : <Route index element={<AllOrders />}/>}
          <Route path="/profile/orderHistory" element={<UserOrderHistory />}/>
          {role === "admin" && <Route path="/profile/add-book" element={<AddBook />}/>}
          <Route path="/profile/settings" element={<Settings />}/>
        </Route>
        <Route path="/cart" element={<Cart />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/update-book/:id" element={<UpdateBook />} />
        <Route path="/view-book-details/:id" element={<BookDetails />}/>
      </Routes>
      <Footer />
    </div>
  )
}

export default App