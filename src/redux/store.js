import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './api/authApi'
import authReducer from './slices/authSlice'
import matterReducer from './slices/matterSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    matter: matterReducer,
    [authApi.reducerPath] : authApi.reducer
  },
  middleware : (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
})
