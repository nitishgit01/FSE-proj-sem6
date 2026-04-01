import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import type { FormData } from '../components/forms/submissionSchema';

// ─── Response shape from POST /api/submissions ────────────────────────────────

interface SubmissionSuccessResponse {
  success: true;
  data: {
    submissionId: string;
    message: string;
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * React Query mutation for POST /api/submissions.
 *
 * baseURL is already set to VITE_API_URL (e.g. http://localhost:5000/api),
 * so the path here is relative to that base — no need for the /api prefix.
 *
 * On success: returns { success, data: { submissionId, message } }
 * On error:   axios interceptor in lib/axios.ts normalises the error into
 *             { code, message, fields?, nextEligibleDate? }
 */
export function useSubmitSalary() {
  return useMutation<SubmissionSuccessResponse, Error & { code?: string; fields?: Record<string, string>; nextEligibleDate?: string }, FormData>({
    mutationFn: (data: FormData) =>
      axiosInstance
        .post<SubmissionSuccessResponse>('/submissions', data)
        .then((r) => r.data),
  });
}
