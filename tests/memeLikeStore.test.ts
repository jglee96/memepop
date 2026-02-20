import { beforeEach, describe, expect, it } from "vitest";

import { consumeMemeLike, getMemeLikeCount, resetMemeLikeStoreForTest } from "@/shared/lib/memeLikeStore";

describe("memeLikeStore", () => {
  beforeEach(() => {
    resetMemeLikeStoreForTest();
  });

  it("allows first like and blocks second like from same ip in production within 24h", async () => {
    const first = await consumeMemeLike({
      slug: "eotteokharago",
      clientIp: "1.1.1.1",
      isDevelopment: false,
      now: 1000
    });
    const second = await consumeMemeLike({
      slug: "eotteokharago",
      clientIp: "1.1.1.1",
      isDevelopment: false,
      now: 2000
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    await expect(getMemeLikeCount("eotteokharago")).resolves.toBe(1);
  });

  it("allows like again after 24h window", async () => {
    const first = await consumeMemeLike({
      slug: "appa-do-ije-hangyeda",
      clientIp: "1.1.1.1",
      isDevelopment: false,
      now: 1000
    });
    const second = await consumeMemeLike({
      slug: "appa-do-ije-hangyeda",
      clientIp: "1.1.1.1",
      isDevelopment: false,
      now: 1000 + 24 * 60 * 60 * 1000 + 1
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    await expect(getMemeLikeCount("appa-do-ije-hangyeda")).resolves.toBe(2);
  });

  it("does not apply ip restriction in development", async () => {
    const first = await consumeMemeLike({
      slug: "yeogiseo-kkeuchi-anida",
      clientIp: "1.1.1.1",
      isDevelopment: true,
      now: 1000
    });
    const second = await consumeMemeLike({
      slug: "yeogiseo-kkeuchi-anida",
      clientIp: "1.1.1.1",
      isDevelopment: true,
      now: 2000
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    await expect(getMemeLikeCount("yeogiseo-kkeuchi-anida")).resolves.toBe(2);
  });
});
