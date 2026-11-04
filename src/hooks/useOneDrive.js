import { useCallback } from 'react'
import {
  useCompleteOneDriveUploadMutation, useGetOneDriveDownloadMutation, useStartOneDriveUploadMutation,
} from '../redux/api/oneDriveApi'
import { isHandledGlobally } from '../redux/api/baseApi'
import { uploadInChunks } from '../utils/files'
import { toast } from '../utils/toast'

// The message to show for a failed step, or null when the app already showed one
const problemText = (err) => (isHandledGlobally(err) ? null : err?.data?.message || err?.message || 'Please try again.')

// Uploads one file into a folder of the matter's OneDrive: opens an upload session, sends the file straight
// to Microsoft in pieces, then has the backend record it. Same contract as useDocumentUpload, so it plugs
// into ShareDocumentsDialog: upload(file, { onProgress }) → the new item. Errors carry `shown` when toasted.
export function useOneDriveUpload(crmMatterId, folderId) {
  const [startUpload] = useStartOneDriveUploadMutation()
  const [completeUpload] = useCompleteOneDriveUploadMutation()

  return useCallback(async (file, { onProgress } = {}) => {
    try {
      const { uploadUrl } = await startUpload({ crmMatterId, folderId, fileName: file.name, size: file.size }).unwrap()
      const created = await uploadInChunks(uploadUrl, file, onProgress)
      if (!created?.id) throw new Error('The upload finished without a file. Please try again.')
      return await completeUpload({ crmMatterId, itemId: created.id }).unwrap()
    } catch (err) {
      const message = problemText(err)
      throw Object.assign(new Error(message || 'Upload failed'), { shown: !message })
    }
  }, [crmMatterId, folderId, startUpload, completeUpload])
}

// Short-lived OneDrive links: `linkFor(itemId)` → { url } for previews; `download(item)` saves it. The link
// downloads under the file's own name, so the page just follows it (no reading into memory).
export function useOneDriveDownload(crmMatterId) {
  const [getDownload] = useGetOneDriveDownloadMutation()

  const linkFor = useCallback(
    (itemId) => getDownload({ crmMatterId, itemId, purpose: 'preview' }).unwrap(),
    [crmMatterId, getDownload],
  )

  const download = useCallback(async (item) => {
    try {
      const { url } = await getDownload({ crmMatterId, itemId: item.id, purpose: 'download' }).unwrap()
      const link = document.createElement('a')
      link.href = url
      link.rel = 'noopener'
      link.click()
    } catch (err) {
      const message = problemText(err)
      if (message) toast.error("Couldn't download this file", { description: message })
    }
  }, [crmMatterId, getDownload])

  return { linkFor, download }
}
