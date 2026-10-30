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
    // Signed in: manage authenticators. Adding one needs a fresh identity check (mfaStepUp) first.
    getMfaFactors: builder.query({ query: () => "/auth/mfa/factors", providesTags: ["MfaFactors"] }),
    mfaStepUp: builder.mutation({
      query: (body) => ({ url: "/auth/mfa/step-up", method: "POST", body }),
    }),
    startAddFactor: builder.mutation({
      query: (body) => ({ url: "/auth/mfa/factors", method: "POST", body }),
    }),
    verifyNewFactor: builder.mutation({
      query: ({ factorId, code }) => ({ url: `/auth/mfa/factors/${factorId}/verify`, method: "POST", body: { code } }),
      invalidatesTags: ["MfaFactors"],
    }),
    regenerateRecoveryCodes: builder.mutation({
      query: () => ({ url: "/auth/mfa/recovery-codes", method: "POST" }),
      invalidatesTags: ["MfaFactors"],
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
  useGetMfaFactorsQuery,
  useMfaStepUpMutation,
  useStartAddFactorMutation,
  useVerifyNewFactorMutation,
  useRegenerateRecoveryCodesMutation,
} = authApi;
