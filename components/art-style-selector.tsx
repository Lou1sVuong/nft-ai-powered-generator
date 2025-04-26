"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";

interface ArtStyle {
  id: string;
  name: string;
  description: string;
  image: string;
}

const artStyles: ArtStyle[] = [
  {
    id: "realistic",
    name: "Realistic",
    description: "Photorealistic style with high detail",
    image: "/styles/realistic.jpg",
  },
  {
    id: "abstract",
    name: "Abstract",
    description: "Non-representational art with shapes and colors",
    image: "/styles/abstract.jpg",
  },
  {
    id: "anime",
    name: "Anime",
    description: "Japanese animation style",
    image: "/styles/anime.jpg",
  },
  {
    id: "cartoon",
    name: "Cartoon",
    description: "Stylized, simplified art style",
    image: "/styles/cartoon.jpg",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic high-tech with neon colors",
    image: "/styles/cyberpunk.jpg",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft, blended style with paint-like quality",
    image: "/styles/watercolor.jpg",
  },
];

export interface ArtStyleSelectorProps {
  selectedStyle?: string;
  onStyleSelect?: Dispatch<SetStateAction<string>>;
}

export default function ArtStyleSelector({
  selectedStyle = "realistic",
  onStyleSelect,
}: ArtStyleSelectorProps) {
  const [internalSelected, setInternalSelected] = useState(selectedStyle);

  const handleSelect = (styleId: string) => {
    setInternalSelected(styleId);
    if (onStyleSelect) {
      onStyleSelect(styleId);
    }
  };

  // Use either the controlled (external) or uncontrolled (internal) state
  const currentStyle = selectedStyle || internalSelected;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-6 gap-4">
      {artStyles.map((style) => (
        <Card
          key={style.id}
          className={`overflow-hidden cursor-pointer transition-all flex-1 group ${
            currentStyle === style.id
              ? "ring-2 ring-highlight ring-offset-2"
              : "opacity-70"
          }`}
          onClick={() => handleSelect(style.id)}
        >
          <div className="aspect-square relative bg-slate-200">
            <Image
              width={500}
              height={500}
              src={style.image}
              alt={style.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-all"
            />
          </div>
          <div className="p-2 text-center">
            <p className="font-medium text-xs">{style.name}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
