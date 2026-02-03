import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://aspire-backend-piyf.onrender.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      localStorage.setItem("auth_token", token);
    } catch {
      /* ignore storage errors */
    }
  } else {
    delete api.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem("auth_token");
    } catch {
      /* ignore */
    }
  }
}

// initialize token from storage if present
try {
  const existing = localStorage.getItem("auth_token");
  if (existing) {
    api.defaults.headers.common["Authorization"] = `Bearer ${existing}`;
  }
} catch {
  /* ignore */
}

// optional request interceptor (logging)
api.interceptors.request.use(
  (cfg) => cfg,
  (err) => Promise.reject(err),
);

// handle 401 responses globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const reqUrl = error?.config?.url || "";

    // If it's an auth-related endpoint (login/logout/me), don't perform a global redirect
    // Let the thunk or caller handle authentication errors (so login can show validation errors)
    const isAuthEndpoint =
      /auth\/login|admins\/login|auth\/logout|admins\/logout|auth\/me/.test(
        reqUrl,
      );

    if (status === 401 && !isAuthEndpoint) {
      // clear stored tokens and redirect to login
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("admin_token");
      } catch {
        /* ignore */
      }
      // simple redirect - router guards can provide a better UX
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
