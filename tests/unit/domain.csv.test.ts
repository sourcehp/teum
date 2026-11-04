import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/domain/csv";

describe("toCsv", () => {
  it("BOM, CRLF, 이스케이프", () => {
    expect(toCsv(["a", "b"], [["x,y", 'he said "hi"'], ["line\nbreak", null]]))
      .toBe('﻿a,b\r\n"x,y","he said ""hi"""\r\n"line\nbreak",\r\n');
  });
  it("숫자와 빈 행", () => {
    expect(toCsv(["n"], [[1], [0]])).toBe("﻿n\r\n1\r\n0\r\n");
    expect(toCsv(["n"], [])).toBe("﻿n\r\n");
  });
});
