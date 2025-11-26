import React, { useState, useEffect } from 'react'
import axios from "axios"
import Loader from '../Loader/Loader'
import { GrLanguage } from "react-icons/gr";
import { FaHeart } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa"; 
import { FaEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux';

const BookDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [Data, setData] = useState({})
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);
  useEffect(() => { 
    const fetch = async () => {
        const resp = await axios.get(`https://thereadingroom-bookstore.onrender.com/api/v1/get-book-details/${id}`)
        // console.log(resp)
        setData(resp.data.data)
    }
    fetch();
  }, [])
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
    bookid: id,
  }
  const addToFavourite = async () => {
    const response = await axios.put("https://thereadingroom-bookstore.onrender.com/api/v1/add-book-to-favourites", {}, { headers });
    alert(response.data.msg);
  }
  const addToCart = async () => {
    const response = await axios.put("https://thereadingroom-bookstore.onrender.com/api/v1/add-book-to-cart", {}, { headers });
    alert(response.data.msg);
  }
  const editBook = () => {

  }
  const deleteBook = async () => {
    const response = await axios.delete("https://thereadingroom-bookstore.onrender.com/api/v1/delete-book", { headers });
    alert(response.data.msg);
    navigate("/all-books");
  }
  return ( 
  <>
    {Data && (
      <div className='px-4 md:px-12 py-8 bg-zinc-800 flex flex-col md:flex-row gap-8 items-start'>
        <div className='w-full lg:w-3/6'>
            {" "}
            <div className='flex flex-col lg:flex-row justify-around bg-zinc-700 p-12 rounded'>
              {" "}
              <img src={Data.url} className='h-[50vh] md:h-[60vh] lg:h-[70vh] rounded'/>
              {" "}
              {isLoggedIn === true && role === "user" && 
              <div className='flex flex-col md:flex-row lg:flex-col items-center justify-between lg:justify-start mt-8 lg:mt-0'>
                <button onClick={addToFavourite} className='bg-white rounded lg:rounded-full text-4xl lg:text-3xl p-3 text-red-500 flex items-center justify-center'>
                  <FaHeart />{" "} <span className='ms-4 block lg:hidden'>Favourites</span>
                </button>
                <button onClick={addToCart} className='text-white rounded lg:rounded-full text-4xl lg:text-3xl p-3 mt-8 md:mt-0 lg:mt-8 bg-blue-500 flex items-center justify-center'>
                  <FaShoppingCart />{" "} <span className='ms-4 block lg:hidden'>Add to cart</span>
                </button>
              </div>}
              {" "}
              {isLoggedIn === true && role === "admin" && 
              <div className='flex flex-col md:flex-row  lg:flex-col items-center justify-between lg:justify-start mt-8 lg:mt-0'>
                <Link to={`/update-book/${id}`} onClick={editBook} className='bg-white rounded lg:rounded-full text-4xl lg:text-3xl p-3 flex items-center justify-center'>
                <FaEdit /> {" "} <span className='ms-4 block lg:hidden'>Edit book</span>
                </Link>
                <button onClick={deleteBook} className='text-red-500 rounded lg:rounded-full text-4xl lg:text-3xl p-3 mt-8 md:mt-0 lg:mt-8 bg-white flex items-center justify-center'>
                <MdDeleteOutline /> {" "} <span className='ms-4 block lg:hidden'>Delete book</span>
                </button>
              </div>}
            </div>
        </div>
        <div className='p-4 w-full lg:w-3/6'>
          <h1 className='text-4xl text-zinc-300 font-semibold'>{Data.title}</h1>
          <p className='text-zinc-400 mt-1'>By {Data.author}</p>
          <p className='text-zinc-500 mt-4 text-xl'>{Data.desc}</p>
          <p className='flex mt-4 items-center justify-start text-zinc-400'>
            <GrLanguage className='me-3' /> {Data.language}
          </p>
          <p className='mt-4 text-zinc-300 text-3xl font-semibold'>
            Price : &#8377; {Data.price}{" "}
          </p>
        </div>
     </div>
    )}
    {!Data && (
      <div className='h-screen bg-zinc-800 flex items-center justify-center'>
        <Loader />{" "}
      </div>
    )}
  </>
  );
}

export default BookDetails