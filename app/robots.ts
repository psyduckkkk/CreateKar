import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/settings"],
      },
    ],
    sitemap: "https://createkar.com/sitemap.xml",
  };
}
