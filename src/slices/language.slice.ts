import { createSlice } from "@reduxjs/toolkit";
import i18n from "../i18n";
import { Language } from "../constants/languages";

const initialState = {
  language: localStorage.getItem("language") || "kz",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: { payload: Language }) => {
      state.language = action.payload;
      i18n.changeLanguage(action.payload);
      localStorage.setItem("language", action.payload);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
