// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const step1 = vi.fn();
const step2 = vi.fn();
vi.mock("@/lib/inquiry/actions", () => ({
  submitInquiryStep1: (...a: unknown[]) => step1(...a),
  submitInquiryStep2: (...a: unknown[]) => step2(...a),
}));

import { InquiryFlow } from "@/components/site/inquiry/InquiryFlow";

async function fill() {
  await userEvent.type(screen.getByLabelText("이름"), "홍길동");
  await userEvent.type(screen.getByLabelText("연락처"), "010-1234-5678");
  await userEvent.selectOptions(screen.getByLabelText("공간 유형"), "residential");
  await userEvent.click(screen.getByLabelText(/개인정보 수집·이용 동의/));
}

beforeEach(() => {
  step1.mockReset();
  step2.mockReset();
});
afterEach(cleanup);

describe("InquiryFlow", () => {
  it("성공하면 완료 문구와 2단계 폼을 보여준다", async () => {
    step1.mockResolvedValue({ status: "success", inquiryId: "id1", token: "tok" });
    render(<InquiryFlow variant="quick" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "무료 상담 신청" }));
    expect(await screen.findByText("접수되었습니다. 영업일 기준 1일 안에 연락드립니다.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "건너뛰기" })).toBeTruthy();
    expect(screen.getByLabelText("지역")).toBeTruthy();
  });

  it("전송 중에는 버튼이 비활성이고 '접수 중…'을 보인다", async () => {
    let release!: (v: unknown) => void;
    step1.mockReturnValue(new Promise((r) => (release = r)));
    render(<InquiryFlow variant="quick" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "무료 상담 신청" }));
    const pending = await screen.findByRole("button", { name: "접수 중…" });
    expect((pending as HTMLButtonElement).disabled).toBe(true);
    release({ status: "error", message: "끝" });
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("끝"));
  });

  it("오류면 role=alert에 메시지를 보이고 값을 다시 채운다", async () => {
    step1.mockResolvedValue({
      status: "error",
      message: "입력 내용을 확인해 주세요",
      fieldErrors: { phone: "연락처 형식을 확인해 주세요" },
      values: { name: "홍길동", phone: "123", space_type: "residential", privacy: "on" },
    });
    render(<InquiryFlow variant="quick" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "무료 상담 신청" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("입력 내용을 확인해 주세요");
    expect(screen.getByText("연락처 형식을 확인해 주세요")).toBeTruthy();
    expect((screen.getByLabelText("연락처") as HTMLInputElement).value).toBe("123");
    expect((screen.getByLabelText(/개인정보 수집·이용 동의/) as HTMLInputElement).checked).toBe(true);
  });
});

describe("Step2Form", () => {
  it("오류가 나도 입력한 내용이 지워지지 않는다", async () => {
    step1.mockResolvedValue({ status: "success", inquiryId: "id1", token: "tok" });
    step2.mockResolvedValue({ status: "error", message: "입력 내용을 확인해 주세요", fieldErrors: { email: "이메일 형식을 확인해 주세요" } });
    render(<InquiryFlow variant="quick" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "무료 상담 신청" }));
    await screen.findByLabelText("지역");
    await userEvent.type(screen.getByLabelText("문의 내용"), "거실 확장 상담");
    await userEvent.type(screen.getByLabelText("지역"), "서울 성동구");
    await userEvent.click(screen.getByRole("button", { name: "추가 정보 보내기" }));
    expect(await screen.findByText("이메일 형식을 확인해 주세요")).toBeTruthy();
    expect((screen.getByLabelText("문의 내용") as HTMLTextAreaElement).value).toBe("거실 확장 상담");
    expect((screen.getByLabelText("지역") as HTMLInputElement).value).toBe("서울 성동구");
  });
});
