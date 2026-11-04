import { useCallback, useSyncExternalStore } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uploadDocument } from './useDocuments'
import { messageApi } from '../redux/api/messageApi'
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

// A file goes to Stratus first (kept on retry once uploaded), then the message is sent with it
const deliver = async (dispatch, key, crmMatterId, id) => {
  const item = current(key, id)
  if (!item) return
  patch(key, id, { failed: false })
  try {
    let { documentId } = item
    if (item.file && !documentId) {
      documentId = (await uploadDocument(dispatch, crmMatterId, item.file, { onProgress: (progress) => patch(key, id, { progress }) })).id
      patch(key, id, { documentId })
    }
    await dispatch(messageApi.endpoints.sendMessage.initiate({ crmMatterId, body: item.body || undefined, documentId, clientMessageId: id })).unwrap()
    update(key, (items) => items.filter((p) => p.clientMessageId !== id))
  } catch (err) {
    if (item.file && !err.shown && err.message) toast.error(`${item.file.name} wasn't sent`, { description: err.message })
    patch(key, id, { failed: true })
  }
}

// { outbox, send({ body, files }), retry(clientMessageId) }. One message per file; the text goes with the first.
export function useChatOutbox(crmMatterId) {
  const dispatch = useDispatch()
  const myId = useSelector((state) => String(state.auth.user?.id ?? ''))
  const key = `${myId}:${crmMatterId}`
  const outbox = useSyncExternalStore(subscribe, () => outboxes.get(key) ?? EMPTY)

  const send = useCallback(({ body, files = [] }) => {
    const sentAt = new Date().toISOString()
    const items = files.length > 0
      ? files.map((file, i) => ({ clientMessageId: newClientMessageId(), body: i === 0 ? body : '', file, progress: 0, sentAt }))
      : [{ clientMessageId: newClientMessageId(), body, sentAt }]
    update(key, (prev) => [...prev, ...items])
    items.forEach((item) => deliver(dispatch, key, crmMatterId, item.clientMessageId))
  }, [dispatch, key, crmMatterId])

  const retry = useCallback((id) => deliver(dispatch, key, crmMatterId, id), [dispatch, key, crmMatterId])

  return { outbox, send, retry }
}
