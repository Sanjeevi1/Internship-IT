import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { OD } from '../../types';
import { apiWithRetry } from '../../services/apiRetry';

interface ODState {
  ods: OD[];
  loading: boolean;
  error: string | null;
}

const initialState: ODState = {
  ods: [],
  loading: false,
  error: null,
};

export const fetchODs = createAsyncThunk('od/fetchODs', async () => {
  const response = await apiWithRetry.get<OD[]>('/od', {
    maxRetries: 3,
    retryDelay: 1000,
  });
  return response.data;
});

export const createOD = createAsyncThunk(
  'od/create',
  async (data: {
    internship: string;
    startDate: string;
    endDate: string;
    purpose: string;
  }) => {
    const response = await apiWithRetry.post<OD>('/od', data);
    return response.data;
  }
);

export const updateODStatus = createAsyncThunk(
  'od/updateStatus',
  async ({ id, approved }: { id: string; approved: boolean }) => {
    const response = await apiWithRetry.patch<OD>(`/od/${id}`, { approved }, {
      maxRetries: 2,
      retryDelay: 500,
    });
    return response.data;
  }
);

const odSlice = createSlice({
  name: 'od',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchODs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchODs.fulfilled, (state, action) => {
        state.loading = false;
        state.ods = action.payload;
      })
      .addCase(fetchODs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch OD requests';
      })
      .addCase(createOD.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOD.fulfilled, (state, action) => {
        state.loading = false;
        state.ods.unshift(action.payload);
      })
      .addCase(createOD.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create OD request';
      })
      .addCase(updateODStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateODStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOD = action.payload;
        const index = state.ods.findIndex((od) => od._id === updatedOD._id);
        if (index !== -1) {
          state.ods[index] = updatedOD;
        }
      })
      .addCase(updateODStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update OD status';
      });
  },
});

export default odSlice.reducer; 