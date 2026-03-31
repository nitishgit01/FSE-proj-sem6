import axios from 'axios';

/**
 * Shared axios instance for all API calls in the WageGlass client.
 *
 * Configured with:
 * - base URL from environment variables
 * - withCredentials = true to ensure HttpOnly cookies (wg_token) are sent/received
 * - Structured error handling via interceptors
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Interceptors ─────────────────────────────────────────────────────────────

/**
 * Response Interceptor:
 * - Handle 401 Unauthorized by clearing the local session and redirecting to login.
 * - Normalize error payloads from the backend for easier use in React components.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle session expiration (401)
    if (error.response?.status === 401) {
      // "Logout equivalent" — a hard redirect to login ensures any in-memory state is cleared
      // and the user is forced to re-authenticate.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 2. Normalize and re-throw structured backend errors
    // Shape: { code: string, message: string, fields?: Record<string, string> }
    const backendError = error.response?.data?.error;

    if (backendError) {
      // Re-throw the structured error object
      return Promise.reject({
        code:    backendError.code    || 'UNKNOWN_ERROR',
        message: backendError.message || 'An unexpected error occurred.',
        fields:  backendError.fields,
      });
    }

    // Fallback for network errors or unexpected responses
    return Promise.reject({
      code:    'NETWORK_ERROR',
      message: error.message || 'Unable to connect to the server.',
    });
  }
);

export default axiosInstance;
