"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ServerStatus {
  onlinePlayers: number;
  maxPlayers: number;
  version: string;
}

interface ServerConfig {
  host: string;
  port: string;
  apiKey: string;
}

interface CommandResponse {
  message: string;
}

async function fetchServerStatus(config: ServerConfig | null) {
  if (!config) {
    throw new Error("Server configuration not found");
  }

  // Use localhost for local development, or your server's actual IP/domain for production
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

async function getServerConfig(): Promise<ServerConfig | null> {
  const response = await fetch('/api/server/config');
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function executeCommand(config: ServerConfig, command: string): Promise<CommandResponse> {
  const host = config.host === "0.0.0.0" ? "localhost" : config.host;
  const response = await fetch(`http://${host}:${config.port}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey
    },
    body: JSON.stringify({ command })
  });

  if (!response.ok) {
    throw new Error('Failed to execute command');
  }

  return response.json();
}

export default function AdminPage() {
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [command, setCommand] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    getServerConfig().then(setConfig);
  }, []);

  const { data: serverStatus, error, isLoading } = useQuery<ServerStatus>({
    queryKey: ['serverStatus', config],
    queryFn: () => fetchServerStatus(config),
    enabled: !!config,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const handleExecuteCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !command.trim()) return;

    try {
      await executeCommand(config, command);
      toast({
        title: "Success",
        description: "Command executed successfully",
      });
      setCommand(""); // Clear the command input
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute command",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4 mt-14">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>

        {!config ? (
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              Server configuration not found. Please configure the server connection first.
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-6">
            <p className="text-red-800 dark:text-red-200">
              Error connecting to server. Please check your configuration.
            </p>
          </div>
        ) : isLoading ? (
          <p className="text-xl text-gray-800 dark:text-gray-200">
            Loading server status...
          </p>
        ) : serverStatus ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-xl font-medium mb-3 text-gray-900 dark:text-gray-100">
              Server Status: <span className="font-bold text-green-600 dark:text-green-400">Online</span>
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-gray-800 dark:text-gray-200">
                  <strong>Players Online:</strong> {serverStatus.onlinePlayers}
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  <strong>Max Players:</strong> {serverStatus.maxPlayers}
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  <strong>Server Version:</strong> {serverStatus.version}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {config && (
          <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Execute Command
            </h2>
            <form onSubmit={handleExecuteCommand} className="flex gap-2">
              <Input
                placeholder="Enter server command..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!command.trim()}>
                Execute
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

