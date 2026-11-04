import { baseApi } from "./baseApi";

// Document: { id, matterId, name, size, contentType, visibility ('client' | 'firm'), uploadedBy: { id, name },
// uploaderType, mine, uploadedAt, messageId }. Clients only get the ones shared with them.
// Files go straight to Stratus: startUpload gives a pre-signed PUT URL, completeUpload confirms it
// (see hooks/useDocumentUpload); download gives a short-lived GET URL.
const CHANGES = ["Documents", "Dashboard", "Activity"];

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: (crmMatterId) => `/matters/${crmMatterId}/documents`,
      transformResponse: (response) => response.data.documents,
      providesTags: (result, error, crmMatterId) => [{ type: "Documents", id: crmMatterId }, "Documents"],
    }),
    // { crmMatterId, fileName, size, contentType, visibility? } → { document, uploadUrl, expiresIn }
    startDocumentUpload: builder.mutation({
      query: ({ crmMatterId, ...body }) => ({ url: `/matters/${crmMatterId}/documents`, method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    completeDocumentUpload: builder.mutation({
      query: ({ crmMatterId, documentId }) => ({ url: `/matters/${crmMatterId}/documents/${documentId}/complete`, method: "POST" }),
      transformResponse: (response) => response.data.document,
      invalidatesTags: (result, error) => (error ? [] : CHANGES),
    }),
    // A fresh link each time (they expire in minutes), so it isn't cached
    getDocumentDownload: builder.mutation({
      query: ({ crmMatterId, documentId, purpose = "download" }) => ({ url: `/matters/${crmMatterId}/documents/${documentId}/download?purpose=${purpose}` }),
      transformResponse: (response) => response.data,
    }),
    // Firm only
    deleteDocument: builder.mutation({
      query: ({ crmMatterId, documentId }) => ({ url: `/matters/${crmMatterId}/documents/${documentId}`, method: "DELETE" }),
      invalidatesTags: (result, error) => (error ? [] : [...CHANGES, "Messages"]),
    }),
  }),
});

export const {
  useGetDocumentsQuery, useStartDocumentUploadMutation, useCompleteDocumentUploadMutation,
  useGetDocumentDownloadMutation, useDeleteDocumentMutation,
} = documentApi;
