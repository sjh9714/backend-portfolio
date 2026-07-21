import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.siteUrl;
  return [
    { url: base, priority: 1 },
    { url: `${base}/resume`, priority: 0.8 },
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, priority: 0.9 })),
  ];
}
