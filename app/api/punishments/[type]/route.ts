import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

interface PunishmentRow extends RowDataPacket {
	id: number;
	banned_by_name: string;
	reason: string;
	time: number;
	until: number;
	active: number;
	removed_by_name: string | null;
	removed_by_reason: string | null;
	player_name: string;
}

export async function GET(
	request: Request,
	context: { params: Promise<{ type: string }> },
) {
	const params = await context.params;
	const { type } = params;

	if (!type) {
		return NextResponse.json(
			{ error: "Missing punishment type parameter" },
			{ status: 400 },
		);
	}

	const { searchParams } = new URL(request.url);
	const page = Number.parseInt(searchParams.get("page") || "1");
	const pageSize = Number.parseInt(searchParams.get("pageSize") || "10");
	const offset = (page - 1) * pageSize;
	const status = searchParams.get("status") || "all";
	const player = searchParams.get("player");

	const tableMap = {
		mutes: "litebans_mutes",
		bans: "litebans_bans",
		kicks: "litebans_kicks",
		warns: "litebans_warnings",
	};

	const table = tableMap[type as keyof typeof tableMap];
	if (!table) {
		return NextResponse.json(
			{ error: "Invalid punishment type" },
			{ status: 400 },
		);
	}

	try {
		let query = "";
		let params = [];

		if (type === "kicks") {
			query = `
        SELECT 
          p.id,
          p.banned_by_name,
          p.reason,
          p.time,
          0 as until,
          1 as active,
          NULL as removed_by_name,
          NULL as removed_by_reason,
          COALESCE(u.last_nickname, 'Unknown') as player_name
        FROM ${table} p
        LEFT JOIN librepremium_data u ON p.uuid = u.uuid
        ${player ? "WHERE p.uuid IN (SELECT uuid FROM librepremium_data WHERE last_nickname = ?)" : ""}
        ORDER BY p.time DESC
        LIMIT ? OFFSET ?`;
			params = player ? [player, pageSize, offset] : [pageSize, offset];
		} else {
			query = `
        SELECT 
          p.id,
          p.banned_by_name,
          p.reason,
          p.time,
          p.until,
          CAST(p.active AS SIGNED) as active,
          p.removed_by_name,
          p.removed_by_reason,
          COALESCE(u.last_nickname, 'Unknown') as player_name
        FROM ${table} p
        LEFT JOIN librepremium_data u ON p.uuid = u.uuid
        WHERE 1=1
        ${player ? "AND p.uuid IN (SELECT uuid FROM librepremium_data WHERE last_nickname = ?)" : ""}
        ${status === "active" ? "AND p.active = 1" : ""}
        ${status === "expired" ? "AND p.active = 0" : ""}
        ORDER BY p.time DESC
        LIMIT ? OFFSET ?`;
			params = player ? [player, pageSize, offset] : [pageSize, offset];
		}

		const [rows] = await pool.execute<PunishmentRow[]>(query, params);

		const [totalResult] = await pool.execute<RowDataPacket[]>(
			`SELECT COUNT(*) as count FROM ${table}`,
		);

		return NextResponse.json({
			items: rows,
			total: totalResult[0].count,
		});
	} catch (error) {
		console.error(`Error fetching ${type}:`, error);
		return NextResponse.json(
			{ error: `Failed to fetch ${type}` },
			{ status: 500 },
		);
	}
}
