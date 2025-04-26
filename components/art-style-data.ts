export interface ArtStyle {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const artStyles: ArtStyle[] = [
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