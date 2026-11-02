import { io } from 'socket.io-client'
import { env } from '../config/env'

let socket = null

// One live connection for the whole app, opened the first time a chat needs it. It signs in with the
// session cookie, like every API call. Served by the backend at <api url>/socket.io.
export function getSocket() {
  if (!socket) {
    const api = new URL(env.apiUrl || '/', window.location.origin)
    socket = io(api.origin, {
      path: `${api.pathname.replace(/\/+$/, '')}/socket.io`,
      withCredentials: true,
    })
  }
  return socket
}

// On sign-out: the server only checks the session when the connection opens
export function closeSocket() {
  socket?.disconnect()
  socket = null
}
