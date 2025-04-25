"use client";

import { useState } from "react";

const artStyles = [
  {
    id: "digital",
    name: "Digital Art",
    image: "/placeholder.svg?height=100&width=100&text=Digital",
  },
  {
    id: "pixel",
    name: "Pixel Art",
    image: "/placeholder.svg?height=100&width=100&text=Pixel",
  },
  {
    id: "abstract",
    name: "Abstract",
    image: "/placeholder.svg?height=100&width=100&text=Abstract",
  },
  {
    id: "surreal",
    name: "Surrealism",
    image: "/placeholder.svg?height=100&width=100&text=Surreal",
  },
  {
    id: "cyber",
    name: "Cyberpunk",
    image: "/placeholder.svg?height=100&width=100&text=Cyber",
  },
  {
    id: "vapor",
    name: "Vaporwave",
    image: "/placeholder.svg?height=100&width=100&text=Vapor",
  },
  {
    id: "anime",
    name: "Anime",
    image: "/placeholder.svg?height=100&width=100&text=Anime",
  },
  {
    id: "3d",
    name: "3D Render",
    image: "/placeholder.svg?height=100&width=100&text=3D",
  },
];

export default function ArtStyleSelector() {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-4 gap-3">
      {artStyles.map((style) => (
        <div
          key={style.id}
          className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
            selectedStyle === style.id
              ? "border-purple-500 ring-2 ring-purple-500/50"
              : "border-slate-700 hover:border-slate-600"
          }`}
          onClick={() => setSelectedStyle(style.id)}
        >
          <div className="aspect-square relative">
            <img
              src={style.image || "/placeholder.svg"}
              alt={style.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-2">
              <span className="text-xs text-white font-medium">
                {style.name}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
