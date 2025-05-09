"use client";

import StartHighlight from "@/components/start-highlight";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  IconArrowRight,
  IconBrandDiscordFilled,
  IconBrandTelegram,
  IconBrandX,
  IconMenu2,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import ConnectWalletClient from "../client-wrappers/connect-wallet-client";
import ClientOnly from "../client-only";

const MENU_ITEMS = [
  { label: "Trade", href: "/" },
  { label: "Market", href: "/" },
  { label: "Analytics", href: "/" },
  { label: "Market", href: "/" },
];

function Header() {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <div className={`z-50 border-b border-border bg-background uppercase`}>
      <div className="relative flex items-center justify-between bg-primary px-32 py-[0.60rem] text-[0.5rem] font-normal leading-5 text-primary-foreground lg:text-xs">
        <StartHighlight />
        <div className="absolute left-1/2 top-1/2 flex h-5 -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-nowrap">
          <p className="font-normal">
            <span className="text-highlight">TESTNET</span> IS LIVE!
          </p>
          <Separator className="h-4 w-px" orientation="vertical" />
          <Link
            href="/about-testnet"
            className="flex items-center gap-2 text-nowrap text-primary-foreground"
          >
            Learn more about Testnets
            <IconArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <StartHighlight />
      </div>
      {/* Desktop */}
      <div className="hidden xl:block">
        <div className="relative z-10 flex items-center justify-between px-32 pb-4 pt-6">
          <div className="absolute left-1/2 top-1/2 mb-8 -translate-x-1/2 -translate-y-1/2">
            <ArtisanHubLogo />
          </div>
          <div className="flex h-7 items-center gap-6 text-xs font-normal leading-5">
            {MENU_ITEMS.map((item, index) => (
              <div key={index}>
                <Link
                  className="relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
                  href={`${item.href}`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
            <div>
              <Link
                className="relative block after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full 2xl:hidden"
                href="/about-us"
              >
                About Us
              </Link>
            </div>
          </div>
          <div className="flex h-7 items-center gap-4 text-xs font-normal leading-5">
            <div className="hidden 2xl:block">
              <div>
                <Link
                  className="relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
                  href="/about-us"
                >
                  About Us
                </Link>
              </div>
              <Separator orientation="vertical" />
            </div>
            <Socials />
            <Separator orientation="vertical" />
            <ThemeToggle />
            <ConnectWalletClient />
          </div>
        </div>
      </div>
      {/* Mobile */}
      <div className="block xl:hidden">
        <div className="relative z-10 flex items-center justify-between px-4 py-4">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <ArtisanHubLogo />
          </div>
          <IconMenu2 onClick={toggleOpen} className="ml-auto h-4 w-4" />
        </div>

        {open && (
          <div className="flex flex-col gap-8 px-4 py-4">
            <div className="flex flex-col items-center gap-4">
              {MENU_ITEMS.map((item, index) => (
                <div key={index}>
                  <Link href={`/${item.href}`}>{item.label}</Link>
                </div>
              ))}
              <Link href="/about-us">About Us</Link>
              <ConnectWalletClient />
            </div>
            <Socials />
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ArtisanHubLogo = () => {
  return (
    <div className="flex items-center">
      <Link href={"/"} className="text-2xl font-bold">
        artisanhub
      </Link>
    </div>
  );
};

const Socials = () => {
  return (
    <div className="flex items-center justify-center gap-10 lg:gap-4">
      <Link href="/" aria-label="Join our Discord community">
        <IconBrandDiscordFilled className="size-6 lg:size-4" />
      </Link>
      <Link
        // target="_blank"
        href="#"
        aria-label="Visit our X (formerly Twitter) profile"
        rel="noopener noreferrer"
      >
        <IconBrandX className="size-6 lg:size-4" />
      </Link>
      <Link href="/" aria-label="Join us on Telegram">
        <IconBrandTelegram className="size-6 lg:size-4" />
      </Link>
    </div>
  );
};

export default Header;
