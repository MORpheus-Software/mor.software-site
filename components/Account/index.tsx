'use client';

// Imports
// ========================================================
import { useAccount } from 'wagmi';

// Main Page
// ========================================================
export default function Account() {
  // Hooks
  const { isConnected } = useAccount();

  // Render
  return (
    <section className="mb-6 border-b border-zinc-700 pb-6">
      <>
        <h2>Account Connection</h2>
        {isConnected ? (
          <div>
            <span className="dot green"></span>
            Connected
          </div>
        ) : (
          <div>
            <span className="dot red"></span>
            Account NOT Connected
          </div>
        )}
      </>
    </section>
  );
}
