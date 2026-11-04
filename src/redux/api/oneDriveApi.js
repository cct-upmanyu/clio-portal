import { baseApi } from "./baseApi";

// A matter's OneDrive folder, read live. getOneDriveFolder → { linked: false } or { linked: true, root, folder,
// items, limits }. Item: { id, name, folder, childCount, size, mimeType, modifiedAt, webUrl (firm only) }.
// Uploads go straight to Microsoft (see hooks/useOneDrive); the backend only opens and records them.
export const oneDriveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOneDriveFolder: builder.query({
      query: ({ crmMatterId, folderId }) => `/matters/${crmMatterId}/onedrive${folderId ? `?folderId=${encodeURIComponent(folderId)}` : ""}`,
      transformResponse: (response) => response.data,
      providesTags: ["OneDrive"],
    }),
    // { crmMatterId, folderId, fileName, size } → { uploadUrl, expiresAt }
    startOneDriveUpload: builder.mutation({
      query: ({ crmMatterId, ...body }) => ({ url: `/matters/${crmMatterId}/onedrive/upload-session`, method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    completeOneDriveUpload: builder.mutation({
      query: ({ crmMatterId, itemId }) => ({ url: `/matters/${crmMatterId}/onedrive/uploaded`, method: "POST", body: { itemId } }),
      transformResponse: (response) => response.data.item,
      invalidatesTags: (result, error) => (error ? [] : ["OneDrive", "Activity"]),
    }),
    // A fresh link each time (they expire), so it isn't cached
    getOneDriveDownload: builder.mutation({
      // purpose: 'preview' or 'download', recorded on the firm's timeline as viewed / downloaded
      query: ({ crmMatterId, itemId, purpose = "download" }) => ({ url: `/matters/${crmMatterId}/onedrive/items/${encodeURIComponent(itemId)}/download?purpose=${purpose}` }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetOneDriveFolderQuery, useStartOneDriveUploadMutation, useCompleteOneDriveUploadMutation, useGetOneDriveDownloadMutation,
} = oneDriveApi;
