import { describe, it, expect } from "vitest";
import { escapeCsvFormula, toCsv } from "@/lib/domain/csv";

describe("toCsv", () => {
  it("BOM, CRLF, 이스케이프", () => {
    expect(toCsv(["a", "b"], [["x,y", 'he said "hi"'], ["line\nbreak", null]]))
      .toBe('\ufeffa,b\r\n"x,y","he said ""hi"""\r\n"line\nbreak",\r\n');
  });
  it("숫자와 빈 행", () => {
    expect(toCsv(["n"], [[1], [0]])).toBe("\ufeffn\r\n1\r\n0\r\n");
    expect(toCsv(["n"], [])).toBe("\ufeffn\r\n");
  });
});

describe("escapeCsvFormula", () => {
  it.each(["=1+1", "+82", "-1", "@SUM(A1)", "\tx", "\rx"])("수식 시작 문자 %j 앞에 '를 붙인다", (v) => {
    expect(escapeCsvFormula(v)).toBe("'" + v);
  });
  it.each(["홍길동", "a=b", "", " =x"])("그 외는 그대로 둔다 %j", (v) => {
    expect(escapeCsvFormula(v)).toBe(v);
  });
});
