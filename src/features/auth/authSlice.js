import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthToken } from "../../lib/api";

// Helper to read token from storage safely
const loadInitial = () => {
  if (typeof window === "undefined") return { token: null };
  return {
    token:
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token") ||
      null,
  };
};

const initialState = {
  ...loadInitial(),
  profile: null,
  status: "idle",
  error: null,
};

// POST /api/user/auth/login -> expects { token, user }
export const loginUser = createAsyncThunk(
  "auth/loginUser",
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

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const url = "/api/user/auth/me";
      const res = await api.get(url);
      return res?.data || null;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to fetch profile";
      return rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const url = "/api/user/auth/logout";
      const res = await api.post(url);
      // clear local storage (also handled in extraReducers)
      try {
        localStorage.removeItem("auth_token");
      } catch {
        /* ignore */
      }
      setAuthToken(null);
      return res?.data || null;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to logout";
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload || null;
    },
    clearToken: (state) => {
      state.token = null;
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        // payload shape: { token, user, data }
        const payload = action.payload || {};
        const token = payload.token ?? payload.data?.token ?? null;
        if (token) {
          state.token = token;
          try {
            localStorage.setItem("auth_token", token);
          } catch {
            /* ignore */
          }
          setAuthToken(token);
        }
        state.profile = payload.user ?? payload.data?.user ?? null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message || "Login failed";
      })

      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload?.data || action.payload || null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error?.message || "Failed to fetch profile";
      })

      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.token = null;
        state.profile = null;
        try {
          localStorage.removeItem("auth_token");
        } catch {
          /* ignore */
        }
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error?.message || "Failed to logout";
      });
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
