import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

const initialState = {
  applications: [],
  applicationsStatus: "idle",
  applicationsError: null,
};

// GET /api/applications -> fetch list of applications
export const fetchApplications = createAsyncThunk(
  "applications/fetchApplications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/applications");
      return res?.data || null;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch applications";
      return rejectWithValue(message);
    }
  },
);

const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.applicationsStatus = "loading";
        state.applicationsError = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.applicationsStatus = "succeeded";
        const payload = action.payload || {};
        // backend might return { applications, data, items, ... }
        state.applications =
          payload.applications ??
          payload.data ??
          payload.items ??
          payload ??
          [];
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.applicationsStatus = "failed";
        state.applicationsError =
          action.payload ||
          action.error?.message ||
          "Failed to fetch applications";
      });
  },
});

export default applicationSlice.reducer;
