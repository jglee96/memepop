import type { Meme } from "@/entities/meme";

export function selectFeaturedMemeSlug(memes: ReadonlyArray<Meme>, likeCounts: Readonly<Record<string, number>>): string {
  if (memes.length === 0) {
    return "eotteokharago";
  }

  let selected = memes[0];
  let selectedCount = likeCounts[selected.slug] ?? 0;

  for (const meme of memes.slice(1)) {
    const count = likeCounts[meme.slug] ?? 0;
    if (count > selectedCount) {
      selected = meme;
      selectedCount = count;
      continue;
    }

    if (count === selectedCount) {
      const isNewer =
        meme.addedAt > selected.addedAt || (meme.addedAt === selected.addedAt && meme.addedOrder > selected.addedOrder);
      if (isNewer) {
        selected = meme;
      }
    }
  }

  return selected.slug;
}
