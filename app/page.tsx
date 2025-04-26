import ArtGenerator from "@/components/art-generator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create AI Art | ArtisanHub",
  description:
    "Generate unique AI artwork from text descriptions or reference images.",
};

export default function CreatePage() {
  return (
    <main className="flex min-h-screen flex-col pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Create AI Art</h1>
          <p className="text-muted-foreground max-w-3xl">
            Transform your ideas into unique digital artwork using our
            AI-powered generator. Describe what you want to create or upload a
            reference image to get started.
          </p>
        </div>

        <ArtGenerator />
      </div>
    </main>
  );
}
