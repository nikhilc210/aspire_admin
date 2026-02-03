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
  createAdminStatus: "idle",
  createAdminError: null,
  updatePasswordStatus: "idle",
  updatePasswordError: null,
  updateStatusStatus: "idle",
  updateStatusError: null,
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

// POST /api/admins -> create a new admin
export const createAdmin = createAsyncThunk(
  "admin/createAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const url = "/api/admins";
      const res = await api.post(url, payload);
      return res?.data || null;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to create admin";
      return rejectWithValue(message);
    }
  },
);

// PATCH /api/admins/:id/password -> update admin password
export const updateAdminPassword = createAsyncThunk(
  "admin/updateAdminPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, oldPassword, newPassword } = payload;
      console.log("updateAdminPassword thunk received:", {
        id,
        oldPassword,
        newPassword,
      });
      const url = `/api/admins/${id}/password`;
      console.log("Sending to API:", { oldPassword, newPassword });
      const res = await api.patch(url, { oldPassword, newPassword });
      return res?.data || null;
    } catch (err) {
      console.error("updateAdminPassword error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update password";
      return rejectWithValue(message);
    }
  },
);

// PATCH /api/admins/:id/block -> update admin block status
export const updateAdminStatus = createAsyncThunk(
  "admin/updateAdminStatus",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, isBlocked } = payload;
      console.log("updateAdminStatus thunk received:", { id, isBlocked });
      const url = `/api/admins/${id}/block`;
      console.log("Sending to API:", { blocked: isBlocked });
      const res = await api.patch(url, { blocked: isBlocked });
      return res?.data || null;
    } catch (err) {
      console.error("updateAdminStatus error:", err);
      const message =
        err.response?.data?.message || err.message || "Failed to update status";
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
      .addCase(createAdmin.pending, (state) => {
        state.createAdminStatus = "loading";
        state.createAdminError = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.createAdminStatus = "succeeded";
        const payload = action.payload || {};
        const created = payload.data ?? payload.admin ?? payload ?? null;
        if (created && typeof created === "object") {
          // best-effort update list without knowing backend shape
          if (Array.isArray(state.admins)) {
            const id = created._id ?? created.id;
            const exists = id
              ? state.admins.some((a) => (a?._id ?? a?.id) === id)
              : false;
            if (!exists) state.admins = [created, ...state.admins];
          }
        }
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.createAdminStatus = "failed";
        state.createAdminError =
          action.payload || action.error?.message || "Failed to create admin";
      })
      .addCase(updateAdminPassword.pending, (state) => {
        state.updatePasswordStatus = "loading";
        state.updatePasswordError = null;
      })
      .addCase(updateAdminPassword.fulfilled, (state, action) => {
        state.updatePasswordStatus = "succeeded";
        const payload = action.payload || {};
        const updated = payload.data ?? payload.admin ?? payload ?? null;
        if (updated && typeof updated === "object") {
          const id = updated._id ?? updated.id;
          if (id && Array.isArray(state.admins)) {
            const idx = state.admins.findIndex((a) => (a?._id ?? a?.id) === id);
            if (idx >= 0) {
              state.admins[idx] = { ...state.admins[idx], ...updated };
            }
          }
        }
      })
      .addCase(updateAdminPassword.rejected, (state, action) => {
        state.updatePasswordStatus = "failed";
        state.updatePasswordError =
          action.payload ||
          action.error?.message ||
          "Failed to update password";
      })
      .addCase(updateAdminStatus.pending, (state) => {
        state.updateStatusStatus = "loading";
        state.updateStatusError = null;
      })
      .addCase(updateAdminStatus.fulfilled, (state, action) => {
        state.updateStatusStatus = "succeeded";
        const payload = action.payload || {};
        const updated = payload.data ?? payload.admin ?? payload ?? null;
        if (updated && typeof updated === "object") {
          const id = updated._id ?? updated.id;
          if (id && Array.isArray(state.admins)) {
            const idx = state.admins.findIndex((a) => (a?._id ?? a?.id) === id);
            if (idx >= 0) {
              state.admins[idx] = { ...state.admins[idx], ...updated };
            }
          }
        }
      })
      .addCase(updateAdminStatus.rejected, (state, action) => {
        state.updateStatusStatus = "failed";
        state.updateStatusError =
          action.payload || action.error?.message || "Failed to update status";
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
