import type { Metadata } from "next";
import Header from "@/components/layouts/header";
import "@/styles/globals.css";
import { IBM_Plex_Mono } from "next/font/google";
import Providers from "@/providers";

const ibmPlexMonoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "ArtisanHub",
  description:
    "Where AI meets human creativity — ArtisanHub turns your ideas into valuable digital assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ibmPlexMonoFont.className} ${ibmPlexMonoFont.variable} custom-selection antialiased`}
      >
        <Providers>
          <Header />
          <main className="flex flex-col gap-2 px-2 py-14 xl:px-32">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
