import { afterAll, describe, expect, it } from "vitest";
import { sql } from "./helpers";

const projectIds: string[] = [];

afterAll(async () => {
  if (projectIds.length) await sql(`delete from public.projects where id = any($1::uuid[])`, [projectIds]);
});

describe("projects and project_images", () => {
  it("deleting cover image sets projects.cover_image_id to null", async () => {
    const [project] = await sql<{ id: string }>(
      `insert into public.projects (slug, title, category, area_pyeong)
       values ($1, '스키마 테스트', 'office', 20) returning id`,
      [`schema-${crypto.randomUUID()}`],
    );
    projectIds.push(project.id);
    const [cover, before, after] = await sql<{ id: string }>(
      `insert into public.project_images (project_id, storage_path, width, height, sort_order)
       select $1::uuid, 'projects/' || $1::text || '/' || n || '.webp', 100, 100, n from generate_series(1, 3) n
       returning id`,
      [project.id],
    );
    await sql(
      `update public.projects set cover_image_id = $2, before_image_id = $3, after_image_id = $4 where id = $1`,
      [project.id, cover.id, before.id, after.id],
    );

    await sql(`delete from public.project_images where id = $1`, [cover.id]);

    const [row] = await sql(
      `select cover_image_id, before_image_id, after_image_id from public.projects where id = $1`,
      [project.id],
    );
    expect(row).toEqual({ cover_image_id: null, before_image_id: before.id, after_image_id: after.id });
  });

  it("project can be inserted without area_pyeong", async () => {
    const [project] = await sql<{ id: string; area_pyeong: string | null }>(
      `insert into public.projects (slug, title, category)
       values ($1, '면적 없는 사례', 'commercial') returning id, area_pyeong`,
      [`schema-${crypto.randomUUID()}`],
    );
    projectIds.push(project.id);
    expect(project.area_pyeong).toBeNull();
  });

  it("deleting a project deletes its images", async () => {
    const [project] = await sql<{ id: string }>(
      `insert into public.projects (slug, title, category, area_pyeong)
       values ($1, '스키마 테스트', 'office', 20) returning id`,
      [`schema-${crypto.randomUUID()}`],
    );
    await sql(
      `insert into public.project_images (project_id, storage_path, width, height) values ($1, 'x.webp', 1, 1)`,
      [project.id],
    );
    await sql(`delete from public.projects where id = $1`, [project.id]);
    expect(await sql(`select 1 from public.project_images where project_id = $1`, [project.id])).toHaveLength(0);
  });

  it("updated_at is refreshed on update", async () => {
    const [project] = await sql<{ id: string }>(
      `insert into public.projects (slug, title, category, area_pyeong, updated_at)
       values ($1, '스키마 테스트', 'office', 20, now() - interval '1 day') returning id`,
      [`schema-${crypto.randomUUID()}`],
    );
    projectIds.push(project.id);
    await sql(`update public.projects set title = '수정됨' where id = $1`, [project.id]);
    const [row] = await sql<{ fresh: boolean }>(
      `select updated_at > now() - interval '1 minute' as fresh from public.projects where id = $1`,
      [project.id],
    );
    expect(row.fresh).toBe(true);
  });
});

describe("site_settings", () => {
  it("site_settings rejects second row", async () => {
    await expect(sql(`insert into public.site_settings (id) values (2)`)).rejects.toThrow(/check/);
    await expect(sql(`insert into public.site_settings default values`)).rejects.toThrow(/duplicate key/);
  });
});
