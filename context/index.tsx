'use client';

// Imports
// ========================================================
import React, { ReactNode, Suspense } from 'react';
import { config, projectId } from '@/config';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { State, WagmiProvider } from 'wagmi';
import { store, persister } from '@/Store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Config
// ========================================================
// Setup queryClient
const queryClient = new QueryClient({
  // Prevent refetch on window refos
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

if (!projectId) throw new Error('Project ID is not defined');

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeVariables: {
    '--w3m-color-mix': '#00BB7F',
    '--w3m-border-radius-master': '2',
  },
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

// Exports
// ========================================================
export default function Web3Modal({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <Suspense fallback={<div className=""></div>}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persister}>
          <WagmiProvider config={config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
              <ToastContainer />
              {children}
            </QueryClientProvider>
          </WagmiProvider>
        </PersistGate>
      </ReduxProvider>
    </Suspense>
  );
}
