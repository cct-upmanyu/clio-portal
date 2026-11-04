import { useEffect, useMemo, useState } from 'react'
import MessageThread from './MessageThread'
import PreviewDialog from '../documents/PreviewDialog'
import { useChatOutbox } from '../../hooks/useChatOutbox'
import { useDocumentDownload } from '../../hooks/useDocuments'
import { useMatterChat } from '../../hooks/useMatterChat'
import { useMarkMatterReadMutation } from '../../redux/api/messageApi'
import { setActiveChat } from '../../utils/activeChat'
import { documentProblem, formatBytes, previewKind } from '../../utils/files'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { toast } from '../../utils/toast'

const nameOf = (person) => [person?.firstName, person?.lastName].filter(Boolean).join(' ')

const authorOf = (message) => {
  if (message.mine) return 'You'
  return nameOf(message.sender) || (message.senderType === 'staff' ? 'Legal team' : 'Client')
}

// Read receipt for one of my messages. status: 'none' (both ticks grey), 'partial' (one blue: some of the
// matter's clients have read it), 'all' (both blue). A client's message is read once the firm has read the
// chat after it. The firm's: per client, and `readers` (who has and hasn't) is only known to the firm.
const receiptFor = (message, firmReadAt, contactReads) => {
  const sent = new Date(message.sentAt)
  const readSince = (readAt) => Boolean(readAt && sent <= new Date(readAt))
  if (message.senderType === 'client') return { status: readSince(firmReadAt) ? 'all' : 'none' }
  const readers = (contactReads || []).map((c) => ({ ...c, read: readSince(c.readAt) }))
  const readCount = readers.filter((r) => r.read).length
  const status = readCount === 0 ? 'none' : readCount === readers.length ? 'all' : 'partial'
  return { status, readers: contactReads ? readers : undefined }
}

const typingLine = (users) => {
  const names = users.map((user) => user.firstName || nameOf(user) || 'Someone')
  if (names.length === 0) return ''
  if (names.length === 1) return `${names[0]} is typing…`
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`
  return 'Several people are typing…'
}

// Who else has this chat open. The client sees the legal team; the firm sees the clients and colleagues.
// Phones: one line that scrolls sideways (no wrapping), shorter wording, so the conversation keeps the screen
function OnlineBar({ online, connected, viewer }) {
  const roleLabel = (user) => (user.role === 'staff' ? (viewer === 'client' ? 'Legal team' : 'Staff') : 'Client')
  return (
    <div className="flex min-h-10 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-white px-6 py-2 text-[13px] max-sm:min-h-8 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-3 max-sm:py-1.5 max-sm:text-xs max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden">
      {!connected ? (
        <span className="text-muted">Connecting…</span>
      ) : online.length === 0 ? (
        <span className="text-muted max-sm:truncate">
          {viewer === 'client'
            ? <>Your legal team isn&apos;t online right now.<span className="max-sm:hidden"> They&apos;ll see your messages when they are.</span></>
            : 'No one else has this chat open.'}
        </span>
      ) : (
        online.map((user) => (
          <span key={user.id} className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            <span aria-hidden="true" className="size-2 rounded-full bg-success" />
            <span className="font-medium text-ink">{nameOf(user) || roleLabel(user)}</span>
            <span className="text-muted">{roleLabel(user)}<span className="max-sm:hidden"> · Online</span></span>
          </span>
        ))
      )}
    </div>
  )
}

// A matter's live chat, for the client portal (`viewer="client"`) and the Admin Console (`viewer="firm"`).
// Reading it clears the client's badge, or for the firm the matter's entry on the admin dashboard. Sends go through the API; the socket brings in everyone's messages, presence and typing.
function MatterChat({ crmMatterId, viewer = 'client', title, emptyText }) {
  const { messages: saved, firmReadAt, contactReads, attachmentLimits, isSuccess, isLoading, isError, refetch, connected, online, typingUsers, notifyTyping, stopTyping } = useMatterChat(crmMatterId)
  const { outbox, send, retry } = useChatOutbox(crmMatterId)
  const { name: myName } = useCurrentUser()
  const { linkFor, download } = useDocumentDownload(crmMatterId)
  const [previewDoc, setPreviewDoc] = useState(null)

  // Only read while it's actually seen: with the browser tab in the background, new messages stay
  // unread (badges show them) until the user comes back
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible')
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  useEffect(() => {
    setActiveChat(visible ? crmMatterId : null)
    return () => setActiveChat(null)
  }, [crmMatterId, visible])

  // Seen once the chat has loaded, and again whenever a new message arrives while it's on screen
  const [markRead] = useMarkMatterReadMutation()
  const lastMessageId = saved.at(-1)?.id
  useEffect(() => {
    if (isSuccess && visible) markRead(crmMatterId)
  }, [viewer, crmMatterId, isSuccess, visible, lastMessageId, markRead])

  const handleSend = ({ body, files = [] }) => {
    const usable = files.filter((file) => {
      const maxBytes = attachmentLimits?.maxBytes
      const problem = documentProblem(file, maxBytes ? { maxBytes } : undefined)
      // Too big for the chat: those go to the matter's OneDrive folder instead
      const tooBig = maxBytes && file.size > maxBytes
      if (problem) {
        toast.error(`${file.name} can't be sent in the chat`, {
          description: tooBig ? `Files in the chat can be up to ${formatBytes(maxBytes)}. Upload it in Documents → OneDrive instead.` : problem,
        })
      }
      return !problem
    })
    if (!body && usable.length === 0) return
    stopTyping()
    send({ body, files: usable })
  }

  const messages = useMemo(() => {
    const shown = saved.map((m) => ({
      id: m.id, author: authorOf(m), name: m.mine ? (nameOf(m.sender) || myName || 'You') : authorOf(m), fromMe: m.mine, body: m.body, sentAt: m.sentAt,
      attachment: m.attachment && {
        ...m.attachment,
        onDownload: () => download(m.attachment),
        // Only files the portal can show; the preview's details line says who sent it and when
        onPreview: previewKind(m.attachment.name) ? () => setPreviewDoc({
          id: m.attachment.documentId, name: m.attachment.name, size: m.attachment.size,
          mine: m.mine, uploadedBy: { name: authorOf(m) }, uploadedAt: m.sentAt,
        }) : undefined,
      },
      receipt: m.mine ? receiptFor(m, firmReadAt, contactReads) : undefined,
    }))
    // The socket can bring a message back before its own POST does
    const savedIds = new Set(saved.map((m) => m.clientMessageId).filter(Boolean))
    const pending = outbox
      .filter((p) => !savedIds.has(p.clientMessageId))
      .map((p) => ({
        id: p.clientMessageId, author: 'You', name: myName || 'You', fromMe: true, body: p.body, sentAt: p.sentAt,
        attachment: p.file && { name: p.file.name, size: p.file.size, progress: p.documentId ? null : p.progress },
        sending: !p.failed, failed: p.failed, onRetry: () => retry(p.clientMessageId),
      }))
    return [...shown, ...pending]
  }, [saved, outbox, firmReadAt, contactReads, download, retry, myName])

  return (
    <>
      <MessageThread
        messages={messages}
        onSend={handleSend}
        onTyping={notifyTyping}
        title={title}
        emptyText={emptyText}
        header={<OnlineBar online={online} connected={connected} viewer={viewer} />}
        typingText={typingLine(typingUsers)}
        loading={isLoading}
        loadError={isError}
        onRetry={refetch}
      />
      <PreviewDialog
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={(doc) => download({ documentId: doc.id, size: doc.size })}
        linkFor={linkFor}
      />
    </>
  )
}

export default MatterChat
