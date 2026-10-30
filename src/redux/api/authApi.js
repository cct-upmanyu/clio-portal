import { baseApi } from "./baseApi";
import { clearAuth, setAuthUser } from "../slices/authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => "/auth/me",
      async onQueryStarted(args, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthUser(data.data));
        } catch {
          // Session errors are handled in baseApi; anything else (server down) still ends the check
          if (!getState().auth.isAuthInitialized) dispatch(clearAuth());
        }
      },
    }),
    // Pages finish sign-in themselves (useFinishSignIn) or continue to the MFA step
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    // MFA steps after a successful password sign-in; the backend tracks progress with an HttpOnly ticket cookie.
    // Pages dispatch setAuthUser themselves on success (setup first shows the backup codes).
    getMfaStatus: builder.query({ query: () => "/auth/mfa", keepUnusedDataFor: 0 }),
    startMfaSetup: builder.mutation({
      query: (body = {}) => ({ url: "/auth/mfa/setup", method: "POST", body }),
    }),
    confirmMfaSetup: builder.mutation({
      query: (body) => ({ url: "/auth/mfa/setup/verify", method: "POST", body }),
    }),
    verifyMfa: builder.mutation({
      query: (body) => ({ url: "/auth/mfa/verify", method: "POST", body }),
    }),
    // Callers dispatch clearAuth() afterwards, even if this fails (see SignOutDialog)
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useGetMfaStatusQuery,
  useStartMfaSetupMutation,
  useConfirmMfaSetupMutation,
  useVerifyMfaMutation,
} = authApi;
