"use client";

import { useWallet } from "@lazorkit/wallet";
import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
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

interface WalletClientProps {
  connection: Connection;
}

export function WalletClient({ connection }: WalletClientProps) {
  const { connect, disconnect, isConnected, publicKey } = useWallet(connection);
  const [shortened, setShortened] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (publicKey) {
      try {
        const addressString =
          typeof publicKey === "string" ? publicKey : publicKey.toString();

        setShortened(
          `${addressString.slice(0, 4)}...${addressString.slice(-4)}`
        );
      } catch (error) {
        console.error("Error with public key:", error);
      }
    }
  }, [publicKey]);

  const handleCopy = () => {
    if (publicKey) {
      try {
        const addressText =
          typeof publicKey === "string" ? publicKey : publicKey.toString();

        navigator.clipboard.writeText(addressText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Error copying address:", error);
      }
    }
  };

  if (!isConnected) {
    return (
      <Button onClick={connect} className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {shortened}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-xs font-mono break-all text-muted-foreground">
              {publicKey &&
                (typeof publicKey === "string"
                  ? publicKey
                  : publicKey.toString())}
            </p>
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            <span>{copied ? "Copied!" : "Copy Address"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer text-destructive"
            onClick={disconnect}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
