import { baseApi } from "./baseApi";
import { setSelectedMatterId } from "../slices/authSlice";
import { toast } from "../../utils/toast";

export const matterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMatters: builder.query({
      query: () => "/matters",
      transformResponse: (response) => response.data,
      providesTags: ["Matters"],
    }),
    // Built from the selection saved on the user, so it refetches after each switch
    getDashboard: builder.query({
      query: () => "/dashboard",
      transformResponse: (response) => response.data,
      providesTags: ["Dashboard"],
    }),
    // Switches right away; the saved choice is what the next sign-in (on any device) opens on
    selectMatter: builder.mutation({
      query: (matterId) => ({ url: "/matters/selected", method: "PUT", body: { matterId } }),
      async onQueryStarted(matterId, { dispatch, getState, queryFulfilled }) {
        const previousId = getState().auth.user?.selectedMatterId ?? null;
        dispatch(setSelectedMatterId(matterId));
        try {
          await queryFulfilled;
        } catch (err) {
          dispatch(setSelectedMatterId(previousId));
          if (err?.error?.status === 404) {
            toast.error("That matter is no longer available");
            dispatch(matterApi.util.invalidateTags(["Matters"]));
          }
        }
      },
      invalidatesTags: (result, error) => (error ? [] : ["Dashboard"]),
    }),
    // The link in a matter-invite email: which matter it's for. POST, but changes nothing.
    verifyMatterInvitation: builder.query({
      query: (token) => ({ url: "/matters/invitations/verify", method: "POST", body: { token } }),
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 0,
    }),
    // The accepted matter becomes the selected one
    acceptMatterInvitation: builder.mutation({
      query: (matterId) => ({ url: `/matters/${matterId}/accept`, method: "POST" }),
      transformResponse: (response) => response.data,
      async onQueryStarted(matterId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setSelectedMatterId(data.selectedMatterId));
        } catch {
          // Callers show why
        }
      },
      invalidatesTags: (result, error) => (error ? [] : ["Matters", "Dashboard"]),
    }),
  }),
});

export const {
  useGetMattersQuery,
  useGetDashboardQuery,
  useSelectMatterMutation,
  useVerifyMatterInvitationQuery,
  useAcceptMatterInvitationMutation,
} = matterApi;
