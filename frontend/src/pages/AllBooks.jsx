import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader/Loader";
import BookCard from "../components/BookCard/BookCard";

const AllBooks = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/get-all-books`
        );
        const books = response.data.data || [];
        setAllBooks(books);
        setFilteredBooks(books);
      } catch (error) {
        console.error("Error fetching all books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBooks();
  }, []);

  const change = (e) => {
    const text = e.target.value.toLowerCase().trim();
    if (!text) {
      setFilteredBooks(allBooks);
    } else {
      const filtered = allBooks.filter(
        (book) =>
          book.title?.toLowerCase().includes(text) ||
          book.author?.toLowerCase().includes(text) ||
          book.desc?.toLowerCase().includes(text) ||
          book.genre?.toLowerCase().includes(text)
      );
      setFilteredBooks(filtered);
    }
  };

  return (
    <div className="bg-zinc-900 h-auto min-h-screen px-12 py-8">
      <div className="flex flex-row flex-wrap gap-2 justify-between items-center">
        <h4 className="text-xl md:text-3xl text-red-100 font-semibold">All Books</h4>
        <div>
          <input
            type="text"
            placeholder="Filter books by title, author, etc..."
            onChange={change}
            className="px-4 py-2 rounded-lg bg-zinc-300 text-zinc-900 outline-none w-64 md:w-80 shadow"
          />
        </div>
      </div>

      {/* Show loader while data is being fetched */}
      {loading && (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Loader />
        </div>
      )}

      {/* Show filtered books */}
      {!loading && filteredBooks.length > 0 && (
        <div className="my-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredBooks.map((book, i) => (
            <div key={book._id || i}>
              <BookCard data={book} />
            </div>
          ))}
        </div>
      )}

      {/* Show a message when no books are found */}
      {!loading && filteredBooks.length === 0 && (
        <div className="text-red-200 text-center py-16 text-xl">No books found.</div>
      )}
    </div>
  );
};

export default AllBooks;
