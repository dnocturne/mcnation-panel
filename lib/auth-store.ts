import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtVerify } from 'jose'
import { onlineUsersStore } from './online-users-store'

export interface AuthState {
  token: string | null
  username: string | null
  tokenExpiry: number | null
  setToken: (token: string, username: string, expiry: number) => void
  logout: () => void
  checkTokenExpiry: () => boolean
  isAuthenticated: () => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      tokenExpiry: null,
      setToken: (token: string, username: string, expiry: number) => {
        onlineUsersStore?.addUser(username)
        set({ token, username, tokenExpiry: expiry })
      },
      logout: () => {
        const currentUsername = get().username
        if (currentUsername) {
          onlineUsersStore?.removeUser(currentUsername)
        }
        set({ token: null, username: null, tokenExpiry: null })
      },
      checkTokenExpiry: () => {
        const { tokenExpiry } = get()
        if (!tokenExpiry) return false
        
        const isExpired = Date.now() >= tokenExpiry
        if (isExpired) {
          get().logout()
        }
        return !isExpired
      },
      isAuthenticated: () => {
        const { token, username } = get()
        return get().checkTokenExpiry() && !!token && !!username
      }
    }),
    {
      name: 'auth-storage',
      migrate: (persistedState: any, version) => {
        if (persistedState && !('tokenExpiry' in persistedState)) {
          return {
            ...persistedState,
            tokenExpiry: null
          }
        }
        return persistedState as AuthState
      },
      version: 1,
      partialize: (state) => ({
        token: state.token,
        username: state.username,
        tokenExpiry: state.tokenExpiry
      })
    }
  )
) 