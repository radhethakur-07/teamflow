import { configureStore } from '@reduxjs/toolkit';
import systemReducer from './slices/systemSlice.js';

export const store = configureStore({
  reducer: {
    system: systemReducer,
  },
});

export default store;
