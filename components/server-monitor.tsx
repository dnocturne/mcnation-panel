"use client"

import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ServerStatus {
  onlinePlayers: number;
  maxPlayers: number;
}

interface ServerConfig {
  host: string;
  port: string;
  apiKey: string;
}

async function getServerConfig(): Promise<ServerConfig | null> {
  const response = await fetch('/api/server/config');
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function fetchServerStatus(config: ServerConfig | null) {
  if (!config) {
    throw new Error("Server configuration not found");
  }

  const host = config.host === "0.0.0.0" ? "localhost" : config.host;
  const response = await fetch(`http://${host}:${config.port}/status`, {
    headers: {
      'X-API-Key': config.apiKey
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch server status');
  }

  return response.json();
}

export function ServerMonitor() {
  const { data: config } = useQuery({
    queryKey: ['serverConfig'],
    queryFn: getServerConfig,
  });

  const { data: serverStatus } = useQuery<ServerStatus>({
    queryKey: ['serverStatus', config],
    queryFn: () => fetchServerStatus(config || null),
    enabled: !!config,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => navigator.clipboard.writeText('play.mcnation.lt')}
    >
      <Users className="h-5 w-5 text-primary" />
      <span className="ml-2">
        play.mcnation.lt - {serverStatus?.onlinePlayers ?? 0}/{serverStatus?.maxPlayers ?? 20} online
      </span>
    </Button>
  )
} 