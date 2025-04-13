import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import fs from "node:fs";

interface UserProfile extends RowDataPacket {
	username: string;
	isOnlineServer: boolean;
	isOperator: boolean;
	mobKills: number;
	permissionGroups: string[];
	playtime: string;
	highestRank: string;
	firstjoindate: string;
	lastseendate: string;
}

// Helper function to determine highest rank based on LuckPerms weight
async function getHighestRank(groups: string[]): Promise<string> {
	if (!groups.length) return "default";

	try {
		// Query to get all weight permissions for the user's groups
		const weightQuery = `
      SELECT name, permission, value
      FROM luckperms_group_permissions
      WHERE name IN (${groups.map(() => "?").join(",")})
      AND permission LIKE 'weight.%'
    `;

		const [rows] = await pool.execute<RowDataPacket[]>(weightQuery, groups);

		if (!rows.length) {
			// If no weights found, return the first group or default
			return groups[0] || "default";
		}

		// Extract the weights and find the highest
		const groupWeights = rows.map((row) => {
			const weight = Number.parseInt(row.permission.replace("weight.", ""), 10);
			return {
				group: row.name,
				weight: Number.isNaN(weight) ? 0 : weight,
			};
		});

		// Sort by weight descending
		groupWeights.sort((a, b) => b.weight - a.weight);

		// Return the group with highest weight
		return groupWeights[0].group;
	} catch (error) {
		console.error("Error fetching group weights:", error);
		return groups[0] || "default"; // Fallback to first group or default
	}
}

export async function GET(
	request: Request,
	{ params }: { params: { username: string } },
) {
	const { username } = await params;
	if (!username) {
		return NextResponse.json(
			{ error: "Missing username parameter" },
			{ status: 400 },
		);
	}

	try {
		const query = `
      SELECT 
        username,
        online as isOnlineServer,
        operator as isOperator,
        mobkills as mobKills,
        permgroups as permissionGroups,
        totalplaytime as playtime,
        firstjoindate,
        lastseendate
      FROM PlayerData
      WHERE username = ?
    `;

		const [rows] = await pool.execute<UserProfile[]>(query, [username]);

		if (!rows.length) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Process the permission groups to find the highest rank
		const permGroups = Array.isArray(rows[0].permissionGroups)
			? rows[0].permissionGroups
			: (rows[0].permissionGroups as unknown as string)
					.split(/[,\s]+/)
					.filter(Boolean);
		const highestRank = await getHighestRank(permGroups);

		const profile = {
			...rows[0],
			permissionGroups: permGroups,
			highestRank,
			isOnlineServer: Boolean(rows[0].isOnlineServer),
			isOperator: Boolean(rows[0].isOperator),
			isOnlineWeb: false,
			firstJoinDate: rows[0].firstjoindate || "Unknown",
			lastSeenDate: rows[0].lastseendate || "Unknown",
			avatarUrl: fs.existsSync(`public/avatars/${username}.jpg`)
				? `/avatars/${username}.jpg`
				: null,
		};

		return NextResponse.json(profile);
	} catch (error) {
		console.error(`Error fetching profile for user ${username}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch user profile" },
			{ status: 500 },
		);
	}
}
