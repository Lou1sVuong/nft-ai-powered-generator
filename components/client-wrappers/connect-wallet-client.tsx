"use client";

import dynamic from "next/dynamic";

// Import ConnectWalletBtn with client-side only rendering
const ConnectWalletBtn = dynamic(() => import("@/components/connect-btn"), {
  ssr: false,
});

export default function ConnectWalletClient() {
  return <ConnectWalletBtn />;
}
