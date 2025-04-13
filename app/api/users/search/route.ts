import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import fs from "node:fs";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");

		if (!query || query.length < 2) {
			return NextResponse.json([]);
		}

		// Search for users in database
		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT username FROM PlayerData 
       WHERE username LIKE ? 
       ORDER BY username ASC
       LIMIT 10`,
			[`%${query}%`],
		);

		// Format the results
		const results = rows.map((row) => {
			// Check if avatar exists in the filesystem
			const avatarUrl = fs.existsSync(`public/avatars/${row.username}.jpg`)
				? `/avatars/${row.username}.jpg`
				: null;

			return {
				username: row.username,
				avatarUrl,
			};
		});

		return NextResponse.json(results);
	} catch (error) {
		console.error("Error searching for users:", error);
		return NextResponse.json(
			{ error: "Failed to search for users" },
			{ status: 500 },
		);
	}
}
