import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { documentApi, useGetDocumentDownloadMutation } from '../redux/api/documentApi'
import { isHandledGlobally } from '../redux/api/baseApi'
import { putFile, saveFile } from '../utils/files'
import { toast } from '../utils/toast'

// Up to this size a download is saved under its real name (read in memory first); above it the browser
// downloads it directly, named as it is in Stratus (<documentId>-<file name>)
const IN_MEMORY_DOWNLOAD_BYTES = 100 * 1024 * 1024

// The message to show for a failed step, or null when the app already showed one
const problemText = (err) => (isHandledGlobally(err) ? null : err?.data?.message || err?.message || 'Please try again.')

// Uploads one file to a matter: asks for a pre-signed URL, PUTs the file straight to Stratus, then
// confirms it. Resolves with the saved document. Errors carry `shown` when already toasted globally.
// Not tied to a component, so an upload carries on when the page that started it closes.
export async function uploadDocument(dispatch, crmMatterId, file, { visibility, onProgress } = {}) {
  try {
    const { document, uploadUrl } = await dispatch(documentApi.endpoints.startDocumentUpload.initiate({
      crmMatterId, fileName: file.name, size: file.size, contentType: file.type || undefined, visibility,
    })).unwrap()
    await putFile(uploadUrl, file, onProgress)
    return await dispatch(documentApi.endpoints.completeDocumentUpload.initiate({ crmMatterId, documentId: document.id })).unwrap()
  } catch (err) {
    const message = problemText(err)
    throw Object.assign(new Error(message || 'Upload failed'), { shown: !message })
  }
}

export function useDocumentUpload(crmMatterId) {
  const dispatch = useDispatch()
  return useCallback((file, options) => uploadDocument(dispatch, crmMatterId, file, options), [dispatch, crmMatterId])
}

// Short-lived links to a document: `linkFor` for previews, `download` saves it under its real name
export function useDocumentDownload(crmMatterId) {
  const [getDownload] = useGetDocumentDownloadMutation()

  const linkFor = useCallback(
    (documentId) => getDownload({ crmMatterId, documentId, purpose: 'preview' }).unwrap(),
    [crmMatterId, getDownload],
  )

  const download = useCallback(async (doc) => {
    let link
    try {
      link = await getDownload({ crmMatterId, documentId: doc.documentId ?? doc.id, purpose: 'download' }).unwrap()
    } catch (err) {
      const message = problemText(err)
      if (message) toast.error("Couldn't download this file", { description: message })
      return
    }
    // Big files go straight from Stratus to disk: reading them into memory first could crash the tab
    if ((doc.size ?? 0) > IN_MEMORY_DOWNLOAD_BYTES) {
      window.open(link.url, '_blank', 'noopener')
      return
    }
    try {
      const response = await fetch(link.url)
      if (!response.ok) throw new Error(String(response.status))
      saveFile(await response.blob(), link.name)
    } catch {
      // Not readable from here (e.g. the bucket doesn't allow this site): the browser downloads it instead
      window.open(link.url, '_blank', 'noopener')
    }
  }, [crmMatterId, getDownload])

  return { linkFor, download }
}
