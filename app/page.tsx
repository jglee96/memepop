import type { Metadata } from "next";

import { getAllMemes } from "@/entities/meme";
import { absoluteUrl } from "@/shared/config/site";
import { HomeLanding } from "@/widgets/home-landing";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export default function HomePage(): React.JSX.Element {
  const memes = getAllMemes();

  return <HomeLanding memes={memes} />;
}
