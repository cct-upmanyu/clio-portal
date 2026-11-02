import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './api/baseApi'
import authReducer from './slices/authSlice'
import { setDisplayTimeZone } from '../utils/dates'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

// Every time on screen follows the signed-in user's time zone (or the browser's when they have none).
// Subscribed here, before the UI, so the first render after sign-in already uses it.
let lastTimeZone
store.subscribe(() => {
  const timeZone = store.getState().auth.user?.timezone || null
  if (timeZone !== lastTimeZone) {
    lastTimeZone = timeZone
    setDisplayTimeZone(timeZone)
  }
})
