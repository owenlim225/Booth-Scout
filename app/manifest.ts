import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BoothScout",
    short_name: "BoothScout",
    description: "Unlock Stellar-powered event routes and keep checklist progress offline.",
    start_url: "/events/eth-manila-demo-summit",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#09090b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
