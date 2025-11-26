import React from 'react'
import { Link } from 'react-router-dom'
import axios from "axios"

const BookCard = ({ data, favourite }) => {
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
    bookid: data._id,
  }
  const removeFromFavourites = async () => {
    const response = await axios.put("https://thereadingroom-bookstore.onrender.com/api/v1/remove-book-from-favourites", {}, { headers })
    console.log(response)
  }
  return (
    <div className='bg-zinc-800 rounded p-4 flex flex-col'>
      <Link to={`/view-book-details/${data._id}`}>
        <div className=''>
          <div className='bg-zinc-800 rounded flex items-center justify-center'>
              <img src={data.url} alt="bookImage" className='h-[25vh]' />
          </div>
          <h2 className='mt-4 text-xl text-white font-semibold text-center'>{data.title}</h2>
          <p className='mt-2 text-zinc-300 font-semibold text-center'>By {data.author}</p>
          <p className='mt-2 text-zinc-300 font-semibold text-xl text-center'>
              &#8377; {data.price}
          </p>
        </div>
      </Link>
      {favourite && (
          <button onClick={removeFromFavourites} className='bg-green-100 text-xl font-semibold px-4 py-2 mt-4 rounded border border-green-500 text-red-600 '>Remove from favourites</button>
        )}
    </div>
  )
}

export default BookCard