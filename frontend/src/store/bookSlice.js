import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async ({ headers }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get-all-books`,
        {
          headers,
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }
);;

const BooksSlice = createSlice({
  name: "bookList",
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  builder: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.books = action.payload;
        state.loading = false;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export { fetchBooks };
export default BooksSlice.reducer;
