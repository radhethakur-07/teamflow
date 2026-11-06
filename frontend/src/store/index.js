import { configureStore } from '@reduxjs/toolkit';
import systemReducer from './slices/systemSlice.js';
import authReducer from './slices/authSlice.js';

export const store = configureStore({
  reducer: {
    system: systemReducer,
    auth: authReducer,
  },
});

export default store;
