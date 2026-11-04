import { baseApi } from "./baseApi";
import { updateAuthUser } from "../slices/authSlice";

// Admin Console (firm staff only)
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // One page, filtered and counted on the server. Arg: { page, perPage, search, role, status } (all optional;
    // per page is at most 250). Returns { users, counts, pagination: { page, perPage, total, totalPages },
    // roleFilters, roles (the ones an invitation can give), defaultTimezone }.
    getAdminUsers: builder.query({
      query: ({ page, perPage, search, role, status } = {}) => {
        const params = new URLSearchParams();
        if (page) params.set("page", page);
        if (perPage) params.set("per_page", perPage);
        if (search) params.set("search", search);
        if (role) params.set("role", role);
        if (status) params.set("status", status);
        const qs = params.toString();
        return `/admin/users${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response) => response.data,
      providesTags: ["AdminUsers"],
    }),
    // { user, defaultTimezone }
    getAdminUser: builder.query({
      query: (id) => `/admin/users/${id}`,
      transformResponse: (response) => response.data,
      providesTags: ["AdminUsers"],
    }),
    // { activeClients, activeUsers, activeWithMfa }
    getAdminUserStats: builder.query({
      query: () => "/admin/users/stats",
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
    // One page, filtered and counted on the server. Arg: { page, perPage, search, status } (all optional;
    // per page is at most 200). Returns { matters, counts: { all, Open, Pending, Closed }, pagination }.
    getAdminMatters: builder.query({
      query: ({ page, perPage, search, status } = {}) => {
        const params = new URLSearchParams();
        if (page) params.set("page", page);
        if (perPage) params.set("per_page", perPage);
        if (search) params.set("search", search);
        if (status) params.set("status", status);
        const qs = params.toString();
        return `/admin/matters${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response) => response.data,
      providesTags: ["AdminMatters"],
    }),
    // One matter (by its portal id) with its clients
    getAdminMatter: builder.query({
      query: (matterId) => `/admin/matters/${matterId}`,
      transformResponse: (response) => response.data.matter,
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
      invalidatesTags: (result, error) => (error ? [] : ["AdminUsers", "AdminMatters", "AdminDashboard", "Activity"]),
    }),
    // ⋮ actions on the Users page. Each returns the updated user (with canEdit / canManageAccess / canManageMfa).
    disableUserAccess: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}/disable`, method: "POST" }),
      invalidatesTags: (result, error) => (error ? [] : ["AdminUsers", "Activity"]),
    }),
    enableUserAccess: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}/enable`, method: "POST" }),
      invalidatesTags: (result, error) => (error ? [] : ["AdminUsers", "Activity"]),
    }),
    resendUserInvitation: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}/resend-invitation`, method: "POST" }),
      invalidatesTags: (result, error) => (error ? [] : ["AdminUsers", "AdminMatters", "AdminDashboard", "Activity"]),
    }),
    setUserMfaRequired: builder.mutation({
      query: ({ id, required }) => ({ url: `/admin/users/${id}/mfa`, method: "PATCH", body: { required } }),
      invalidatesTags: (result, error) => (error ? [] : ["AdminUsers", "Activity"]),
    }),
    resetUserMfa: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}/mfa/reset`, method: "POST" }),
      invalidatesTags: (result, error) => (error ? [] : ["AdminUsers", "Activity"]),
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
  useGetAdminDashboardQuery, useGetAdminUsersQuery, useLazyGetAdminUserQuery, useGetAdminUserStatsQuery, useGetAdminMattersQuery, useGetAdminMatterQuery, useInviteUserMutation, useUpdateUserMutation,
  useRemoveMatterContactMutation, useDisableUserAccessMutation, useEnableUserAccessMutation, useResendUserInvitationMutation,
  useSetUserMfaRequiredMutation, useResetUserMfaMutation,
} = adminApi;
