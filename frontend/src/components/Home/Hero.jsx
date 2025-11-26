import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div className='h-[75vh] flex flex-col md:flex-row items-center justify-center'>
        <div className='w-full mb-10 md:mb-0 lg:w-3/6 flex flex-col items-center lg:items-start justify-center'>

            <h1 className='text-4xl lg:text-6xl font-semibold text-red-400 text-center lg:text-left'>Your next favorite read awaits.</h1>
            <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>Dive into a world of endless stories. Find your next favorite read, cozy up, and let your imagination soar.</p>

            <div className='mt-8'>
                <Link to="/all-books" className='text-red-100 text-xl lg:text-2xl font-semibold border border-red-100 px-10 py-2 hover:text-zinc-800 hover:bg-white rounded-full'>Discover books</Link>
            </div>
        </div>

        <div className='mt-4 w-full lg:w-3/6 lg:h-[80%] flex items-center justify-center'>
            <img src="./sellBooks.png" alt="image" className="h-50 lg:h-75" />
        </div>
    </div>
  )
}

export default Hero