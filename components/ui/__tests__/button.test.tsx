import { describe, it, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button Component", () => {
	it("renders correctly with default props", () => {
		const { getByText } = render(<Button>Click me</Button>);
		const button = getByText("Click me");
		expect(button.tagName).toBe("BUTTON");
	});

	it("applies variant classes correctly", () => {
		const { getByText } = render(
			<Button variant="destructive">Destructive</Button>,
		);
		const button = getByText("Destructive");
		expect(button.className).toContain("bg-destructive");
	});

	it("applies size classes correctly", () => {
		const { getByText } = render(<Button size="sm">Small</Button>);
		const button = getByText("Small");
		expect(button.className).toContain("h-8");
	});

	it("renders as a different element when asChild is true", () => {
		const { getByText } = render(
			<Button asChild>
				<a href="https://example.com">Link Button</a>
			</Button>,
		);
		const link = getByText("Link Button");
		expect(link.tagName).toBe("A");
	});

	it("passes additional props to the button element", () => {
		const { getByText } = render(<Button disabled>Disabled</Button>);
		const button = getByText("Disabled");
		expect(button.hasAttribute("disabled")).toBe(true);
	});

	it("applies custom classes alongside variant classes", () => {
		const { getByText } = render(
			<Button className="custom-class">Custom</Button>,
		);
		const button = getByText("Custom");
		expect(button.className).toContain("custom-class");
		expect(button.className).toContain("bg-primary");
	});

	it("calls onClick handler when clicked", async () => {
		let clicked = false;
		const handleClick = () => {
			clicked = true;
		};

		render(<Button onClick={handleClick}>Click me</Button>);

		// Use getAllByText and get the last one to avoid issues with multiple elements
		const buttons = screen.getAllByText("Click me");
		const button = buttons[buttons.length - 1]; // get the last button
		await userEvent.click(button);

		expect(clicked).toBe(true);
	});
});
