import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminClient, anonClient, insertInquiry, signedInClient, sql } from "./helpers";

const run = crypto.randomUUID().slice(0, 8);
const inquiryIds: string[] = [];
const projectIds: string[] = [];

async function insertProject(slug: string, isPublished: boolean): Promise<string> {
  const [row] = await sql<{ id: string }>(
    `insert into public.projects (slug, title, category, area_pyeong, is_published)
     values ($1, '테스트 사례', 'residential', 32, $2)
     returning id`,
    [slug, isPublished],
  );
  projectIds.push(row.id);
  return row.id;
}

afterAll(async () => {
  if (inquiryIds.length) await sql(`delete from public.inquiries where id = any($1::uuid[])`, [inquiryIds]);
  if (projectIds.length) await sql(`delete from public.projects where id = any($1::uuid[])`, [projectIds]);
});

describe("inquiries", () => {
  let inquiryId: string;

  beforeAll(async () => {
    inquiryId = await insertInquiry();
    inquiryIds.push(inquiryId);
  });

  it("anon cannot select inquiries", async () => {
    const { data, error } = await anonClient().from("inquiries").select("*");
    expect(error !== null || data?.length === 0).toBe(true);
  });

  it("anon cannot update inquiries", async () => {
    const { data, error } = await anonClient()
      .from("inquiries")
      .update({ status: "done", admin_memo: "hacked" })
      .eq("id", inquiryId)
      .select();
    expect(error !== null || data?.length === 0).toBe(true);
    const [row] = await sql<{ status: string; admin_memo: string | null }>(
      `select status, admin_memo from public.inquiries where id = $1`,
      [inquiryId],
    );
    expect(row).toEqual({ status: "new", admin_memo: null });
  });

  it("anon cannot delete inquiries", async () => {
    await anonClient().from("inquiries").delete().eq("id", inquiryId);
    const rows = await sql(`select 1 from public.inquiries where id = $1`, [inquiryId]);
    expect(rows).toHaveLength(1);
  });

  it("admin can select inquiries", async () => {
    const admin = await adminClient();
    const { data, error } = await admin.from("inquiries").select("id").eq("id", inquiryId);
    expect(error).toBeNull();
    expect(data).toEqual([{ id: inquiryId }]);
  });
});

describe("projects", () => {
  it("anon cannot see unpublished project", async () => {
    const hidden = `rls-hidden-${run}`;
    const shown = `rls-shown-${run}`;
    await insertProject(hidden, false);
    await insertProject(shown, true);
    const anon = anonClient();

    const hiddenResult = await anon.from("projects").select("slug").eq("slug", hidden);
    expect(hiddenResult.error).toBeNull();
    expect(hiddenResult.data).toEqual([]);

    const shownResult = await anon.from("projects").select("slug").eq("slug", shown);
    expect(shownResult.data).toEqual([{ slug: shown }]);
  });

  it("anon cannot see images of unpublished project", async () => {
    const projectId = await insertProject(`rls-img-${run}`, false);
    await sql(
      `insert into public.project_images (project_id, storage_path, width, height)
       values ($1, 'projects/x/hidden.webp', 10, 10)`,
      [projectId],
    );
    const { data } = await anonClient().from("project_images").select("id").eq("project_id", projectId);
    expect(data).toEqual([]);
  });

  describe("non-admin authenticated user", () => {
    const userId = crypto.randomUUID();
    const email = `rls-user-${run}@teum.local`;
    const password = "temp-user-password-1!";

    beforeAll(async () => {
      await sql(
        `insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
           raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
           confirmation_token, recovery_token, email_change_token_new, email_change)
         values ('00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated', $2,
           extensions.crypt($3, extensions.gen_salt('bf')), now(),
           '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')`,
        [userId, email, password],
      );
      await sql(
        `insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
         values ($1::text, $1::uuid, jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true),
           'email', now(), now(), now())`,
        [userId, email],
      );
    });

    afterAll(async () => {
      await sql(`delete from auth.users where id = $1`, [userId]);
    });

    it("non-admin authenticated user cannot write projects", async () => {
      const client = await signedInClient(email, password);
      const slug = `rls-intruder-${run}`;
      const { error } = await client
        .from("projects")
        .insert({ slug, title: "침입", category: "residential", area_pyeong: 10 });
      expect(error).not.toBeNull();
      expect(await sql(`select 1 from public.projects where slug = $1`, [slug])).toHaveLength(0);

      const { error: inquiryError, data } = await client.from("inquiries").select("id");
      expect(inquiryError !== null || data?.length === 0).toBe(true);
    });
  });
});

describe("site_settings", () => {
  it("anon cannot select site_settings", async () => {
    const { data, error } = await anonClient().from("site_settings").select("*");
    expect(error !== null || data?.length === 0).toBe(true);
  });

  it("anon can select public_site_settings without notify_email", async () => {
    const { data, error } = await anonClient().from("public_site_settings").select("*");
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0]).toHaveProperty("company_name");
    expect(data![0]).not.toHaveProperty("notify_email");
  });
});

describe("media storage", () => {
  const blob = () => new Blob([new Uint8Array([82, 73, 70, 70])], { type: "image/webp" });

  it("anon cannot upload to media", async () => {
    const { error } = await anonClient().storage.from("media").upload(`test/${run}-anon.webp`, blob());
    expect(error).not.toBeNull();
  });

  it("admin can upload to media", async () => {
    const admin = await adminClient();
    const path = `test/${run}-admin.webp`;
    const { error } = await admin.storage.from("media").upload(path, blob(), { contentType: "image/webp" });
    expect(error).toBeNull();
    const removed = await admin.storage.from("media").remove([path]);
    expect(removed.error).toBeNull();
    expect(removed.data).toHaveLength(1);
  });
});
