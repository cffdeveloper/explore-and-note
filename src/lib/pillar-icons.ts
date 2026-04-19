import dataScience from "@/assets/pillar-data-science.png";
import realEstate from "@/assets/pillar-real-estate.png";
import trading from "@/assets/pillar-trading.png";
import sales from "@/assets/pillar-sales.png";
import negotiation from "@/assets/pillar-negotiation.png";
import publicSpeaking from "@/assets/pillar-public-speaking.png";
import law from "@/assets/pillar-law.png";
import business from "@/assets/pillar-business.png";

export const PILLAR_ICONS: Record<string, string> = {
  "data-science": dataScience,
  "real-estate": realEstate,
  trading,
  sales,
  negotiation,
  "public-speaking": publicSpeaking,
  law,
  business,
};

export const getPillarIcon = (slug: string): string | undefined => PILLAR_ICONS[slug];
