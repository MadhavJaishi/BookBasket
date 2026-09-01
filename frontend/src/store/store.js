import { configureStore } from '@reduxjs/toolkit'
import authReducer from "./auth"
import bookReducer from "./bookSlice"
import libraryReducer from "./librarySlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        bookList: bookReducer,
        library: libraryReducer,
    },
});

export default store;