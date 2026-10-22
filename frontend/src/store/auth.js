import { createSlice } from "@reduxjs/toolkit"

const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
const role = typeof window !== "undefined" ? localStorage.getItem("role") || "user" : "user";

const authSlice = createSlice({
    name: "auth",
    initialState: { isLoggedIn: Boolean(token), role: role },
    reducers: {
        login(state) {
            state.isLoggedIn = true;
        },
        logout(state) {
            state.isLoggedIn = false;
        },
        changeRole(state, action) {
            const role = action.payload;
            state.role = role;
        },
    },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;