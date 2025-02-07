import "./globals.css";
import { metadata } from "@/metadata";
import LayoutWrapper from "./layout-wrapper";

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <LayoutWrapper>{children}</LayoutWrapper>
    </html>
  );
}
