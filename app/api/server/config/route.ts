import { NextResponse } from "next/server";
import { getWebSocketConfig, saveWebSocketConfig } from "@/lib/db";

export async function GET() {
	try {
		const config = await getWebSocketConfig();
		if (!config) {
			return NextResponse.json(null);
		}

		// Rename the fields to match the new structure
		return NextResponse.json({
			host: config.host,
			port: config.port,
			apiKey: config.auth_token,
		});
	} catch (error) {
		console.error("Error getting server configuration:", error);
		return NextResponse.json(
			{ error: "Failed to get configuration" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	try {
		const config = await req.json();
		await saveWebSocketConfig(config.host, config.port, config.apiKey);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error saving server configuration:", error);
		return NextResponse.json(
			{ error: "Failed to save configuration" },
			{ status: 500 },
		);
	}
}
