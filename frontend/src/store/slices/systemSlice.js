import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { healthService } from '../../services/healthService.js';

export const checkBackendConnection = createAsyncThunk(
  'system/checkBackendConnection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await healthService.checkHealth();
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Could not reach backend API');
    }
  }
);

const systemSlice = createSlice({
  name: 'system',
  initialState: {
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    healthData: null,
    latencyMs: null,
    error: null,
    lastChecked: null,
  },
  reducers: {
    resetHealthStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkBackendConnection.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkBackendConnection.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.healthData = action.payload.data;
        state.latencyMs = action.payload.latencyMs;
        state.error = null;
        state.lastChecked = new Date().toISOString();
      })
      .addCase(checkBackendConnection.rejected, (state, action) => {
        state.status = 'failed';
        state.healthData = null;
        state.latencyMs = null;
        state.error = action.payload || 'Backend unreachable';
        state.lastChecked = new Date().toISOString();
      });
  },
});

export const { resetHealthStatus } = systemSlice.actions;
export default systemSlice.reducer;
