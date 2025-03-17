declare module "bun:test" {
	export function mock<T extends (...args: unknown[]) => unknown>(
		implementation?: T,
	): T & {
		mock: {
			calls: Array<{ args: Parameters<T>; return: ReturnType<T> }>;
		};
		mockImplementation: (implementation: T) => void;
		mockReturnValue: (value: ReturnType<T>) => void;
		mockResolvedValue: <V>(value: V) => void;
		mockResolvedValueOnce: <V>(value: V) => void;
		mockRejectedValue: <V>(value: V) => void;
		mockReset: () => void;
		mockClear: () => void;
	};

	export function describe(name: string, fn: () => void): void;
	export function it(name: string, fn: () => void | Promise<void>): void;
	export function beforeEach(fn: () => void | Promise<void>): void;
	export function afterEach(fn: () => void | Promise<void>): void;
	export function beforeAll(fn: () => void | Promise<void>): void;
	export function afterAll(fn: () => void | Promise<void>): void;
	export function expect<T>(actual: T): {
		toBe(expected: T): void;
		toEqual(expected: unknown): void;
		toBeTruthy(): void;
		toBeFalsy(): void;
		toHaveBeenCalled(): void;
		toHaveBeenCalledWith(...args: unknown[]): void;
		toHaveProperty(name: string, value?: unknown): void;
		toContain(expected: string): void;
		toBeGreaterThan(expected: number): void;
		// Add other matchers as needed
	};
}
