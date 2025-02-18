"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";

interface APIConfig {
  host: string;
  port: string;
  apiKey: string;
}

export default function APIConfigPage() {
  const [config, setConfig] = useState<APIConfig>({
    host: "",
    port: "",
    apiKey: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/server/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      // Test the connection
      const testResponse = await fetch(`http://${config.host}:${config.port}/status`, {
        headers: {
          'X-API-Key': config.apiKey
        }
      });

      if (!testResponse.ok) {
        throw new Error('Failed to connect to server');
      }

      toast({
        title: "Success",
        description: "Server configuration saved and connection verified",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save server configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto py-8 px-4 mt-14">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Server Configuration
        </h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="Enter server host (e.g. localhost)"
                value={config.host}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, host: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder="Enter port number (default: 4567)"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter API key"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Save Configuration
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 