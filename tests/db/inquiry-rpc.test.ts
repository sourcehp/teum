import { afterAll, describe, expect, it } from "vitest";
import { anonClient, RPC_SECRET, sql } from "./helpers";

const createdIds: string[] = [];

function step1Args(overrides: Record<string, unknown> = {}) {
  return {
    p_secret: RPC_SECRET,
    p_name: "홍길동",
    p_phone: "010-1234-5678",
    p_space_type: "residential",
    p_ip_hash: `rpc-${crypto.randomUUID()}`,
    p_token_hash: `token-${crypto.randomUUID()}`,
    p_utm_source: "naver",
    p_utm_medium: "cpc",
    p_utm_campaign: "fall",
    p_referrer: "https://search.naver.com/",
    p_landing_path: "/contact",
    ...overrides,
  };
}

function step2Args(id: string, tokenHash: string, overrides: Record<string, unknown> = {}) {
  return {
    p_secret: RPC_SECRET,
    p_id: id,
    p_token_hash: tokenHash,
    p_email: "hong@example.com",
    p_region: "서울 성동구",
    p_area_pyeong: 32,
    p_budget_range: "50m_100m",
    p_desired_start: "2027년 1월",
    p_message: "주방 위주로 상담 원합니다.",
    ...overrides,
  };
}

async function step1(overrides: Record<string, unknown> = {}) {
  const args = step1Args(overrides);
  const result = await anonClient().rpc("submit_inquiry_step1", args);
  const rows = (result.data ?? []) as { id: string; notify_email: string | null }[];
  createdIds.push(...rows.map((r) => r.id));
  return { ...result, rows, args };
}

afterAll(async () => {
  if (createdIds.length) await sql(`delete from public.inquiries where id = any($1::uuid[])`, [createdIds]);
});

describe("submit_inquiry_step1", () => {
  it("step1 with wrong secret throws forbidden", async () => {
    const { error, rows } = await step1({ p_secret: "wrong-secret" });
    expect(error?.message).toBe("forbidden");
    expect(rows).toHaveLength(0);
  });

  it("step1 with null secret throws forbidden", async () => {
    const { error } = await step1({ p_secret: null });
    expect(error?.message).toBe("forbidden");
  });

  it("step1 returns one row with id and notify_email, and stored row has status new, notify_status pending", async () => {
    const { error, rows, args } = await step1();
    expect(error).toBeNull();
    expect(rows).toHaveLength(1);
    const [settings] = await sql<{ notify_email: string | null }>(
      `select notify_email from public.site_settings where id = 1`,
    );
    expect(rows[0]).toEqual({ id: expect.any(String), notify_email: settings.notify_email });

    const [stored] = await sql(
      `select name, phone, space_type, status, notify_status, ip_hash, detail_token_hash, utm_source, landing_path,
              privacy_agreed_at is not null as agreed,
              detail_token_expires_at between now() + interval '23 hours 59 minutes' and now() + interval '24 hours' as expires_in_24h
       from public.inquiries where id = $1`,
      [rows[0].id],
    );
    expect(stored).toEqual({
      name: "홍길동",
      phone: "010-1234-5678",
      space_type: "residential",
      status: "new",
      notify_status: "pending",
      ip_hash: args.p_ip_hash,
      detail_token_hash: args.p_token_hash,
      utm_source: "naver",
      landing_path: "/contact",
      agreed: true,
      expires_in_24h: true,
    });
  });

  it("6th step1 from same ip_hash within 10 minutes throws rate_limited", async () => {
    const ipHash = `rate-${crypto.randomUUID()}`;
    for (let i = 0; i < 5; i++) {
      const { error } = await step1({ p_ip_hash: ipHash });
      expect(error).toBeNull();
    }
    const sixth = await step1({ p_ip_hash: ipHash });
    expect(sixth.error?.message).toBe("rate_limited");
    const [{ count }] = await sql<{ count: number }>(
      `select count(*)::int as count from public.inquiries where ip_hash = $1`,
      [ipHash],
    );
    expect(count).toBe(5);
  });

  it("step1 counts only the last 10 minutes for rate limiting", async () => {
    const ipHash = `rate-old-${crypto.randomUUID()}`;
    for (let i = 0; i < 5; i++) await step1({ p_ip_hash: ipHash });
    await sql(
      `update public.inquiries set created_at = now() - interval '11 minutes' where ip_hash = $1`,
      [ipHash],
    );
    const { error } = await step1({ p_ip_hash: ipHash });
    expect(error).toBeNull();
  });
});

