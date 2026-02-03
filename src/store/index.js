import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import adminReducer from "../features/admin/adminSlice";
import jobReducer from "../features/jobs/jobSlice";
import contactsReducer from "../features/contacts/contactSlice";
import applicationsReducer from "../features/applications/applicationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    jobs: jobReducer,
    contacts: contactsReducer,
    applications: applicationsReducer,
  },
});

export default store;
