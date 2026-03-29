import { useState, useEffect } from "react";
import axios from "axios";
import BookCard from "../BookCard/BookCard";
import Loader from "../../components/Loader/Loader";

const RecentlyAdded = () => {
  const [BookItems, setBookItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-recent-books`);
        setBookItems(resp.data.data);
      } catch (error) {
        console.error("Error fetching recent books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);
  return (
    <div className="mt-8 px-4">
      <h4 className="text-3xl text-red-100">Most Bought Books</h4>
      {!BookItems && (
        <div className="flex items-center justify-center my-8">
          <Loader />
        </div>
      )}
      {BookItems.length === 0 && !loading && (
        <div className="text-red-200 text-center p-8">No books found.</div>
      )} 
      {BookItems.length > 0 && (
        <div className="my-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {BookItems &&
            BookItems.map((book, i) => (
              <div key={i}>
                <BookCard data={book} />{" "}
              </div>
          ))}
      </div>)}
    </div>
  );
};

export default RecentlyAdded;
