import React from 'react'
import Hero from '../components/Home/Hero'
import MostSearchedBooks from '../components/Home/MostSearchedBooks'

const Home = () => {
  return (
    <div className='bg-zinc-800 text-white px-10 py-8'>
        <Hero />
        <MostSearchedBooks />
    </div>
  )
}

export default Home