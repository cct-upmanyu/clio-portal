import { baseApi } from "./baseApi";

// Event: { id, matterId, title, description, locationType ('in_person' | 'online'), venue, provider,
// meetingLink, startAt, endAt (ISO), host, status ('scheduled' | 'completed' | 'cancelled') }. The firm
// also gets participants, hostUserId, createdBy, updatedBy; a client never sees the other participants.
const CHANGES = ["Events", "Dashboard", "Activity"];

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Admin Console ----
    getMatterEvents: builder.query({
      query: (crmMatterId) => `/admin/matters/${crmMatterId}/events`,
      transformResponse: (response) => response.data.events,
      providesTags: ["Events"],
    }),
    // Scheduled events across every matter that haven't ended, soonest first (each with its matter)
    getUpcomingEvents: builder.query({
      query: (limit = 10) => `/admin/events/upcoming?limit=${limit}`,
      transformResponse: (response) => response.data.events,
      providesTags: ["Events"],
    }),
    createEvent: builder.mutation({
      query: ({ crmMatterId, ...body }) => ({ url: `/admin/matters/${crmMatterId}/events`, method: "POST", body }),
      transformResponse: (response) => response.data.event,
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),
    updateEvent: builder.mutation({
      query: ({ eventId, ...body }) => ({ url: `/admin/events/${eventId}`, method: "PATCH", body }),
      transformResponse: (response) => response.data.event,
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),
    // action: 'complete' (held) | 'reopen' (scheduled again) | 'cancel'
    setEventStatus: builder.mutation({
      query: ({ eventId, action }) => ({ url: `/admin/events/${eventId}/${action}`, method: "POST" }),
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),

    // ---- Client portal ----
    getMyEvents: builder.query({
      query: (crmMatterId) => `/matters/${crmMatterId}/events`,
      transformResponse: (response) => response.data.events,
      providesTags: ["Events"],
    }),
  }),
});

export const {
  useGetMatterEventsQuery, useGetUpcomingEventsQuery, useCreateEventMutation, useUpdateEventMutation,
  useSetEventStatusMutation, useGetMyEventsQuery,
} = eventApi;
