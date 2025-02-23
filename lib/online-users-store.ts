// Simple in-memory store for online users
class OnlineUsersStore {
  private onlineUsers: Map<string, number> = new Map() // username -> last active timestamp
  private TIMEOUT = 5 * 60 * 1000 // 5 minutes timeout

  constructor() {
    // Run cleanup every minute
    setInterval(() => this.cleanup(), 60 * 1000)
  }

  addUser(username: string) {
    this.onlineUsers.set(username, Date.now())
  }

  removeUser(username: string) {
    this.onlineUsers.delete(username)
  }

  updateActivity(username: string) {
    this.onlineUsers.set(username, Date.now())
  }

  isUserOnline(username: string): boolean {
    const lastActive = this.onlineUsers.get(username)
    if (!lastActive) return false
    return (Date.now() - lastActive) < this.TIMEOUT
  }

  private cleanup() {
    const now = Date.now()
    for (const [username, lastActive] of this.onlineUsers.entries()) {
      if (now - lastActive > this.TIMEOUT) {
        this.onlineUsers.delete(username)
      }
    }
  }
}

export const onlineUsersStore = new OnlineUsersStore() 