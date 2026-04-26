import type { NextConfig } from "next";
import { withPostHogConfig } from "@posthog/nextjs-config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "cdn-nozomi.akamai.crunchyroll.com",
      },
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
    ],
  },
};

export default withPostHogConfig(nextConfig, {
  personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY || '<ph_personal_api_key>', // Your personal API key from PostHog settings
  envId: '397809', // Your environment ID (project ID)
  host: 'https://us.i.posthog.com', // Optional: Your PostHog instance URL, defaults to https://us.posthog.com
  sourcemaps: { // Optional
    enabled: true, // Optional: Enable sourcemaps generation and upload, defaults to true on production builds
    project: "cinewatch", // Optional: Project name, defaults to git repository name
    version: "1.0.0", // Optional: Release version, defaults to current git commit
    deleteAfterUpload: true, // Optional: Delete sourcemaps after upload, defaults to true
  },
});
