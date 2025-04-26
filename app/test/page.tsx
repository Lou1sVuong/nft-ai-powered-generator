"use client";

import { LazorConnect, useWallet } from "@lazorkit/wallet";
import { Connection, PublicKey } from "@solana/web3.js";
import { WalletButton } from "@lazorkit/wallet";

const connection = new Connection("https://api.devnet.solana.com");

export default function TestPage() {
  const { isConnected, publicKey, connect, disconnect } = useWallet();

  return (
    <div>
      <LazorConnect onConnect={connect} />
      {isConnected && <div>Public Key: {publicKey}</div>}
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
