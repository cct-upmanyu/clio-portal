import { useEffect, useRef, useState } from 'react'
import * as Ably from 'ably'
import { env } from '../config/env'

const fetchToken = async (crmMatterId) => {
  const response = await fetch(`${env.apiUrl}/messages/matters/${crmMatterId}/realtime-token`, { credentials: 'include' })
  const body = await response.json()
  if (!response.ok || !body.success) throw new Error(body.message || 'Realtime unavailable')
  return body.data
}

// Listens for "new message" events on one matter. Ably only says that something changed; `onMessage`
// fetches it. Returns whether the live connection is up, so the caller can poll while it isn't.
export function useMatterRealtime(crmMatterId, onMessage) {
  const [connected, setConnected] = useState(false)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!crmMatterId) return undefined
    let cancelled = false
    let realtime = null

    fetchToken(crmMatterId).then((first) => {
      if (cancelled || !first.enabled) return
      let pending = first.tokenRequest
      realtime = new Ably.Realtime({
        // The first token is already in hand; renewals fetch a new one
        authCallback: (params, callback) => {
          const ready = pending
          pending = null
          if (ready) return callback(null, ready)
          fetchToken(crmMatterId).then((data) => callback(null, data.tokenRequest), (err) => callback(err.message, null))
        },
      })
      let wasConnected = false
      realtime.connection.on((change) => {
        const isUp = change.current === 'connected'
        setConnected(isUp)
        // On a reconnect, catch up on anything sent while the connection was down
        if (isUp && wasConnected) onMessageRef.current()
        if (isUp) wasConnected = true
      })
      realtime.channels.get(`matter:${crmMatterId}`).subscribe('message', () => onMessageRef.current())
    }).catch(() => {
      // Stays on the fallback poll
    })

    return () => {
      cancelled = true
      realtime?.close()
      setConnected(false)
    }
  }, [crmMatterId])

  return connected
}
