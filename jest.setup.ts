// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "jest-extended";
import { enableFetchMocks } from "jest-fetch-mock";

// Enable fetch mocks for testing API calls
enableFetchMocks();

// Define custom router type for Next.js App Router
interface AppRouterMock {
	push: jest.Mock;
	back: jest.Mock;
	forward: jest.Mock;
	refresh: jest.Mock;
	replace: jest.Mock;
	prefetch: jest.Mock;
}

// Mock the next/navigation functionality
jest.mock("next/navigation", () => ({
	useRouter: (): AppRouterMock => ({
		push: jest.fn(),
		back: jest.fn(),
		forward: jest.fn(),
		refresh: jest.fn(),
		replace: jest.fn(),
		prefetch: jest.fn(),
	}),
	usePathname: () => "",
	useSearchParams: () => new URLSearchParams(),
}));

// Define session mock type
interface MockSession {
	data: {
		user: {
			name: string;
			role: string;
		};
	};
	status: "authenticated" | "loading" | "unauthenticated";
}

// Mock the next-auth/react functionality
jest.mock("next-auth/react", () => ({
	useSession: jest.fn(
		(): MockSession => ({
			data: {
				user: {
					name: "testuser",
					role: "admin",
				},
			},
			status: "authenticated",
		}),
	),
	signIn: jest.fn(),
	signOut: jest.fn(),
	getSession: jest.fn(),
}));

// Define any global mocks or configurations needed for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

// Helper to create custom window.matchMedia mock
interface MediaQueryList {
	matches: boolean;
	media: string;
	onchange: null | ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown);
	addListener: (
		callback: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown,
	) => void;
	removeListener: (
		callback: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown,
	) => void;
	addEventListener: <K extends keyof MediaQueryListEventMap>(
		type: K,
		listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => unknown,
		options?: boolean | AddEventListenerOptions,
	) => void;
	removeEventListener: <K extends keyof MediaQueryListEventMap>(
		type: K,
		listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => unknown,
		options?: boolean | EventListenerOptions,
	) => void;
	dispatchEvent: (event: Event) => boolean;
}

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation(
		(query: string): MediaQueryList => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: jest.fn(), // Deprecated
			removeListener: jest.fn(), // Deprecated
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
		}),
	),
});
