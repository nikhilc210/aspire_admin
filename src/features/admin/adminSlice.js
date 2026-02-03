import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthToken } from "../../lib/api";

// load admin token from storage
const loadInitial = () => {
  if (typeof window === "undefined") return { adminToken: null };
  return {
    adminToken:
      localStorage.getItem("admin_token") ||
      sessionStorage.getItem("admin_token") ||
      null,
  };
};

const initialState = {
  ...loadInitial(),
  admin: null,
  admins: [],
  adminsStatus: "idle",
  adminsError: null,
  status: "idle",
  error: null,
};

// POST /api/admins/login
export const adminLogin = createAsyncThunk(
  "admin/adminLogin",
  async (credentials, { rejectWithValue }) => {
    try {
      const url = "/api/admins/login";
      const res = await api.post(url, credentials);
      return res?.data || null;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      return rejectWithValue(message);
    }
  },
);

export const adminLogout = createAsyncThunk(
  "admin/adminLogout",
  async (_, { rejectWithValue }) => {
    try {
      const url = "/api/admins/logout";
      const res = await api.post(url);
      try {
        localStorage.removeItem("admin_token");
      } catch {
        /* ignore */
      }
      setAuthToken(null);
      return res?.data || null;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Logout failed";
      return rejectWithValue(message);
    }
  },
);

// GET /api/admins -> fetch list of all admins
export const fetchAdmins = createAsyncThunk(
  "admin/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const url = "/api/admins";
      const res = await api.get(url);
      return res?.data || null;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to fetch admins";
      return rejectWithValue(message);
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminToken: (state, action) => {
      state.adminToken = action.payload || null;
    },
    clearAdminToken: (state) => {
      state.adminToken = null;
      state.admin = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload || {};
        const token = payload.token ?? payload.data?.token ?? null;
        if (token) {
          state.adminToken = token;
          try {
            localStorage.setItem("admin_token", token);
          } catch {
            /* ignore */
          }
          setAuthToken(token);
        }
        // backend returns admin under `admin` or as payload
        state.admin = payload.admin ?? payload.data?.admin ?? null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message || "Login failed";
      })
      .addCase(fetchAdmins.pending, (state) => {
        state.adminsStatus = "loading";
        state.adminsError = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.adminsStatus = "succeeded";
        // backend may return { data: [...] } or array directly
        const payload = action.payload || {};
        state.admins = payload.data ?? payload.admins ?? payload ?? [];
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.adminsStatus = "failed";
        state.adminsError =
          action.payload || action.error?.message || "Failed to fetch admins";
      })
      .addCase(adminLogout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.status = "succeeded";
        state.adminToken = null;
        state.admin = null;
        try {
          localStorage.removeItem("admin_token");
        } catch {
          /* ignore */
        }
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error?.message || "Logout failed";
      });
  },
});

export const { setAdminToken, clearAdminToken } = adminSlice.actions;
export default adminSlice.reducer;
