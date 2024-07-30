// Imports
// ========================================================
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { cookieToInitialState } from "wagmi";
import { config } from "@/config";
import ContextProvider from "@/context";
import { auth, signIn, signOut } from "@/auth";
import Button from "@/components/button";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Metadata
// ========================================================
export const metadata: Metadata = {
  title: "Morpheus",
  description: "Morpheus",
};

// Main Layout
// ========================================================
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  let session = await auth();
  let user = session?.user?.name;

  return (
    <html lang="en">
      <body>
        {/* <div className="w-full">
          {user ? <SignOut>{`Welcome, ${user}`}</SignOut> : <SignIn />}
        </div> */}
        <SessionProvider session={session}>
          <ContextProvider initialState={initialState}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow  sm:p-8">{children}</main>

              <Footer />
            </div>
          </ContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
