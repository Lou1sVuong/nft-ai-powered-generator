"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Upload, RefreshCw, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ArtStyleSelector from "@/components/art-style-selector";
import { artStyles } from "./art-style-data";

export default function ArtGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("text-to-image");
  const [artStyle, setArtStyle] = useState("realistic");
  const [imageSize, setImageSize] = useState("square");
  const [quality, setQuality] = useState("standard");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Get the style name with proper formatting
      const styleText =
        artStyles.find((style) => style.id === artStyle)?.name || artStyles;

      // Prepare the full prompt with art style
      const fullPrompt = `${prompt}. Style: ${styleText}.`;

      // Call the API route that handles the DALL-E API request
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          quality: quality === "hd" ? "hd" : "standard",
          size: imageSize,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();

      // Convert base64 data to URL for display
      if (data.image) {
        setGeneratedImage(`data:image/png;base64,${data.image}`);
      } else {
        throw new Error("Failed to receive image data");
      }
    } catch (error) {
      console.log("Error generating image:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedImage(null);
    setTitle("");
    setDescription("");
    setError(null);
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = title
      ? `${title.replace(/\s+/g, "-").toLowerCase()}.png`
      : "generated-artwork.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMintNFT = () => {
    toast("Minting NFT Successfully", {
      description: "Your NFT has been minted successfully",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div>
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="text-to-image">Text to Image</TabsTrigger>
            <TabsTrigger disabled value="image-to-image">
              Image to Image
            </TabsTrigger>
          </TabsList>
          <p className="text-highlight text-xs">Coming Soon: Image to Image</p>
          <TabsContent value="text-to-image" className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="mb-2 block">
                  Describe your artwork
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the artwork you want to create... (e.g., 'A futuristic cityscape with flying cars and neon lights')"
                  className="placeholder:text-slate-500 min-h-[120px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="image-to-image" className="pt-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 mb-4" />
                  <p className="text-slate-500 mb-2">
                    Drag and drop an image, or click to browse
                  </p>
                  <p className="text-slate-500 text-sm mb-4">
                    PNG, JPG or WEBP (max. 5MB)
                  </p>
                  <Button variant="outline">Upload Image</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="prompt-image" className="mb-2 block">
                  Describe modifications
                </Label>
                <Textarea
                  id="prompt-image"
                  placeholder="Describe how you want to modify the image... (e.g., 'Make it more cyberpunk style')"
                  className="placeholder:text-slate-500"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-6">
          <div>
            <Label className="mb-4 block">Select art style</Label>
            <ArtStyleSelector
              selectedStyle={artStyle}
              onStyleSelect={setArtStyle}
            />
            <div className="mt-2 text-sm text-slate-500 italic">
              Selected style:{" "}
              {artStyle.charAt(0).toUpperCase() + artStyle.slice(1)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="size" className="mb-2 block">
                Image size
              </Label>
              <Select
                defaultValue="square"
                value={imageSize}
                onValueChange={setImageSize}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="portrait">Portrait (2:3)</SelectItem>
                  <SelectItem value="landscape">Landscape (3:2)</SelectItem>
                  <SelectItem value="wide">Wide (16:9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quality" className="mb-2 block">
                Quality
              </Label>
              <Select
                defaultValue="standard"
                value={quality}
                onValueChange={setQuality}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Artwork
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="rounded-xl border p-6">
        <h3 className="text-xl font-medium mb-6">Generated Artwork</h3>

        <div className="flex items-center justify-center min-h-[400px] border rounded-lg mb-6">
          {isGenerating ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin mb-4" />
              <p className="text-slate-300">Creating your masterpiece...</p>
            </div>
          ) : error ? (
            <div className="text-center px-6">
              <p className="text-red-500 mb-2">Error: {error}</p>
              <p className="text-slate-500 text-sm">
                Please try again with a different prompt
              </p>
            </div>
          ) : generatedImage ? (
            <img
              src={generatedImage}
              alt="Generated artwork"
              className="max-w-full max-h-[400px] rounded-lg"
            />
          ) : (
            <div className="text-center px-6">
              <Wand2 className="h-12 w-12 mx-auto mb-4" />
              <p className="text-slate-300 mb-2">
                Your artwork will appear here
              </p>
              <p className="text-slate-500 text-sm">
                Enter a detailed description and click &quot;Generate
                Artwork&quot; to create your unique NFT
              </p>
            </div>
          )}
        </div>

        {generatedImage && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white mb-2 block">
                Title your artwork
              </Label>
              <Input
                id="title"
                placeholder="Enter a title for your artwork"
                className="placeholder:text-slate-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Add a description for your artwork"
                className="placeholder:text-slate-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1" onClick={handleMintNFT}>
                Mint as NFT
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
