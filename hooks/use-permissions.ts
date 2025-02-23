import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-store"

export function usePermission(permission: string) {
  const { username, token } = useAuth()

  return useQuery({
    queryKey: ['permission', permission, username],
    queryFn: async () => {
      if (!username || !token) return false
      
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