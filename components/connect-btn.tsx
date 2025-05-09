"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, LogOut, ChevronDown, Wallet } from "lucide-react";
import { useWallet } from "@lazorkit/wallet";
import { useSessionStorage } from "@/hooks/useSessionStorage";

export const connection = new Connection("https://rpc.lazorkit.xyz/", {
  wsEndpoint: "https://rpc.lazorkit.xyz",
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000,
});

export default function ConnectWalletBtn() {
  const {
    isConnected,
    publicKey,
    connect,
    disconnect,
    signMessage,
    smartWalletAuthorityPubkey,
    error,
    isLoading,
  } = useWallet();

  const [storedSmartWalletPubkey, setStoredSmartWalletPubkey] =
    useSessionStorage("smartWalletAuthorityPubkey", "");
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (smartWalletAuthorityPubkey) {
      setStoredSmartWalletPubkey(smartWalletAuthorityPubkey);
      console.log(
        "Wallet connected with public key:",
        smartWalletAuthorityPubkey
      );

      // Fetch balance when wallet is connected
      const fetchBalance = async () => {
        try {
          const publicKey = new PublicKey(smartWalletAuthorityPubkey);
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL); // Convert lamports to SOL
        } catch (err) {
          console.error("Error fetching balance:", err);
        }
      };

      fetchBalance();
    }
  }, [smartWalletAuthorityPubkey, setStoredSmartWalletPubkey]);

  const handleCopyAddress = () => {
    if (storedSmartWalletPubkey) {
      navigator.clipboard.writeText(storedSmartWalletPubkey);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className="opacity-50">
        <Wallet className="h-4 w-4 mr-2" />
        Loading Wallet...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button onClick={connect}>
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Wallet className="h-4 w-4 mr-2" />
          {storedSmartWalletPubkey?.slice(0, 4)}...
          {storedSmartWalletPubkey?.slice(-4)}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Wallet Address</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCopyAddress}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {balance !== null && (
          <DropdownMenuItem className="flex items-center justify-between">
            <span>Balance:</span>
            <span className="font-medium">{balance.toFixed(2)} SOL</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect}>
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
