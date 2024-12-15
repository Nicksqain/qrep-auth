import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ReferrerState {
  referrer: string | null;
}

const initialState: ReferrerState = {
  referrer: localStorage.getItem("referrer"),
};

const referrerSlice = createSlice({
  name: "referrer",
  initialState,
  reducers: {
    setReferrer: (state, action: PayloadAction<string | null>) => {
      state.referrer = action.payload;
      if (action.payload) {
        localStorage.setItem("referrer", action.payload);
      } else {
        localStorage.removeItem("referrer");
      }
    },
  },
});

export const { setReferrer } = referrerSlice.actions;
export default referrerSlice.reducer;
