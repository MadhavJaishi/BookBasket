import React, { useEffect, useState } from 'react'
import axios from "axios"
import BookCard from '../BookCard/BookCard'

const Favourites = () => {
  const [FavouriteBooks, setFavouriteBooks] = useState([])
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  }
  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get("https://thereadingroom-bookstore.onrender.com/api/v1/get-all-favourites", { headers });
      setFavouriteBooks(response.data.data);
    }
    fetch();
  }, [FavouriteBooks])
  return (
    <>
      {FavouriteBooks.length === 0 && <div className='text-5xl font-semibold h-[100%] text-zinc-400 w-full flex items-center justify-center'>No favourite books</div>}
      <div className='w-full md:grid grid-cols-4 gap-4'>
        {FavouriteBooks && FavouriteBooks.map((items, i) => <div key={i}><BookCard data={items} favourite={true}  /></div>)}
      </div>
    </>
    
  )
}

export default Favourites