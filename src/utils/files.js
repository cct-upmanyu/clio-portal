// ListItem / file tile kind from a file name
export function fileKind(name = '') {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'].includes(ext)) return 'image'
  return 'file'
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${+(bytes / 1024 ** 3).toFixed(1)} GB`
}

// Saves a File/Blob the user has in the browser (files shared in this session)
export function saveFile(file, name = file.name) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

// The same rules the backend applies; it has the final say. The size limits come from the server (chat files:
// getMessages → attachmentLimits; OneDrive: the folder's limits); this is only the fallback before they load.
export const MAX_DOCUMENT_BYTES = 100 * 1024 * 1024
export const DOCUMENT_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'tif', 'tiff', 'bmp',
  'zip', 'msg', 'eml', 'mp3', 'm4a', 'wav', 'mp4', 'mov',
]
export const DOCUMENT_ACCEPT = DOCUMENT_EXTENSIONS.map((ext) => `.${ext}`).join(',')

// Why a file can't be shared, or null
export function documentProblem(file, { maxBytes = MAX_DOCUMENT_BYTES } = {}) {
  const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : ''
  if (!DOCUMENT_EXTENSIONS.includes(ext)) return "This type of file can't be shared"
  if (file.size === 0) return 'The file is empty'
  if (file.size > maxBytes) return `Too large, max ${formatBytes(maxBytes)}`
  return null
}

// PUTs the file to a pre-signed Stratus URL. onProgress(0-1) as it goes.
export function putFile(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    if (file.type) xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total)
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)))
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(file)
  })
}

// Who shared a document, as the viewer reads it
export const sharedByLabel = (doc) => (doc.mine ? 'You' : doc.uploadedBy?.name || 'Legal team')

// How a file can be previewed in the portal: 'image', 'pdf', 'video', 'audio', 'text', or null (download only)
export function previewKind(name = '') {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return 'image'
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video'
  if (['mp3', 'm4a', 'wav'].includes(ext)) return 'audio'
  if (['txt', 'csv'].includes(ext)) return 'text'
  return null
}

// Microsoft upload sessions take the file in pieces that are a multiple of 320 KiB: 10 MiB each
const UPLOAD_CHUNK_BYTES = 32 * 320 * 1024
const CHUNK_RETRIES = 3

const putChunk = (url, blob, start, total, onProgress) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest()
  xhr.open('PUT', url)
  xhr.setRequestHeader('Content-Range', `bytes ${start}-${start + blob.size - 1}/${total}`)
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) onProgress?.((start + e.loaded) / total)
  }
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) resolve({ status: xhr.status, body: xhr.responseText })
    else reject(Object.assign(new Error(`Upload failed (${xhr.status})`), { status: xhr.status }))
  }
  xhr.onerror = () => reject(new Error('Upload failed'))
  xhr.send(blob)
})

// Sends the file to a Microsoft upload session (its URL needs no token), piece by piece, retrying a
// piece that fails on the network or a server error. Resolves with the created OneDrive item.
export async function uploadInChunks(uploadUrl, file, onProgress) {
  let start = 0
  let last = null
  while (start < file.size) {
    const blob = file.slice(start, Math.min(start + UPLOAD_CHUNK_BYTES, file.size))
    for (let attempt = 1; ; attempt += 1) {
      try {
        last = await putChunk(uploadUrl, blob, start, file.size, onProgress)
        break
      } catch (err) {
        const retryable = !err.status || err.status >= 500
        if (!retryable || attempt >= CHUNK_RETRIES) throw err
        await new Promise((r) => setTimeout(r, 1000 * attempt))
      }
    }
    start += blob.size
  }
  return last?.body ? JSON.parse(last.body) : null
}
