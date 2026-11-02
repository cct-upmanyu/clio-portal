import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from './api/baseApi'
import authReducer from './slices/authSlice'
import { setDisplayTimeZone } from '../utils/dates'
import { closeSocket } from '../utils/socket'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

// Lets queries opt in to refetching when the tab regains focus or the network comes back
setupListeners(store.dispatch)

// Every time on screen follows the signed-in user's time zone (or the browser's when they have none).
// Subscribed here, before the UI, so the first render after sign-in already uses it.
let lastTimeZone
let lastUserId
store.subscribe(() => {
  const user = store.getState().auth.user
  const timeZone = user?.timezone || null
  if (timeZone !== lastTimeZone) {
    lastTimeZone = timeZone
    setDisplayTimeZone(timeZone)
  }
  // Signed out, or signed in as someone else: the chat connection belonged to the previous session
  const userId = user?.id ?? null
  if (userId !== lastUserId) {
    if (lastUserId != null) closeSocket()
    lastUserId = userId
  }
})
