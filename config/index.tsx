// Imports
// ========================================================
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";
import { sepolia } from "wagmi/chains";

// Constants
// ========================================================
// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

const metadata = {
  name: "Morpheus Web3Modal",
  description: "Morpheus Web3Modal Example",
  url: "https://example.com", // origin must match your domain & subdomain
  icons: ["https://example.com"],
};

if (!projectId) throw new Error("Project ID is not defined");

// Config
// ========================================================
export const config = defaultWagmiConfig({
  chains: [sepolia], // required
  projectId, // required
  metadata, // required
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  enableCoinbase: true, // Optional - true by default
  //   ...wagmiOptions // Optional - Override createConfig parameters
});
