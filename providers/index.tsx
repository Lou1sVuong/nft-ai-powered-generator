"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { WalletProvider } from "./wallet-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WalletProvider>{children}</WalletProvider>
    </ThemeProvider>
  );
}
