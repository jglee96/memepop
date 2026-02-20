import { appaDoIjeHangyedaSlice } from "./appa-do-ije-hangyeda";
import { defaultMemeSlice } from "./default";
import { eotteokharagoSlice } from "./eotteokharago";
import { yeogiseoKkeuchiAnidaSlice } from "./yeogiseo-kkeuchi-anida";
import type { MemeGenerationSlice } from "./types";

const slices: ReadonlyArray<MemeGenerationSlice> = [eotteokharagoSlice, appaDoIjeHangyedaSlice, yeogiseoKkeuchiAnidaSlice];

const sliceMap = new Map(slices.map((slice) => [slice.slug, slice]));

export function resolveMemeGenerationSlice(slug: string): MemeGenerationSlice {
  return sliceMap.get(slug) ?? defaultMemeSlice;
}
