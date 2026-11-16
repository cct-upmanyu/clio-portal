import { useCallback, useSyncExternalStore } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { problemText, putWithPings } from './useDocuments'
import { documentApi } from '../redux/api/documentApi'
import { messageApi, upsertMessage } from '../redux/api/messageApi'
import { toast } from '../utils/toast'

// Chat messages on their way, kept outside the chat component: an upload carries on, and is still shown
// with its progress, after the user switches tab, page or matter and comes back. Per signed-in user and
// matter. Lost only on a reload or when the browser tab closes (which asks first while something's sending).
const outboxes = new Map()
const listeners = new Set()
const EMPTY = []

const notify = () => {
  listeners.forEach((listener) => listener())
  const busy = [...outboxes.values()].some((items) => items.some((item) => !item.failed))
  window.onbeforeunload = busy ? (e) => { e.preventDefault(); return '' } : null
}
const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const update = (key, fn) => {
  outboxes.set(key, fn(outboxes.get(key) ?? EMPTY))
  notify()
}
const patch = (key, id, changes) => update(key, (items) => items.map((p) => (p.clientMessageId === id ? { ...p, ...changes } : p)))
const current = (key, id) => (outboxes.get(key) ?? EMPTY).find((p) => p.clientMessageId === id)

const newClientMessageId = () => crypto.randomUUID().replaceAll('-', '')

// A file: its message is saved first (everyone sees it uploading, even after a reload), the file goes
// straight to Stratus while the server is pinged each minute, then completing it sends the message.
// A retry asks again with the same clientMessageId: same message, fresh upload link.
const sendFile = async (dispatch, key, crmMatterId, id, item) => {
  const started = await dispatch(messageApi.endpoints.startChatUpload.initiate({
    crmMatterId, fileName: item.file.name, size: item.file.size, contentType: item.file.type || undefined,
    body: item.html ? undefined : item.body || undefined, html: item.html || undefined, clientMessageId: id,
  })).unwrap()
  const documentId = started.document?.id
  if (started.uploadUrl) {
    await putWithPings(dispatch, crmMatterId, documentId, started.uploadUrl, item.file, (progress) => patch(key, id, { progress }))
    await dispatch(documentApi.endpoints.completeDocumentUpload.initiate({ crmMatterId, documentId })).unwrap()
    dispatch(upsertMessage(crmMatterId, { ...started.message, status: 'sent', attachment: started.message.attachment && { ...started.message.attachment, status: 'ready' } }))
  }
}

const deliver = async (dispatch, key, crmMatterId, id) => {
  const item = current(key, id)
  if (!item) return
  patch(key, id, { failed: false })
  try {
    if (item.file) await sendFile(dispatch, key, crmMatterId, id, item)
    else await dispatch(messageApi.endpoints.sendMessage.initiate({ crmMatterId, body: item.body || undefined, html: item.html || undefined, clientMessageId: id })).unwrap()
    update(key, (items) => items.filter((p) => p.clientMessageId !== id))
  } catch (err) {
    const description = item.file ? problemText(err) : null
    if (description) toast.error(`${item.file.name} wasn't sent`, { description })
    patch(key, id, { failed: true })
  }
}

// { outbox, send({ body, html?, files }), retry(clientMessageId) }. One message per file; the text goes with the first.
export function useChatOutbox(crmMatterId) {
  const dispatch = useDispatch()
  const myId = useSelector((state) => String(state.auth.user?.id ?? ''))
  const key = `${myId}:${crmMatterId}`
  const outbox = useSyncExternalStore(subscribe, () => outboxes.get(key) ?? EMPTY)

  const send = useCallback(({ body, html, files = [] }) => {
    const sentAt = new Date().toISOString()
    const items = files.length > 0
      ? files.map((file, i) => ({ clientMessageId: newClientMessageId(), body: i === 0 ? body : '', html: i === 0 ? html : undefined, file, progress: 0, sentAt }))
      : [{ clientMessageId: newClientMessageId(), body, html, sentAt }]
    update(key, (prev) => [...prev, ...items])
    items.forEach((item) => deliver(dispatch, key, crmMatterId, item.clientMessageId))
  }, [dispatch, key, crmMatterId])

  const retry = useCallback((id) => deliver(dispatch, key, crmMatterId, id), [dispatch, key, crmMatterId])

  return { outbox, send, retry }
}
