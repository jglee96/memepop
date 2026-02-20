export interface Meme {
  slug: string;
  title: string;
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
