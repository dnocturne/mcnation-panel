import "./globals.css";
import { metadata } from "@/metadata";
import LayoutWrapper from "./layout-wrapper";
import type { Metadata } from "next";
import { GeistSans } from "geist/font";
import { StoreNavigation } from "@/components/store-navigation";

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className} suppressHydrationWarning>
        <LayoutWrapper>
          {children}
          <StoreNavigation />
        </LayoutWrapper>
      </body>
    </html>
  );
}
