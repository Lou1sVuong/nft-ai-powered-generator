"use client";

import dynamic from "next/dynamic";

// Import ArtGenerator with client-side only rendering
const ArtGenerator = dynamic(() => import("@/components/art-generator"), {
  ssr: false,
});

export default function ArtGeneratorClient() {
  return <ArtGenerator />;
}
