import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Internship } from '../../types';

interface InternshipState {
  internships: Internship[];
  loading: boolean;
  error: string | null;
}

const initialState: InternshipState = {
  internships: [],
  loading: false,
  error: null,
};

export const fetchInternships = createAsyncThunk(
  'internship/fetchAll',
  async () => {
    const response = await api.get<Internship[]>('/internships');
    return response.data;
  }
);

export const fetchMyInternships = createAsyncThunk(
  'internship/fetchMy',
  async () => {
    const response = await api.get<Internship[]>('/internships');
    return response.data;
  }
);

export const createInternship = createAsyncThunk(
  'internship/create',
  async (formData: FormData) => {
    const response = await api.post<Internship>('/internships', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const updateInternshipStatus = createAsyncThunk(
  'internship/updateStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await api.put<Internship>(`/internships/${id}`, {
      status,
    });
    return response.data;
  }
);

export const uploadCompletionCertificate = createAsyncThunk(
  'internship/uploadCertificate',
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const response = await api.put<Internship>(
      `/internships/${id}/certificate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
);

const internshipSlice = createSlice({
  name: 'internship',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInternships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInternships.fulfilled, (state, action) => {
        state.loading = false;
        state.internships = action.payload;
      })
      .addCase(fetchInternships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch internships';
      })
      .addCase(fetchMyInternships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyInternships.fulfilled, (state, action) => {
        state.loading = false;
        state.internships = action.payload;
      })
      .addCase(fetchMyInternships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch internships';
      })
      .addCase(createInternship.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInternship.fulfilled, (state, action) => {
        state.loading = false;
        state.internships.push(action.payload);
      })
      .addCase(createInternship.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create internship';
      })
      .addCase(updateInternshipStatus.fulfilled, (state, action) => {
        const index = state.internships.findIndex(
          (internship) => internship._id === action.payload._id
        );
        if (index !== -1) {
          state.internships[index] = action.payload;
        }
      })
      .addCase(uploadCompletionCertificate.fulfilled, (state, action) => {
        const index = state.internships.findIndex(
          (internship) => internship._id === action.payload._id
        );
        if (index !== -1) {
          state.internships[index] = action.payload;
        }
      });
  },
});

export default internshipSlice.reducer; 