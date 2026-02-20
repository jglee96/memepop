export interface Meme {
  slug: string;
  title: string;
  addedAt: string;
  addedOrder: number;
  description: string;
  useCases: string[];
  examples: string[];
  faq: { q: string; a: string }[];
  seo: {
    keywords: string[];
    ogImage: string;
    canonicalPath: string;
    summary: string;
  };
}
