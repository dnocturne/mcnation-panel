import { describe, it, expect } from "bun:test";
import { pool } from "../db";

describe("Database Connection", () => {
	it("should have pool available with required methods", () => {
		expect(typeof pool.execute).toBe("function");
		expect(typeof pool.getConnection).toBe("function");
	});

	it("should export pool object", () => {
		expect(pool).toBeTruthy();
	});
}); 