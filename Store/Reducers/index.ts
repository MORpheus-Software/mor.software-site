import { combineReducers } from "redux";
import { persistReducer, createMigrate } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createAction } from "@reduxjs/toolkit";

import session from "./session";
import loadings from "./loadings";

const persistConfig = {
  version: 1,
  key: "stethm-staking-ts",
  storage,
  whitelist: ["app"],
  migrate: createMigrate({
    1: (state: any) => ({
      ...state,
    }),
  }),
};

export const logout = createAction("USER_LOGOUT");

const reducers = combineReducers({
  session,
  loadings,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "USER_LOGOUT") {
    localStorage.removeItem("persist:stethm-staking-ts");
    return reducers(undefined, action);
  }
  return reducers(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default persistedReducer;
