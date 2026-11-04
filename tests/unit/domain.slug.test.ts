import { describe, it, expect } from "vitest";
import { slugify, uniqueSlug } from "@/lib/domain/slug";

describe("slugify", () => {
  it("한글 제목", () => {
    expect(slugify("성수동 32평 아파트 인테리어")).toBe("성수동-32평-아파트-인테리어");
  });
  it("라틴 악센트 유지, 소문자, 연속 특수문자 정리", () => {
    expect(slugify("Café  Teum!!")).toBe("café-teum");
  });
  it("NFD 입력도 NFC로 정규화", () => {
    expect(slugify("Café")).toBe("café");
  });
  it("특수문자만 있으면 project", () => {
    expect(slugify("!!!")).toBe("project");
    expect(slugify("")).toBe("project");
  });
});

describe("uniqueSlug", () => {
  it("충돌 없으면 그대로", () => expect(uniqueSlug("a", ["b"])).toBe("a"));
  it("충돌 시 -2, -3", () => {
    expect(uniqueSlug("a", ["a"])).toBe("a-2");
    expect(uniqueSlug("a", ["a", "a-2"])).toBe("a-3");
  });
});
