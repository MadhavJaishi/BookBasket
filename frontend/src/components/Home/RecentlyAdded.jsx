import React, { useState, useEffect } from 'react'
import axios from "axios"
import BookCard from "../BookCard/BookCard"
import Loader from "../../components/Loader/Loader"

const RecentlyAdded = () => {
  const [BookItems, setBookItems] = useState()
  useEffect(() => { 
    const fetch = async () => {
        const resp = await axios.get("https://thereadingroom-bookstore.onrender.com/api/v1/get-recent-books")
        setBookItems(resp.data.data)
    }
    fetch();
  }, [])
  return (
    <div className='mt-8 px-4'>
        <h4 className='text-3xl text-red-100'>Our Recommendation Books</h4>
        {!BookItems && <div className='flex items-center justify-center my-8'>
            <Loader />
          </div>}
        <div className='my-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4'>
            {BookItems && BookItems.map((book, i) => <div key={i}><BookCard data={book}/>{" "}</div>)}
        </div>
    </div>
  )
}

export default RecentlyAdded