describe("submit_inquiry_step2", () => {
  it("step2 with correct token updates details and returns true", async () => {
    const { rows, args } = await step1();
    const { data, error } = await anonClient().rpc("submit_inquiry_step2", step2Args(rows[0].id, args.p_token_hash));
    expect(error).toBeNull();
    expect(data).toBe(true);

    const [stored] = await sql(
      `select email, region, area_pyeong::float8 as area_pyeong, budget_range, desired_start, message, detail_token_hash
       from public.inquiries where id = $1`,
      [rows[0].id],
    );
    expect(stored).toEqual({
      email: "hong@example.com",
      region: "서울 성동구",
      area_pyeong: 32,
      budget_range: "50m_100m",
      desired_start: "2027년 1월",
      message: "주방 위주로 상담 원합니다.",
      detail_token_hash: null,
    });
  });

  it("step2 reusing same token returns false", async () => {
    const { rows, args } = await step1();
    const first = await anonClient().rpc("submit_inquiry_step2", step2Args(rows[0].id, args.p_token_hash));
    expect(first.data).toBe(true);
    const second = await anonClient().rpc(
      "submit_inquiry_step2",
      step2Args(rows[0].id, args.p_token_hash, { p_message: "덮어쓰기 시도" }),
    );
    expect(second.error).toBeNull();
    expect(second.data).toBe(false);
    const [stored] = await sql(`select message from public.inquiries where id = $1`, [rows[0].id]);
    expect(stored.message).toBe("주방 위주로 상담 원합니다.");
  });

  it("step2 with wrong token returns false", async () => {
    const { rows } = await step1();
    const { data } = await anonClient().rpc("submit_inquiry_step2", step2Args(rows[0].id, "wrong-token-hash"));
    expect(data).toBe(false);
  });

  it("step2 after expiry returns false", async () => {
    const { rows, args } = await step1();
    await sql(
      `update public.inquiries set detail_token_expires_at = now() - interval '1 minute' where id = $1`,
      [rows[0].id],
    );
    const { data, error } = await anonClient().rpc("submit_inquiry_step2", step2Args(rows[0].id, args.p_token_hash));
    expect(error).toBeNull();
    expect(data).toBe(false);
    const [stored] = await sql(`select email from public.inquiries where id = $1`, [rows[0].id]);
    expect(stored.email).toBeNull();
  });

  it("step2 with wrong secret throws forbidden", async () => {
    const { rows, args } = await step1();
    const { error } = await anonClient().rpc(
      "submit_inquiry_step2",
      step2Args(rows[0].id, args.p_token_hash, { p_secret: "wrong-secret" }),
    );
    expect(error?.message).toBe("forbidden");
  });
});

describe("set_inquiry_notify_status", () => {
  it("updates notify_status with the correct secret", async () => {
    const { rows } = await step1();
    const { error } = await anonClient().rpc("set_inquiry_notify_status", {
      p_secret: RPC_SECRET,
      p_id: rows[0].id,
      p_status: "sent",
    });
    expect(error).toBeNull();
    const [stored] = await sql(`select notify_status from public.inquiries where id = $1`, [rows[0].id]);
    expect(stored.notify_status).toBe("sent");
  });

  it("throws forbidden with a wrong secret", async () => {
    const { rows } = await step1();
    const { error } = await anonClient().rpc("set_inquiry_notify_status", {
      p_secret: "wrong-secret",
      p_id: rows[0].id,
      p_status: "sent",
    });
    expect(error?.message).toBe("forbidden");
    const [stored] = await sql(`select notify_status from public.inquiries where id = $1`, [rows[0].id]);
    expect(stored.notify_status).toBe("pending");
  });
});
