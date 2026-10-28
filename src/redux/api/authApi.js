import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "../../config/env";
import { clearAuth, setAccessDenied, setAuthUser } from "../slices/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${env.apiUrl}/auth`,
  credentials: "include",
});

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    const method = String(args?.method || "GET").toUpperCase();

    if (result?.error?.status === 403 && method === "GET") {
      api.dispatch(setAccessDenied(result.error.data?.message || "Access denied"));
    }

    return result;
  },
  endpoints: (builder) => ({
    getMe: builder.query({
      query() {
        return {
          url: "/me",
          method: "GET",
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthUser({
            user: data?.user || null,
            permissions: data?.permissions || [],
          }));
        } catch (error) {
          dispatch(clearAuth());
        }
      },
    }),
    login: builder.mutation({
      query(body) {
        return {
          url: "/login",
          method: "POST",
          // Form-encoded (not JSON) so the browser skips the CORS preflight,
          // which the Catalyst gateway answers without CORS headers
          body: new URLSearchParams(body),
        };
      },
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
} = authApi;
