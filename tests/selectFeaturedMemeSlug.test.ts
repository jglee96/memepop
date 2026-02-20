import { describe, expect, it } from "vitest";

import { getAllMemes } from "@/entities/meme";
import { selectFeaturedMemeSlug } from "@/shared/lib/selectFeaturedMemeSlug";

describe("selectFeaturedMemeSlug", () => {
  it("chooses meme with the highest like count", () => {
    const memes = getAllMemes();
    const likeCounts = {
      "yeogiseo-kkeuchi-anida": 3,
      "appa-do-ije-hangyeda": 8,
      eotteokharago: 5
    };

    const selected = selectFeaturedMemeSlug(memes, likeCounts);

    expect(selected).toBe("appa-do-ije-hangyeda");
  });

  it("breaks ties by latest added meme", () => {
    const memes = getAllMemes();
    const likeCounts = {
      "yeogiseo-kkeuchi-anida": 10,
      "appa-do-ije-hangyeda": 10,
      eotteokharago: 1
    };

    const selected = selectFeaturedMemeSlug(memes, likeCounts);

    expect(selected).toBe("yeogiseo-kkeuchi-anida");
  });
});
