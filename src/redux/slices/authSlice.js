import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isAuthInitialized: false,
  signOutReason: null,
  accessDenied: false,
  accessDeniedMessage: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser(state, action) {
      state.user = action.payload || null;
      state.isAuthenticated = Boolean(action.payload);
      state.isAuthInitialized = true;
      state.signOutReason = null;
    },
    // payload: 'expired' to tell the user why they were signed out, otherwise nothing
    clearAuth(state, action) {
      state.user = null;
      state.isAuthenticated = false;
      state.isAuthInitialized = true;
      state.signOutReason = action.payload || null;
      state.accessDenied = false;
      state.accessDeniedMessage = "";
    },
    setAccessDenied(state, action) {
      state.accessDenied = true;
      state.accessDeniedMessage = action.payload || "You do not have permission to view this.";
    },
    clearAccessDenied(state) {
      state.accessDenied = false;
      state.accessDeniedMessage = "";
    },
  },
});

export const { setAuthUser, clearAuth, setAccessDenied, clearAccessDenied } = authSlice.actions;
export default authSlice.reducer;
