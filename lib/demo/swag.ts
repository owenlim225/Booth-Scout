import type { SwagOffer } from "@/types/demo";

export const demoSwagOffers: SwagOffer[] = [
  {
    id: "swag-stellar-tote",
    boothId: "stellar-hub",
    itemName: "Stellar Tote + Sticker Pack",
    itemType: "Bag",
    requirement: "Follow @StellarOrg and show your Freighter address.",
    estimatedValue: "medium",
    hassleLevel: "low",
    availability: "available",
  },
  {
    id: "swag-soroban-pin",
    boothId: "soroban-lab",
    itemName: "Limited Soroban Enamel Pin",
    itemType: "Collectible",
    requirement: "Pass the 2-minute contract quiz.",
    estimatedValue: "high",
    hassleLevel: "medium",
    availability: "limited",
  },
  {
    id: "swag-wallet-stand",
    boothId: "wallet-square",
    itemName: "Foldable Phone Stand",
    itemType: "Accessory",
    requirement: "Install the wallet app and scan the QR.",
    estimatedValue: "low",
    hassleLevel: "medium",
    availability: "available",
  },
  {
    id: "swag-dex-tumbler",
    boothId: "dex-district",
    itemName: "Insulated Tumbler",
    itemType: "Drinkware",
    requirement: "Complete one testnet swap simulation.",
    estimatedValue: "medium",
    hassleLevel: "medium",
    availability: "limited",
  },
  {
    id: "swag-builder-notebook",
    boothId: "builder-alley",
    itemName: "Builder Notebook + Lanyard",
    itemType: "Stationery",
    requirement: "Attend a 5-minute lightning talk.",
    estimatedValue: "low",
    hassleLevel: "low",
    availability: "available",
  },
  {
    id: "swag-validator-socks",
    boothId: "validator-lounge",
    itemName: "Validator Socks + Keycap",
    itemType: "Apparel",
    requirement: "Answer the validator uptime trivia.",
    estimatedValue: "high",
    hassleLevel: "low",
    availability: "available",
  },
];

export function getSwagForBooth(boothId: string): SwagOffer[] {
  return demoSwagOffers.filter((offer) => offer.boothId === boothId);
}
