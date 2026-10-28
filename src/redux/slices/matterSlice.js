import { createSlice } from "@reduxjs/toolkit";

export const SELECTED_MATTER_KEY = "portal.selectedMatterId";

const readStoredMatterId = () => {
  try {
    return localStorage.getItem(SELECTED_MATTER_KEY);
  } catch {
    return null;
  }
};

const matterSlice = createSlice({
  name: "matter",
  initialState: {
    selectedMatterId: readStoredMatterId(),
  },
  reducers: {
    setSelectedMatter(state, action) {
      state.selectedMatterId = action.payload;
    },
  },
});

export const { setSelectedMatter } = matterSlice.actions;
export default matterSlice.reducer;
