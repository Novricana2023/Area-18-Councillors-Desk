import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/issues",
    "/issues/new",
    "/feed",
    "/magazine",
    "/transparency",
    "/notifications",
    "/profile",
    "/citizen/login",
    "/citizen/register",
    "/councillor/login",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
