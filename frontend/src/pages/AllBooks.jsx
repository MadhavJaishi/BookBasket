import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../components/Loader/Loader';
import BookCard from '../components/BookCard/BookCard';

const AllBooks = () => {
  const [originalBookItems, setOriginalBookItems] = useState([]); // Keep the original data
  const [filteredBookItems, setFilteredBookItems] = useState([]); // Display filtered data
  const [loading, setLoading] = useState(true); // Loader state

  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await axios.get('https://thereadingroom-bookstore.onrender.com/api/v1/get-all-books');
        setOriginalBookItems(resp.data.data); // Store the original list of books
        setFilteredBookItems(resp.data.data); // Initially show all books
        setLoading(false); // Turn off loading
      } catch (error) {
        console.error('Failed to fetch books', error);
        setLoading(false); // Turn off loading in case of an error
      }
    };
    fetch();
  }, []);

  // Handle input change and filter books based on input text
  const change = (e) => {
    const { value } = e.target;
    filterData(value);
  };

  // Filter books based on title, author, desc, and genre
  const filterData = (text) => {
    const lowercasedText = text.toLowerCase();
    const filtered = originalBookItems.filter((book) =>
      book.title.toLowerCase().includes(lowercasedText) ||
      book.author.toLowerCase().includes(lowercasedText) ||
      book.desc.toLowerCase().includes(lowercasedText) ||
      book.genre.toLowerCase().includes(lowercasedText)
    );
    setFilteredBookItems(filtered); // Update the filtered book list
  };

  return (
    <div className='bg-zinc-900 h-auto min-h-screen px-12 py-8'>
      <div className='flex justify-between'>
        <h4 className='text-xl md:text-3xl text-red-100'>All Books</h4>
        <div className=''>
          <input 
            type="text" 
            placeholder="Filter books by title, author, etc..." 
            onChange={change} 
            className='px-0 py-1 sm:px-10 sm:py-3 rounded'
          />
        </div>
      </div>
      
      {/* Show loader while data is being fetched */}
      {loading && (
        <div className='w-full h-screen flex items-center justify-center'>
          <Loader />
        </div>
      )}
      
      {/* Show filtered books */}
      <div className='my-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6'>
        {filteredBookItems && filteredBookItems.map((book, i) => (
          <div key={i}>
            <BookCard data={book} />
          </div>
        ))}
      </div>
      
      {/* Show a message when no books are found */}
      {filteredBookItems.length === 0 && !loading && (
        <div className="text-red-200">No books found.</div>
      )}
    </div>
  );
};

export default AllBooks;
