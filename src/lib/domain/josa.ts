export type JosaPair = "은는" | "이가" | "을를" | "으로로";

const DIGIT_FINAL: Record<string, number> = {
  "0": 21, // 영 ㅇ
  "1": 8, // 일 ㄹ
  "2": 0, // 이
  "3": 16, // 삼 ㅁ
  "4": 0, // 사
  "5": 0, // 오
  "6": 1, // 육 ㄱ
  "7": 8, // 칠 ㄹ
  "8": 8, // 팔 ㄹ
  "9": 0, // 구
};

/** 마지막 글자의 받침 번호(0 = 받침 없음, 8 = ㄹ). */
function finalIndex(word: string): number {
  const ch = word.trim().slice(-1);
  if (ch === "") return 0;
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28;
  if (ch in DIGIT_FINAL) return DIGIT_FINAL[ch];
  const lower = ch.toLowerCase();
  if (lower === "l" || lower === "r") return 8;
  if (lower === "m" || lower === "n") return 16;
  return 0;
}

/** 단어 뒤에 받침에 맞는 조사를 붙여 돌려준다. 예: josa("주소", "은는") -> "주소는". */
export function josa(word: string, pair: JosaPair): string {
  const f = finalIndex(word);
  const has = f !== 0;
  switch (pair) {
    case "은는":
      return word + (has ? "은" : "는");
    case "이가":
      return word + (has ? "이" : "가");
    case "을를":
      return word + (has ? "을" : "를");
    case "으로로":
      return word + (has && f !== 8 ? "으로" : "로");
  }
}
