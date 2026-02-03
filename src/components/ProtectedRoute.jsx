import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth?.token);
  const adminToken = useSelector((state) => state.admin?.adminToken);

  // fallback to localStorage if store isn't hydrated
  const isAuthed = Boolean(
    token ||
    adminToken ||
    (typeof window !== "undefined" &&
      (localStorage.getItem("auth_token") ||
        localStorage.getItem("admin_token"))),
  );

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
