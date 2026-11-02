import { baseApi } from "./baseApi";
import { updateAuthUser } from "../slices/authSlice";

// Admin Console (firm staff only)
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // { users, roles }: roles are the ones an invitation can give
    getAdminUsers: builder.query({
      query: () => "/admin/users",
      transformResponse: (response) => response.data,
      providesTags: ["AdminUsers"],
    }),
    // { unreadMessages: [{ matter, unreadCount, latest: { body, sentAt, sender } }], totalUnread }:
    // client messages no one at the firm has read yet
    getAdminDashboard: builder.query({
      query: () => "/admin/dashboard",
      transformResponse: (response) => response.data,
      providesTags: ["AdminDashboard"],
    }),
    getAdminMatters: builder.query({
      query: () => "/admin/matters",
      transformResponse: (response) => response.data.matters,
      providesTags: ["AdminMatters"],
    }),
    // { id, firstName?, lastName?, email?, phone?, timezone? }. Your own email can't be changed.
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/users/${id}`, method: "PATCH", body }),
      transformResponse: (response) => response.data,
      async onQueryStarted({ id }, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Editing yourself: the top bar name and every time on screen update straight away
          if (String(getState().auth.user?.id) === String(id)) {
            dispatch(updateAuthUser({ firstName: data.firstName, lastName: data.lastName, timezone: data.timezone }));
          }
        } catch {
          // The dialog shows why
        }
      },
      invalidatesTags: (result, error) => (error ? [] : ["AdminUsers"]),
    }),
    // A new account, or for an existing client an invitation to one more matter (data.invitation.type === 'matter')
    inviteUser: builder.mutation({
      query: (body) => ({ url: "/auth/invitations", method: "POST", body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error) => (error ? [] : ["AdminUsers", "AdminMatters"]),
    }),
    // Takes a client off a matter (admins only). Their messages and history on it stay.
    removeMatterContact: builder.mutation({
      query: ({ crmMatterId, userId }) => ({ url: `/admin/matters/${crmMatterId}/contacts/${userId}/remove`, method: "POST" }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error) => (error ? [] : ["AdminMatters", "AdminDashboard", "Activity"]),
    }),
  }),
});

export const {
  useGetAdminDashboardQuery, useGetAdminUsersQuery, useGetAdminMattersQuery, useInviteUserMutation, useUpdateUserMutation,
  useRemoveMatterContactMutation,
} = adminApi;
