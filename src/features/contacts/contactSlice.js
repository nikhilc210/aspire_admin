import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

const initialState = {
  contacts: [],
  contactsStatus: "idle",
  contactsError: null,
};

// GET /api/contacts -> fetch list of contact submissions
export const fetchContacts = createAsyncThunk(
  "contacts/fetchContacts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/contacts");
      return res?.data || null;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch contacts";
      return rejectWithValue(message);
    }
  },
);

const contactSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.contactsStatus = "loading";
        state.contactsError = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contactsStatus = "succeeded";
        const payload = action.payload || {};
        state.contacts = payload.data ?? payload.contacts ?? payload ?? [];
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.contactsStatus = "failed";
        state.contactsError =
          action.payload || action.error?.message || "Failed to fetch contacts";
      });
  },
});

export default contactSlice.reducer;
