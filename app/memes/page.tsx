import type { Metadata } from "next";

import { getAllMemes } from "@/entities/meme";
import { absoluteUrl } from "@/shared/config/site";
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

export default function MemesPage(): React.JSX.Element {
  const memes = getAllMemes();

  return <MemeList memes={memes} />;
}
