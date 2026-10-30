import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "../../config/env";
import { clearAuth, setAccessDenied } from "../slices/authSlice";
import { toast } from "../../utils/toast";

const SESSION_ERROR_CODES = ["NOT_SIGNED_IN", "SESSION_EXPIRED", "INVALID_SESSION"];
const SILENT_ENDPOINTS = ["getMe"];

const isSessionError = (error) => error?.status === 401 && SESSION_ERROR_CODES.includes(error?.data?.code);
const isForbidden = (error) => error?.status === 403 && error?.data?.code === "FORBIDDEN";
// FETCH_ERROR, TIMEOUT_ERROR, PARSING_ERROR... and 5xx: nothing the page can say better
const isServerOrNetworkError = (error) => typeof error?.status !== "number" || error.status >= 500;

// Pages skip their own error toast for these, so the user never sees two
export const isHandledGlobally = (error) =>
  isSessionError(error) || isForbidden(error) || isServerOrNetworkError(error);

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiUrl,
  credentials: "include",
});

// Every request goes through here. Matching on error codes (not just status) keeps
// e.g. a wrong password (401 INVALID_CREDENTIALS) from being treated as a lost session.
const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const { error } = result;
  if (!error) return result;

  // The startup session check fails quietly: the guard just sends the user to /login
  const silent = SILENT_ENDPOINTS.includes(api.endpoint);

  if (isSessionError(error)) {
    const wasSignedIn = api.getState().auth.isAuthenticated;
    const expired = !silent && (wasSignedIn || error.data.code !== "NOT_SIGNED_IN");
    api.dispatch(clearAuth(expired ? "expired" : null));
  } else if (isForbidden(error)) {
    api.dispatch(setAccessDenied(error.data.message));
  } else if (silent) {
    return result;
  } else if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
    toast.error("Unable to reach the server", { description: "Check your internet connection and try again." });
  } else if (isServerOrNetworkError(error)) {
    toast.error("Something went wrong", { description: "Please try again in a moment." });
  }

  return result;
};

// Feature APIs add their endpoints with baseApi.injectEndpoints so they share this handling and cache
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: () => ({}),
});
