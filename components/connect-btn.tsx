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
import dynamic from "next/dynamic";

const connection = new Connection("https://api.devnet.solana.com");

// Dynamically import the component with no SSR to avoid localStorage errors
const ConnectWalletBtnClient = dynamic(
  () => import("./wallet-client").then((mod) => mod.WalletClient),
  {
    ssr: false,
    loading: () => (
      <Button disabled className="opacity-50">
        <Wallet className="h-4 w-4 mr-2" />
        Loading Wallet...
      </Button>
    ),
  }
);

// Export the client-only component as default
export default function ConnectWalletBtn() {
  return <ConnectWalletBtnClient connection={connection} />;
}
