import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files
	dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	testEnvironment: "jest-environment-jsdom",
	moduleNameMapper: {
		// Handle module aliases (if you configured any in next.config.js)
		"^@/components/(.*)$": "<rootDir>/components/$1",
		"^@/app/(.*)$": "<rootDir>/app/$1",
		"^@/lib/(.*)$": "<rootDir>/lib/$1",
		"^@/hooks/(.*)$": "<rootDir>/hooks/$1",
	},
	collectCoverage: true,
	collectCoverageFrom: [
		"app/**/*.{ts,tsx}",
		"components/**/*.{ts,tsx}",
		"lib/**/*.{ts,tsx}",
		"hooks/**/*.{ts,tsx}",
		"!**/*.d.ts",
		"!**/node_modules/**",
		"!**/.next/**",
	],
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 70,
			lines: 70,
			statements: 70,
		},
	},
	testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
export default createJestConfig(customJestConfig);
