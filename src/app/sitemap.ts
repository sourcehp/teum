import type { MetadataRoute } from "next";
import { listPublishedProjectSlugs } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const STATIC_PATHS = ["/", "/projects", "/about", "/process", "/contact", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await listPublishedProjectSlugs();
  return [
    ...STATIC_PATHS.map((p) => ({ url: absoluteUrl(p) })),
    ...projects.map((p) => ({
      url: absoluteUrl(`/projects/${encodeURIComponent(p.slug)}`),
      lastModified: new Date(p.updated_at),
    })),
  ];
}
