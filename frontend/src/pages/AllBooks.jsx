import React, { useState, useEffect } from 'react'
import axios from "axios"
import Loader from '../components/Loader/Loader'
import BookCard from '../components/BookCard/BookCard'

const AllBooks = () => {
  const [BookItems, setBookItems] = useState()
  useEffect(() => { 
    const fetch = async () => {
        const resp = await axios.get("http://localhost:5000/api/v1/get-all-books")
        setBookItems(resp.data.data)
    }
    fetch();
  }, [])
  return (
    <div className='bg-zinc-900 h-auto px-12 py-8'>
      {" "}
      <h4 className='text-3xl text-red-100'>All Books</h4>
        {!BookItems && <div className='w-full h-screen flex items-center justify-center'><Loader /></div>}
        <div className='my-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6'>
            {BookItems && BookItems.map((book, i) => <div key={i}><BookCard data={book}/>{" "}</div>)}
        </div>
    </div>
  )
}

export default AllBooks