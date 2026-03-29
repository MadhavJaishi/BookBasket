import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";
import BookCard from "../components/BookCard/BookCard";

const AllBooks = () => {
  const originalBookItems = useSelector((state) => state.bookList.books) || [];
  const [filteredBookItems, setFilteredBookItems] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setFilteredBookItems(originalBookItems);
      setLoading(false);
  }, [originalBookItems]);


  const change = (e) => {
    const { value } = e.target;
    filterData(value);
  };

  const filterData = (text) => {
    const lowercasedText = text.toLowerCase();
    const filtered = originalBookItems.filter(
      (book) =>
        book.title.toLowerCase().includes(lowercasedText) ||
        book.author.toLowerCase().includes(lowercasedText) ||
        book.desc.toLowerCase().includes(lowercasedText) ||
        book.genre.toLowerCase().includes(lowercasedText),
    );
    setFilteredBookItems(filtered); 
  };

  return (
    <div className="bg-zinc-900 h-auto min-h-screen px-12 py-8">
      <div className="flex flex-row flex-wrap gap-2 justify-between">
        <h4 className="text-xl md:text-3xl text-red-100">All Books</h4>
        <div className="">
          <input
            type="text"
            placeholder="Filter books by title, author, etc..."
            onChange={change}
            className="px-0 py-1 sm:px-6 sm:py-1 rounded-lg bg-zinc-300"
          />
        </div>
      </div>

      {/* Show loader while data is being fetched */}
      {loading && (
        <div className="w-full h-screen flex items-center justify-center">
          <Loader />
        </div>
      )}

      {/* Show filtered books */}
      <div className="my-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {filteredBookItems &&
          filteredBookItems.map((book, i) => (
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
