// Import happy-dom for DOM environment
import { Window } from "happy-dom";

// Create a window object for the tests
const happyWindow = new Window();
const happyDocument = happyWindow.document;

// Expose them globally with proper typing
interface CustomGlobal {
	document: typeof happyDocument;
	window: typeof happyWindow;
	navigator: {
		userAgent: string;
	};
}

// Extend the global object
Object.assign(global, {
	document: happyDocument,
	window: happyWindow,
	navigator: {
		userAgent: "node",
	},
} as CustomGlobal);

// No need for beforeAll since we're setting up directly
