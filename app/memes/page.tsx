import type { Metadata } from "next";

import { getAllMemes } from "@/entities/meme";
import { absoluteUrl } from "@/shared/config";
import { getMemeLikeCounts } from "@/shared/lib/memeLikeStore";
import { MemeList } from "@/widgets/meme-list";

export const metadata: Metadata = {
  title: "밈 목록 - 현재 지원 밈 모아보기",
  description: "MemePop에서 현재 지원하는 밈 목록과 밈별 생성 페이지를 확인하세요.",
  alternates: {
    canonical: absoluteUrl("/memes")
  },
  openGraph: {
    title: "밈 목록 - 현재 지원 밈 모아보기 | MemePop",
    description: "MemePop에서 현재 지원하는 밈 목록과 밈별 생성 페이지를 확인하세요.",
    url: absoluteUrl("/memes")
  }
};

export const dynamic = "force-dynamic";

export default async function MemesPage(): Promise<React.JSX.Element> {
  const memes = getAllMemes();
  const likeCounts = await getMemeLikeCounts(memes.map((meme) => meme.slug));

  return <MemeList memes={memes} likeCounts={likeCounts} />;
}
