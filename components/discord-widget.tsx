"use client";

import { useEffect, useState } from "react";
import { MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscordData {
	presence_count: number;
	instant_invite: string;
}

export function DiscordWidget() {
	const [memberCount, setMemberCount] = useState<number>(0);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Use a CORS proxy or your own API endpoint
				const response = await fetch("/api/discord-widget");
				if (!response.ok) {
					throw new Error("Failed to fetch Discord data");
				}
				const data: DiscordData = await response.json();
				setMemberCount(data.presence_count || 0);
			} catch (error) {
				console.error("Discord widget error:", error);
			}
		};

		fetchData();
		const interval = setInterval(fetchData, 60000);
		return () => clearInterval(interval);
	}, []);

	return (
		<Button
			variant="outline"
			className="w-full justify-start"
			onClick={() => window.open("https://discord.mcnation.lt", "_blank")}
		>
			<MessageCircleMore className="h-5 w-5 text-[#5865F2]" />
			<span className="ml-2">Join our Discord - {memberCount} online</span>
		</Button>
	);
}
