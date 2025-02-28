import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export function usePermission(permission: string) {
  const { data: session, status } = useSession()
  const username = session?.user?.name
  
  // For API requests that need authorization
  // In NextAuth, you might need to implement JWT callbacks to include the token
  // This will need adjustment based on how your NextAuth is configured
  const token = (session as any)?.accessToken

  return useQuery({
    queryKey: ['permission', permission, username],
    queryFn: async () => {
      if (status !== "authenticated") {
        console.warn('Not authenticated, permission check canceled')
        return false
      }
      
      if (!username) {
        console.warn('Username missing in session, permission check canceled')
        return false
      }
      
      // Make API call to check permission - adjust this based on your API requirements
      // If your permissions API doesn't require a token, you can simplify this
      try {
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
    enabled: status === "authenticated" && !!username
  })
} 