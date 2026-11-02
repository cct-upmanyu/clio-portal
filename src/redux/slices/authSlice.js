import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isAuthInitialized: false,
  // The startup session check couldn't reach the server (network or 5xx): neither signed in nor out
  authCheckFailed: false,
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
      state.authCheckFailed = false;
      state.signOutReason = null;
    },
    // Profile changes made while signed in (e.g. editing yourself in the Admin Console)
    updateAuthUser(state, action) {
      if (state.user) Object.assign(state.user, action.payload);
    },
    setSelectedMatterId(state, action) {
      if (state.user) state.user.selectedMatterId = action.payload;
    },
    setAuthCheckFailed(state) {
      state.authCheckFailed = true;
    },
    // payload: 'expired' or 'disabled' to tell the user why they were signed out, otherwise nothing
    clearAuth(state, action) {
      state.user = null;
      state.isAuthenticated = false;
      state.isAuthInitialized = true;
      state.authCheckFailed = false;
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

export const { setAuthUser, clearAuth, setAuthCheckFailed, setSelectedMatterId, updateAuthUser, setAccessDenied, clearAccessDenied } = authSlice.actions;
export default authSlice.reducer;
