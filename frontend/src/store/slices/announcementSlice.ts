import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Announcement } from '../../types';

interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

const initialState: AnnouncementState = {
  announcements: [],
  loading: false,
  error: null,
};

export const fetchAnnouncements = createAsyncThunk(
  'announcement/fetchAll',
  async () => {
    const response = await api.get<Announcement[]>('/announcements');
    return response.data;
  }
);

export const createAnnouncement = createAsyncThunk(
  'announcement/create',
  async (content: string) => {
    const response = await api.post<Announcement>('/announcements', { content });
    return response.data;
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'announcement/delete',
  async (id: string) => {
    await api.delete(`/announcements/${id}`);
    return id;
  }
);

const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch announcements';
      })
      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements.unshift(action.payload);
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create announcement';
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter(
          (announcement) => announcement._id !== action.payload
        );
      });
  },
});

export default announcementSlice.reducer; 