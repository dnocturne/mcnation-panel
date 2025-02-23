import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { onlineUsersStore } from './online-users-store'

export interface AuthState {
  token: string | null
  username: string | null
  setToken: (token: string, username: string) => void
  isAuthenticated: () => boolean
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null as string | null,
      username: null as string | null,
      setToken: (token: string, username: string) => {
        onlineUsersStore.addUser(username)
        set({ token, username })
      },
      isAuthenticated: (): boolean => !!useAuth.getState().token,
      logout: () => {
        const currentUsername = useAuth.getState().username
        if (currentUsername) {
          onlineUsersStore.removeUser(currentUsername)
        }
        set({ token: null, username: null })
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return persistedState as AuthState
        }
        return persistedState as AuthState
      },
    }
  )
) 