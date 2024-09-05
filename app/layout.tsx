// Imports
// ========================================================
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { cookieToInitialState } from 'wagmi';
import { config } from '@/config';
import ContextProvider from '@/context';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getNotificationsByUserId } from '@/lib/server';
import NotificationPanel from '@/components/NotificationPanel';

// Metadata
// ========================================================
export const metadata: Metadata = {
  title: 'Morpheus',
  description: 'Morpheus',
};

// Main Layout
// ========================================================
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialState = cookieToInitialState(config, headers().get('cookie'));
  let session = await auth();
  let user = session?.user;

  // Fetch notifications, ensuring they are handled correctly
  let notifications = (await getNotificationsByUserId(user?.id)) || [];

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <ContextProvider initialState={initialState}>
            <div className="flex min-h-screen flex-col">
              <Header uid={user?.id} initialNotifications={notifications} />
              {/* Pass notifications correctly to the NotificationPanel */}
              {/* <NotificationPanel /> */}

              <main className="flex-grow sm:p-8">{children}</main>

              <Footer />
            </div>
          </ContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
