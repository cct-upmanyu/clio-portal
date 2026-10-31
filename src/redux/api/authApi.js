import { baseApi } from "./baseApi";
import { setAuthCheckFailed, setAuthUser } from "../slices/authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => "/auth/me",
      async onQueryStarted(args, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthUser(data.data));
        } catch {
          // A real "not signed in" was already handled in baseApi (clearAuth). Anything else means the
          // server couldn't answer: that's not a sign-out, so the guards offer a retry instead.
          if (!getState().auth.isAuthInitialized) dispatch(setAuthCheckFailed());
        }
      },
    }),
    // Pages finish sign-in themselves (useFinishSignIn) or continue to the MFA step
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    // "Email me a sign-in code": the reply is the same whether or not the account exists
    requestLoginCode: builder.mutation({
      query: (body) => ({ url: "/auth/login/code", method: "POST", body }),
    }),
    // Same result as login: signed in, or continue to the MFA step
    verifyLoginCode: builder.mutation({
      query: (body) => ({ url: "/auth/login/code/verify", method: "POST", body }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/auth/password/forgot", method: "POST", body }),
    }),
    // POST because the first call starts the window for choosing a new password
    verifyResetLink: builder.query({
      query: (token) => ({ url: "/auth/password/reset/verify", method: "POST", body: { token } }),
      keepUnusedDataFor: 0,
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/auth/password/reset", method: "POST", body }),
    }),
    // Invitation: open the link, confirm the emailed code, then finish (password optional)
    verifyInvite: builder.query({
      query: (token) => ({ url: "/auth/invite/verify", method: "POST", body: { token } }),
      keepUnusedDataFor: 0,
    }),
    sendInviteCode: builder.mutation({
      query: (token) => ({ url: "/auth/invite/code", method: "POST", body: { token } }),
    }),
    verifyInviteCode: builder.mutation({
      query: (body) => ({ url: "/auth/invite/code/verify", method: "POST", body }),
    }),
    completeInvite: builder.mutation({
      query: (body) => ({ url: "/auth/invite/complete", method: "POST", body }),
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
      // A backup code is used up: refresh the "codes left" count on the Security page
      invalidatesTags: (result, error, body) => (!error && body?.recoveryCode ? ["MfaFactors"] : []),
    }),
    startAddFactor: builder.mutation({
      query: (body) => ({ url: "/auth/mfa/factors", method: "POST", body }),
    }),
    verifyNewFactor: builder.mutation({
      query: ({ factorId, code }) => ({ url: `/auth/mfa/factors/${factorId}/verify`, method: "POST", body: { code } }),
      invalidatesTags: ["MfaFactors"],
    }),
    // `code` must come from one of the user's other authenticators
    removeFactor: builder.mutation({
      query: ({ factorId, code }) => ({ url: `/auth/mfa/factors/${factorId}/remove`, method: "POST", body: { code } }),
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
  useRequestLoginCodeMutation,
  useVerifyLoginCodeMutation,
  useForgotPasswordMutation,
  useVerifyResetLinkQuery,
  useResetPasswordMutation,
  useVerifyInviteQuery,
  useSendInviteCodeMutation,
  useVerifyInviteCodeMutation,
  useCompleteInviteMutation,
  useGetMfaStatusQuery,
  useStartMfaSetupMutation,
  useConfirmMfaSetupMutation,
  useVerifyMfaMutation,
  useGetMfaFactorsQuery,
  useMfaStepUpMutation,
  useStartAddFactorMutation,
  useVerifyNewFactorMutation,
  useRegenerateRecoveryCodesMutation,
  useRemoveFactorMutation,
} = authApi;
