"use client";

import { useEffect, useState } from "react";
import { getLocalStorage } from "@/utils/storage";

export default function AboutTestnet() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About Testnet</h1>
      <div className="prose max-w-none">
        <p>
          This application is running on Solana testnet. You can get test SOL
          from the Solana Faucet.
        </p>
        {/* Add more content as needed */}
      </div>
    </div>
  );
}
