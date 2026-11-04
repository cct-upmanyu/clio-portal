import { baseApi } from "./baseApi";

export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // The newest 100, oldest first; new ones arrive over the socket (useMatterChat)
    getMessages: builder.query({
      query: (crmMatterId) => `/messages/matters/${crmMatterId}/messages?per_page=100`,
      // { messages, firmReadAt, contactReads }: the read times are for read receipts; contactReads (who
      // among the clients has read) only comes to firm users
      // info: { per_page, count, more_records }: more_records = older messages exist beyond this page
      // attachmentLimits: { maxBytes, extensions } for files sent in the chat
      transformResponse: ({ data }) => ({
        messages: data.messages, firmReadAt: data.firmReadAt ?? null, contactReads: data.contactReads ?? null,
        info: data.info ?? null, attachmentLimits: data.attachmentLimits ?? null,
      }),
      providesTags: (result, error, crmMatterId) => [{ type: "Messages", id: crmMatterId }],
    }),
    // { crmMatterId, body?, documentId? (a file uploaded first, see useDocumentUpload), clientMessageId }
    sendMessage: builder.mutation({
      query: ({ crmMatterId, body, documentId, clientMessageId }) => ({
        url: `/messages/matters/${crmMatterId}/messages`,
        method: "POST",
        body: { body, documentId, clientMessageId },
      }),
      // A file sent in the chat is also in the matter's documents
      invalidatesTags: (result, error, { documentId }) => (!error && documentId ? ["Documents"] : []),
      transformResponse: (response) => response.data,
      async onQueryStarted({ crmMatterId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(messageApi.util.updateQueryData("getMessages", crmMatterId, ({ messages }) => {
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
