"use client";

import { useEffect, useState } from "react";
import { NavigationMenuDemo } from "@/components/navbar";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, Terminal, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { withAuth } from "@/components/protected-route";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/use-permissions";

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

	// Use localhost for local development, or server's actual IP/domain for production
	const host = config.host === "0.0.0.0" ? "localhost" : config.host;

	const response = await fetch(`http://${host}:${config.port}/status`, {
		headers: {
			"X-API-Key": config.apiKey,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch server status");
	}

	return response.json();
}

async function getServerConfig(): Promise<ServerConfig | null> {
	const response = await fetch("/api/server/config");
	if (!response.ok) {
		return null;
	}
	return response.json();
}

async function executeCommand(
	config: ServerConfig,
	command: string,
): Promise<CommandResponse> {
	const host = config.host === "0.0.0.0" ? "localhost" : config.host;
	const response = await fetch(`http://${host}:${config.port}/execute`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-API-Key": config.apiKey,
		},
		body: JSON.stringify({ command }),
	});

	if (!response.ok) {
		throw new Error("Failed to execute command");
	}

	return response.json();
}

const AdminPage = () => {
	const [isMounted, setIsMounted] = useState(false);
	const [config, setConfig] = useState<ServerConfig | null>(null);
	const [isConfigLoading, setIsConfigLoading] = useState(true);
	const [command, setCommand] = useState("");
	const { toast } = useToast();
	const router = useRouter();
	const { data: hasDashboardAccess, isLoading: permissionLoading } =
		usePermission("panel.dashboard");

	useEffect(() => {
		setIsMounted(true);
		getServerConfig()
			.then(setConfig)
			.finally(() => setIsConfigLoading(false));
	}, []);

	useEffect(() => {
		if (isMounted && !permissionLoading && hasDashboardAccess === false) {
			console.log("No dashboard access, redirecting from admin page");
			router.push("/");
		}
	}, [hasDashboardAccess, permissionLoading, router, isMounted]);

	const {
		data: serverStatus,
		error,
		isLoading: serverStatusLoading,
	} = useQuery<ServerStatus>({
		queryKey: ["serverStatus", config],
		queryFn: () => fetchServerStatus(config),
		enabled: !!config,
		refetchInterval: 5000,
	});

	if (!isMounted || permissionLoading || !hasDashboardAccess) return null;

	const StatusSkeleton = () => (
		<div className="grid gap-6 md:grid-cols-3">
			{[1, 2, 3].map((i) => (
				<Card key={i}>
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-4 rounded-full" />
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Skeleton className="h-7 w-16" />
							<Skeleton className="h-4 w-24" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);

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
				description:
					error instanceof Error ? error.message : "Failed to execute command",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<NavigationMenuDemo />
			<div className="container mx-auto py-8 px-4 mt-14">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-foreground">
						Admin Dashboard
					</h1>
				</div>

				{isConfigLoading || (config && serverStatusLoading) ? (
					<StatusSkeleton />
				) : !config ? (
					<Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
						<CardContent className="flex items-center gap-4 p-4">
							<AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
							<div>
								<p className="text-yellow-800 dark:text-yellow-200 font-medium">
									Server configuration not found
								</p>
								<p className="text-yellow-700 dark:text-yellow-300 text-sm">
									Please configure the REST API connection in the{" "}
									<a href="/admin/rest" className="underline">
										API Config
									</a>{" "}
									page.
								</p>
							</div>
						</CardContent>
					</Card>
				) : error ? (
					<Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
						<CardContent className="flex items-center gap-4 p-4">
							<AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
							<div>
								<p className="text-red-800 dark:text-red-200 font-medium">
									Connection Error
								</p>
								<p className="text-red-700 dark:text-red-300 text-sm">
									Failed to connect to the server. Please check your
									configuration.
								</p>
							</div>
						</CardContent>
					</Card>
				) : serverStatus ? (
					<div className="grid gap-6 md:grid-cols-3">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									Online Players
								</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{serverStatus.onlinePlayers}
								</div>
								<p className="text-xs text-muted-foreground">
									of {serverStatus.maxPlayers} max players
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									Server Status
								</CardTitle>
								<Server className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600 dark:text-green-400">
									Online
								</div>
								<p className="text-xs text-muted-foreground">
									Version: {serverStatus.version}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium">
									Server Info
								</CardTitle>
								<Terminal className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-sm">
									<p className="text-muted-foreground">
										Host: {config.host}:{config.port}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				) : null}

				{config && (
					<Card className="mt-6">
						<CardHeader>
							<CardTitle>Execute Command</CardTitle>
						</CardHeader>
						<CardContent>
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
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};

export default withAuth(AdminPage);
