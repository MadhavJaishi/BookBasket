import { configureStore } from '@reduxjs/toolkit'
import authReducer from "./auth"
import bookReducer from "./bookSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        bookList: bookReducer,
    },
});

export default store;