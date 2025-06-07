import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
	request: Request,
	context: { params: Promise<{ username: string }> },
) {
	const params = await context.params;
	const { username } = params;

	// Check authentication
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Check if user is trying to upload their own avatar
	if (session.user.name !== username) {
		return NextResponse.json(
			{ error: "You can only upload your own avatar" },
			{ status: 403 },
		);
	}

	try {
		const formData = await request.formData();
		const avatar = formData.get("avatar") as File;

		if (!avatar) {
			return NextResponse.json(
				{ error: "No avatar file provided" },
				{ status: 400 },
			);
		}

		// Create uploads directory if it doesn't exist
		const uploadDir = join(process.cwd(), "public/avatars");
		await mkdir(uploadDir, { recursive: true });

		// Convert File to Buffer
		const bytes = await avatar.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Save file
		const filepath = join(uploadDir, `${username}.jpg`);
		await writeFile(filepath, buffer);

		return NextResponse.json({
			success: true,
			avatarUrl: `/avatars/${username}.jpg`,
		});
	} catch (error) {
		console.error("Error uploading avatar:", error);
		return NextResponse.json(
			{ error: "Failed to upload avatar" },
			{ status: 500 },
		);
	}
}

export async function GET(
	request: Request,
	context: { params: Promise<{ username: string }> },
) {
	const params = await context.params;
	const { username } = params;

	try {
		const avatarPath = path.join(
			process.cwd(),
			"public",
			"avatars",
			`${username}.jpg`,
		);
		const hasCustomAvatar = fs.existsSync(avatarPath);

		return NextResponse.json({
			avatarUrl: hasCustomAvatar
				? `/avatars/${username}.jpg`
				: `https://mc-heads.net/avatar/${username}`,
		});
	} catch (error) {
		console.error("Error checking avatar:", error);
		return NextResponse.json({
			avatarUrl: `https://mc-heads.net/avatar/${username}`,
		});
	}
}
