import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllMemeSlugs, getMemeBySlug } from "@/entities/meme";
import { MemeGenerateForm } from "@/features/meme-generate";
import { MemeLikeButton } from "@/features/meme-like";
import { absoluteUrl } from "@/shared/config";
import { MemeDetailContent } from "@/widgets/meme-detail";

interface MemePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getAllMemeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: MemePageProps): Promise<Metadata> {
  const { slug } = await params;
  const meme = getMemeBySlug(slug);
  if (!meme) {
    return {};
  }

  const title = `${meme.title} - 상황 맞춤 밈 변형 생성기`;
  const description = `${meme.seo.summary}. ${meme.seo.keywords.slice(0, 2).join(", ")}를 바로 확인해 보세요.`;

  return {
    title,
    description,
    keywords: meme.seo.keywords,
    alternates: {
      canonical: absoluteUrl(meme.seo.canonicalPath)
    },
    openGraph: {
      title: `${title} | MemePop`,
      description,
      url: absoluteUrl(meme.seo.canonicalPath),
      images: [{ url: absoluteUrl(meme.seo.ogImage), width: 1200, height: 630 }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MemePop`,
      description,
      images: [absoluteUrl(meme.seo.ogImage)]
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function MemePage({ params }: MemePageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const meme = getMemeBySlug(slug);
  if (!meme) {
    notFound();
  }

  return (
    <MemeDetailContent
      meme={meme}
      form={<MemeGenerateForm slug={meme.slug} actionRightSlot={<MemeLikeButton slug={meme.slug} />} />}
    />
  );
}
