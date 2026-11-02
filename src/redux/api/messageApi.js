import { baseApi } from "./baseApi";

export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Newest 100, oldest first; polled so staff replies from Zoho CRM show up
    getMessages: builder.query({
      query: (crmMatterId) => `/messages/matters/${crmMatterId}/messages?limit=100`,
      transformResponse: (response) => response.data.messages,
      providesTags: (result, error, crmMatterId) => [{ type: "Messages", id: crmMatterId }],
    }),
    sendMessage: builder.mutation({
      query: ({ crmMatterId, body, clientMessageId }) => ({
        url: `/messages/matters/${crmMatterId}/messages`,
        method: "POST",
        body: { body, clientMessageId },
      }),
      transformResponse: (response) => response.data,
      async onQueryStarted({ crmMatterId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(messageApi.util.updateQueryData("getMessages", crmMatterId, (messages) => {
            if (!messages.some((m) => String(m.id) === String(data.id))) messages.push(data);
          }));
        } catch {
          // The thread marks the message as not sent
        }
      },
    }),
    // Client: clears this matter's badge in the switcher straight away, without refetching the matters list.
    // Firm user: clears the matter from the admin dashboard (for every admin)
    markMatterRead: builder.mutation({
      query: (crmMatterId) => ({ url: `/messages/matters/${crmMatterId}/read`, method: "POST" }),
      invalidatesTags: (result, error) => (error ? [] : ["AdminDashboard"]),
      async onQueryStarted(crmMatterId, { dispatch }) {
        dispatch(messageApi.util.updateQueryData("getMatters", undefined, (data) => {
          const matter = data?.matters?.find((m) => String(m.crmMatterId) === String(crmMatterId));
          if (matter) matter.unreadCount = 0;
        }));
      },
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation, useMarkMatterReadMutation } = messageApi;
