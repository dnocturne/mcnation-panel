"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { NavigationMenuDemo } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen bg-background">
      <NavigationMenuDemo />
      <div className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>REST API Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    placeholder="Enter server host (e.g. localhost)"
                    value={config.host}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 