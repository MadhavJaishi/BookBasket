import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMyLibrary = createAsyncThunk(
  "library/fetchMyLibrary",
  async (_, { rejectWithValue }) => {
    try {
      const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/reading/my-library`,
        { headers }
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || "Failed to fetch library");
    }
  }
);

export const fetchReadingGoal = createAsyncThunk(
  "library/fetchReadingGoal",
  async (_, { rejectWithValue }) => {
    try {
      const headers = {
        id: localStorage.getItem("id"),
        authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/reading/goals`,
        { headers }
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || "Failed to fetch reading goals");
    }
  }
);

const librarySlice = createSlice({
  name: "library",
  initialState: {
    library: { WANT_TO_READ: [], CURRENTLY_READING: [], FINISHED: [] },
    goal: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLibrary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.library = action.payload || { WANT_TO_READ: [], CURRENTLY_READING: [], FINISHED: [] };
      })
      .addCase(fetchMyLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchReadingGoal.fulfilled, (state, action) => {
        state.goal = action.payload;
      });
  },
});

export default librarySlice.reducer;
