import "./globals.css";
import { metadata } from "@/metadata";
import LayoutWrapper from "./layout-wrapper";
import type { Metadata } from "next";
import { GeistSans } from "geist/font";
import { StoreNavigation } from "@/components/store-navigation";
import Providers from './providers'

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
          <LayoutWrapper>
            {children}
            <StoreNavigation />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
