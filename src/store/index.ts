import { Action, combineReducers, configureStore } from "@reduxjs/toolkit";
import { countrySlice, referrerSlice } from "../slices";

const appReducer = combineReducers({
  countrySlice,
  referrerSlice,
});

const rootReducer = (state: any, action: Action) => {
  if (action.type === "USER_LOGOUT") {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
