"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavigationMenuDemo } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const redirectPath = searchParams.get("redirect") || "/";
	const { login } = useAuth();

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const result = await login(username, password, redirectPath);

			if (!result.success) {
				setError(result.error || "Invalid username or password");
				setIsLoading(false);
				return;
			}

			toast({
				title: "Login successful",
				description: "Welcome back!",
			});
		} catch (error) {
			console.error("Login error:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-background relative">
			<NavigationMenuDemo />
			<div className="absolute inset-0 flex items-center justify-center">
				<Card className="w-full max-w-md mx-4">
					<CardHeader>
						<CardTitle>Login</CardTitle>
						<CardDescription>
							Enter your Minecraft username and password to continue
						</CardDescription>
					</CardHeader>
					<form onSubmit={onSubmit}>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									placeholder="Enter your Minecraft username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>

							{error && (
								<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-4 w-4" />
										<p>{error}</p>
									</div>
								</div>
							)}
						</CardContent>
						<CardFooter>
							<Button className="w-full" type="submit" disabled={isLoading}>
								{isLoading ? "Logging in..." : "Login"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
