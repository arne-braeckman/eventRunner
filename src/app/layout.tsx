import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { TRPCReactProvider } from "~/trpc/react";
import { ConvexClientProvider } from "~/components/providers/ConvexAuthProvider";
import { Navigation } from "~/components/layout/Navigation";

export const metadata: Metadata = {
  title: "eventRunner",
  description: "Comprehensive event venue management platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable}`}>
        <body>
          <ConvexClientProvider>
            <TRPCReactProvider>
              <Navigation />
              {children}
            </TRPCReactProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
