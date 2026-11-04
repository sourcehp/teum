"use client";

import { useCallback, useState } from "react";
import { track } from "@/lib/analytics";
import { Step1Form } from "./Step1Form";
import { Step2Form } from "./Step2Form";

type Phase =
  | { kind: "step1" }
  | { kind: "step2"; inquiryId: string; token: string }
  | { kind: "done"; saved: boolean };

export function InquiryFlow({ variant, initialMessage }: { variant: "quick" | "full"; initialMessage?: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: "step1" });
  const [accepted, setAccepted] = useState(false);

  const onStep1 = useCallback((s: { inquiryId: string; token: string }) => {
    track("generate_lead");
    setAccepted(true);
    // 허니팟에 걸린 응답은 토큰이 비어 있어 2단계 없이 완료로 보낸다.
    setPhase(s.token ? { kind: "step2", inquiryId: s.inquiryId, token: s.token } : { kind: "done", saved: false });
  }, []);

  const onStep2 = useCallback((kind: "saved" | "skipped") => setPhase({ kind: "done", saved: kind === "saved" }), []);

  return (
    <div>
      {variant === "full" && phase.kind === "step1" ? (
        <p className="mb-8 text-sm leading-relaxed text-muted">
          이름과 연락처만 남겨 주셔도 충분합니다. 접수 후 원하시면 공간 정보를 더 알려 주실 수 있습니다.
        </p>
      ) : null}

      {phase.kind === "step1" ? <Step1Form onSuccess={onStep1} /> : null}

      {accepted ? (
        <div className="border-l-2 border-accent pl-5" aria-live="polite">
          <p className="text-lg font-medium">접수되었습니다. 영업일 기준 1일 안에 연락드립니다.</p>
          {phase.kind === "done" && phase.saved ? <p className="mt-2 text-muted">추가 정보가 접수되었습니다.</p> : null}
        </div>
      ) : null}

      {phase.kind === "step2" ? (
        <div className="mt-10 border-t border-line pt-8">
          <h3 className="text-base font-medium">더 알려 주실 내용이 있나요? (선택)</h3>
          <p className="mb-6 mt-1 text-sm text-muted">공간 정보를 남겨 주시면 상담이 더 빨라집니다.</p>
          <Step2Form inquiryId={phase.inquiryId} token={phase.token} initialMessage={initialMessage} onDone={onStep2} />
        </div>
      ) : null}
    </div>
  );
}
