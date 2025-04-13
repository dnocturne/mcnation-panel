import "./globals.css";
import { metadata } from "@/metadata";
import LayoutWrapper from "./layout-wrapper";
import { GeistSans } from "geist/font/sans";
import Providers from "./providers";

export { metadata };

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body className={GeistSans.className} suppressHydrationWarning>
				<Providers>
					<LayoutWrapper>{children}</LayoutWrapper>
				</Providers>
			</body>
		</html>
	);
}
