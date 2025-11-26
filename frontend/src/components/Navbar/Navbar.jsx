import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaGripLines } from "react-icons/fa";
import { useSelector } from "react-redux"

const Navbar = () => {
  const links = [
    {
        title: "Home",
        link: "/"
    },
    {
        title: "About us",
        link: "/about-us"
    },
    {
        title: "All Books",
        link: "/all-books"
    },
    {
        title: "Cart",
        link: "/cart"
    },
    {
        title: "Profile",
        link: "/profile"
    },
    {
        title: "Admin Profile",
        link: "/profile"
    },
  ];  
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role)
  if (isLoggedIn === false) {
    links.splice(3, 3);
  }
  else if (isLoggedIn === true && role == "user") {
    links.splice(5, 1)
  }
  else if (isLoggedIn === true && role == "admin") {
    links.splice(3, 2)
  }
  const [MobileNav, setMobileNav] = useState("hidden")
  return (
    <>
        <nav className='relative flex bg-zinc-800 text-white px-8 py-2 items-center justify-between z-50'>
            <Link to="/" className='flex items-center'>
                <img className='h-10 me-4' src="https://img.icons8.com/?size=100&id=jfFu3i8zJXfN&format=png&color=000000" alt="logo" />
                <h1 className='text-2xl font-semibold'>TheReadingRoom</h1>
            </Link>
            <div className='nav-links-readingroom block md:flex items-center gap-4'>
                <div className='hidden md:flex gap-4'>
                    {links.map((items) => ( 
                        <div className='flex items-center'> {
                            items.title === "Profile" || items.title === "Admin Profile" ? 
                            <Link to={items.link} className='px-4 py-1 border rounded border-blue-500 hover:bg-white hover:text-zinc-800 transition-all duration-300' key={items.title}>
                                    {items.title}
                            </Link> : 
                            <Link to={items.link} className='hover:text-blue-500 transition-all duration-300' key={items.title}>
                                    {items.title}{" "}
                            </Link>
                            }
                        </div>
                    ))}
                </div>
                {isLoggedIn === false && (
                    <div className='hidden md:flex gap-4'>
                    <Link to="/login" className='px-4 py-1 border rounded-full border-blue-500 hover:bg-white hover:text-zinc-800 transition-all duration-300'>LogIn</Link>
                    <Link to="/signup" className='px-4 py-1 bg-blue-500 rounded-md hover:bg-white hover:text-zinc-800 transition-all duration-300'>SignUp</Link>
                </div>
                )}
                <button className='block md:hidden text-white text-2xl hover:text-zinc-400' onClick={() => (MobileNav === "hidden" ? setMobileNav("block") : setMobileNav("hidden"))}>
                    <FaGripLines />
                </button>
            </div>
        </nav>
        <div className={`${MobileNav} bg-zinc-800 h-screen absolute top-0 left-0 w-full z-40 flex flex-col items-center justify-center`}>
            {links.map((items) => (
                <Link to={items.link} className='text-white text-4xl font-semibold mb-8 hover:text-blue-500 transition-all duration-300' key={items.title} onClick={() => (MobileNav === "hidden" ? setMobileNav("block") : setMobileNav("hidden"))}>{items.title}</Link>
            ))}
            {isLoggedIn === false && (
                <>
                    <Link to="/login" className={`${MobileNav} px-8 py-2 mb-8 text-3xl font-semibold border rounded-full border-blue-500 text-white hover:bg-white hover:text-zinc-800 transition-all duration-300`}>LogIn</Link>
                    <Link to="/signup" className={`${MobileNav} px-8 py-2 mb-8 text-3xl font-semibold bg-blue-500 rounded-md text-white hover:bg-white hover:text-zinc-800 transition-all duration-300`}>SignUp</Link>
                </>
            )}
        </div>
    </>
  )
}

export default Navbar