import { configureStore } from '@reduxjs/toolkit'
import authReducer from "./auth"
import bookReducer from "./bookSlice"
import libraryReducer from "./librarySlice"
import cartReducer from "./cartSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        bookList: bookReducer,
        library: libraryReducer,
        cart: cartReducer,
    },
});

export default store;