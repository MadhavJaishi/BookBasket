import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const fetchBooks = createAsyncThunk("books/fetchBooks", async ({ headers }) => {
  try {
    const response = await fetch(`${process.env.BASE_URL}/get-all-books`, {
      headers,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
});

const BooksSlice = createSlice({
  name: "books",
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
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export { fetchBooks };
export default BooksSlice.reducer;
