import { cn, formatCurrency, formatDate } from "../utils";

describe("Utility Functions", () => {
	// Test the cn function
	describe("cn", () => {
		it("should merge tailwind classes correctly", () => {
			expect(cn("text-red-500", "bg-blue-500")).toBe(
				"text-red-500 bg-blue-500",
			);
			expect(cn("p-4", "p-6")).toBe("p-6");
			expect(cn("block", "inline", { hidden: true })).toBe("hidden");
		});

		it("should handle conditional classes", () => {
			const condition = true;
			expect(cn("base-class", { "conditional-class": condition })).toBe(
				"base-class conditional-class",
			);

			const falseCondition = false;
			expect(cn("base-class", { "conditional-class": falseCondition })).toBe(
				"base-class",
			);
		});
	});

	// Test the formatCurrency function
	describe("formatCurrency", () => {
		it("should format numbers as USD currency", () => {
			expect(formatCurrency(0)).toBe("$0.00");
			expect(formatCurrency(9.99)).toBe("$9.99");
			expect(formatCurrency(1000)).toBe("$1,000.00");
			expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
		});

		it("should handle negative values", () => {
			expect(formatCurrency(-9.99)).toBe("-$9.99");
		});

		it("should format decimal places correctly", () => {
			expect(formatCurrency(10.5)).toBe("$10.50");
			expect(formatCurrency(10.555)).toBe("$10.56"); // Should round
		});
	});

	// Test the formatDate function
	describe("formatDate", () => {
		it("should format date strings correctly", () => {
			// Testing with a fixed date to avoid locale-dependent issues
			const dateString = "2023-04-29T12:34:56Z";

			// Default format
			expect(formatDate(dateString)).toMatch(/Apr 29, 2023/);

			// Custom format
			expect(formatDate(dateString, "yyyy-MM-dd")).toBe("2023-04-29");
		});

		it("should handle Date objects", () => {
			const date = new Date(2023, 3, 29); // April 29, 2023
			expect(formatDate(date, "yyyy-MM-dd")).toBe("2023-04-29");
		});

		it("should handle null or undefined values", () => {
			expect(formatDate(null)).toBe("N/A");
			expect(formatDate(undefined)).toBe("N/A");
		});

		it("should handle invalid dates gracefully", () => {
			expect(formatDate("not-a-date")).toBe("Invalid date");
		});
	});
});
