import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

const initialState = {
  jobs: [],
  jobsStatus: "idle",
  jobsError: null,
  createJobStatus: "idle",
  createJobError: null,
  updateStatusStatus: "idle",
  updateStatusError: null,
};

// GET /api/jobs -> fetch list of all jobs
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_, { rejectWithValue }) => {
    try {
      const url = "/api/jobs";
      const res = await api.get(url);
      return res?.data || null;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to fetch jobs";
      return rejectWithValue(message);
    }
  },
);

// POST /api/jobs -> create a new job
export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/jobs", payload);
      return res?.data || payload;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to create job";
      return rejectWithValue(message);
    }
  },
);

// PATCH /api/jobs/:id/block -> update job blocked status
export const updateJobStatus = createAsyncThunk(
  "jobs/updateJobStatus",
  async ({ id, blocked }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/api/jobs/${id}/block`, { blocked });
      return res?.data || { id, blocked };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update job status";
      return rejectWithValue(message);
    }
  },
);

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.jobsStatus = "loading";
        state.jobsError = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.jobsStatus = "succeeded";
        const payload = action.payload || {};
        state.jobs = payload.data ?? payload.jobs ?? payload ?? [];
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.jobsStatus = "failed";
        state.jobsError =
          action.payload || action.error?.message || "Failed to fetch jobs";
      })
      .addCase(createJob.pending, (state) => {
        state.createJobStatus = "loading";
        state.createJobError = null;
      })
      .addCase(createJob.fulfilled, (state) => {
        state.createJobStatus = "succeeded";
        state.createJobError = null;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.createJobStatus = "failed";
        state.createJobError =
          action.payload || action.error?.message || "Failed to create job";
      })
      .addCase(updateJobStatus.pending, (state) => {
        state.updateStatusStatus = "loading";
        state.updateStatusError = null;
      })
      .addCase(updateJobStatus.fulfilled, (state) => {
        state.updateStatusStatus = "succeeded";
        state.updateStatusError = null;
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.updateStatusStatus = "failed";
        state.updateStatusError =
          action.payload ||
          action.error?.message ||
          "Failed to update job status";
      });
  },
});

export default jobSlice.reducer;
