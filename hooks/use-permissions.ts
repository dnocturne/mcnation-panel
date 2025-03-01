import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

/**
 * Hook to check if the current user has a specific permission
 * This has been updated to work with NextAuth sessions
 */
export function usePermission(permission: string) {
  const { data: session, status } = useSession()
  
  return useQuery({
    queryKey: ['permission', permission, session?.user?.name],
    queryFn: async () => {
      if (status !== "authenticated" || !session?.user?.name) {
        console.warn('Not authenticated or no username, permission check canceled')
        return false
      }
      
      try {
        // The API now uses the NextAuth session cookie for authentication
        const response = await fetch(`/api/permissions/check?permission=${permission}`)
        
        if (!response.ok) {
          console.warn(`Permission check API error for ${permission}: ${response.status}`)
          return false
        }
        
        const data = await response.json()
        return data.hasPermission
      } catch (error) {
        console.error(`Error checking permission ${permission}:`, error)
        return false
      }
    },
    enabled: status === "authenticated" && !!session?.user?.name,
    // Refresh permissions more often during development
    staleTime: process.env.NODE_ENV === 'development' ? 5000 : 60000, // 5s in dev, 1min in prod
  })
} 