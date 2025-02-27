import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-store"

export function usePermission(permission: string) {
  const { username, token, checkTokenExpiry } = useAuth()

  return useQuery({
    queryKey: ['permission', permission, username],
    queryFn: async () => {
      // Check if token is expired
      const isValid = checkTokenExpiry()
      if (!isValid) {
        console.warn('Token expired, permission check canceled')
        return false
      }
      
      if (!username) {
        console.warn('Username missing in auth store, permission check canceled')
        return false
      }
      
      if (!token) {
        console.warn('Token missing in auth store, permission check canceled')
        return false
      }
      
      const response = await fetch(`/api/permissions/check?permission=${permission}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) return false
      const data = await response.json()
      return data.hasPermission
    },
    enabled: !!username && !!token
  })
} 