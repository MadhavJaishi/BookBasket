import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const id = localStorage.getItem("id");
      const token = localStorage.getItem("token");
      if (!id || !token) return [];

      const headers = {
        id,
        authorization: `Bearer ${token}`,
      };
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get-user-cart`,
        { headers }
      );
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch cart");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    cartCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setCart: (state, action) => {
      state.cartItems = action.payload || [];
      state.cartCount = (action.payload || []).length;
    },
    addItemToCart: (state, action) => {
      const exists = state.cartItems.some((item) => item._id === action.payload._id);
      if (!exists) {
        state.cartItems.unshift(action.payload);
        state.cartCount = state.cartItems.length;
      }
    },
    removeItemFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item._id !== action.payload);
      state.cartCount = state.cartItems.length;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.cartCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload || [];
        state.cartCount = (action.payload || []).length;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCart, addItemToCart, removeItemFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
