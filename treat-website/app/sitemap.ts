import type { MetadataRoute } from "next";
import { posts } from "./blog/posts";

const BASE = "https://treat.security";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE,                         lastModified: new Date(), changeFrequency: "weekly",  priority: 1 },
    { url: `${BASE}/product`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/how-it-works`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/integrations`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/pricing`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/company`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/security`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/changelog`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5 },
    { url: `${BASE}/demo`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...blogPosts,
  ];
}
