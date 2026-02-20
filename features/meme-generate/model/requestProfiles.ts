import { z } from "zod";

import { MAX_INPUT_LENGTH, WORD_COUNT_DEFAULT, WORD_COUNT_MAX, WORD_COUNT_MIN } from "@/shared/config";

const commonInputField = z
  .string()
  .min(1, "입력값이 비어 있습니다.")
  .max(MAX_INPUT_LENGTH, `입력은 최대 ${MAX_INPUT_LENGTH}자까지 허용됩니다.`);

const inputOnlySchema = z.object({
  input: commonInputField
});

const yeogiseoKkeuchiAnidaSchema = z.object({
  topic: commonInputField,
  wordCount: z
    .number()
    .int("단어 길이는 정수여야 합니다.")
    .min(WORD_COUNT_MIN, `단어 길이는 최소 ${WORD_COUNT_MIN}개입니다.`)
    .max(WORD_COUNT_MAX, `단어 길이는 최대 ${WORD_COUNT_MAX}개입니다.`)
    .optional()
});

export interface NormalizedGenerateRequest {
  userInput: string;
  generationOptions: {
    wordCount?: number;
  };
}

interface GenerateRequestProfile {
  slug: string;
  styleInstruction: string;
  requestSchema: z.ZodTypeAny;
  normalizeInput: (data: unknown) => NormalizedGenerateRequest;
}

const defaultProfile: GenerateRequestProfile = {
  slug: "__default__",
  styleInstruction: "사용자 문구를 밈 톤으로 자연스럽게 변형한다.",
  requestSchema: inputOnlySchema,
  normalizeInput(data: unknown): NormalizedGenerateRequest {
    const parsed = inputOnlySchema.parse(data);
    return {
      userInput: parsed.input,
      generationOptions: {}
    };
  }
};

const appaDoIjeHangyedaProfile: GenerateRequestProfile = {
  slug: "appa-do-ije-hangyeda",
  styleInstruction:
    "사용자 상황을 '오래 참은 사람이 장문으로 한탄하다 최후 통보하는' 구조로 변형한다. 핵심 흐름은 탓하지 마라 -> 충분히 기다려줬다 -> 희생 서사 -> 현실 지적 질문 -> 마지막 통보다.",
  requestSchema: inputOnlySchema,
  normalizeInput(data: unknown): NormalizedGenerateRequest {
    const parsed = inputOnlySchema.parse(data);
    return {
      userInput: parsed.input,
      generationOptions: {}
    };
  }
};

const eotteokharagoProfile: GenerateRequestProfile = {
  slug: "eotteokharago",
  styleInstruction: "사용자 문구의 발음 유사성을 유지하면서 자모를 흔들고 리듬을 비튼다.",
  requestSchema: inputOnlySchema,
  normalizeInput(data: unknown): NormalizedGenerateRequest {
    const parsed = inputOnlySchema.parse(data);
    return {
      userInput: parsed.input,
      generationOptions: {}
    };
  }
};

const yeogiseoKkeuchiAnidaProfile: GenerateRequestProfile = {
  slug: "yeogiseo-kkeuchi-anida",
  styleInstruction:
    "반드시 '여기서 끝이 아니다~~'로 시작하고 이후 본문은 공백 없이 연결한다. 주제를 기반으로 현실적 항목에서 엉뚱한 항목으로 점층 과장한다.",
  requestSchema: yeogiseoKkeuchiAnidaSchema,
  normalizeInput(data: unknown): NormalizedGenerateRequest {
    const parsed = yeogiseoKkeuchiAnidaSchema.parse(data);
    return {
      userInput: parsed.topic,
      generationOptions: {
        wordCount: parsed.wordCount ?? WORD_COUNT_DEFAULT
      }
    };
  }
};

const profiles: ReadonlyArray<GenerateRequestProfile> = [
  appaDoIjeHangyedaProfile,
  eotteokharagoProfile,
  yeogiseoKkeuchiAnidaProfile
];

const profileMap = new Map(profiles.map((profile) => [profile.slug, profile]));

export function resolveGenerateRequestProfile(slug: string): GenerateRequestProfile {
  return profileMap.get(slug) ?? defaultProfile;
}
