import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  permissions: [],
  isAuthenticated: false,
  isAuthInitialized: false,
  accessDenied: false,
  accessDeniedMessage: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser(state, action) {
      state.user = action.payload?.user || action.payload || null;
      state.permissions = Array.isArray(action.payload?.permissions) ? action.payload.permissions : [];
      state.isAuthenticated = Boolean(action.payload?.user || action.payload);
      state.isAuthInitialized = true;
    },
    clearAuth(state) {
      state.user = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.isAuthInitialized = true;
      state.accessDenied = false;
      state.accessDeniedMessage = "";
    },
    setAccessDenied(state, action) {
      state.accessDenied = true;
      state.accessDeniedMessage = action.payload || "Access denied";
    },
    clearAccessDenied(state) {
      state.accessDenied = false;
      state.accessDeniedMessage = "";
    },
  },
});

export const { setAuthUser, clearAuth, setAccessDenied, clearAccessDenied } = authSlice.actions;
export default authSlice.reducer;
