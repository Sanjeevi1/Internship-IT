import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface DashboardStats {
  totalStudents: number;
  activeInternships: number;
  odRequests: number;
  completedInternships: number;
  recentInternships: Array<{
    id: string;
    studentName: string;
    company: string;
    startDate: string;
    status: 'completed' | 'ongoing' | 'pending';
  }>;
  recentODRequests: Array<{
    id: string;
    studentName: string;
    purpose: string;
    date: string;
    status: 'approved' | 'pending' | 'rejected';
  }>;
}

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk<DashboardStats>(
  'dashboard/fetchStats',
  async () => {
    const response = await axios.get('/api/dashboard/stats');
    return response.data;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      });
  },
});

export default dashboardSlice.reducer; 