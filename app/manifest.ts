import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YukJajan - POS & Marketplace",
    short_name: "YukJajan",
    description:
      "Platform marketplace modern untuk menemukan jajanan favorit dan produk lokal terbaik.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#22c55e",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
