import type { NextConfig } from "next";

const legacyPlanningSegments = [
  "plan",
  "sessions",
  "series",
  "activities",
  "calendar",
  "facilitator",
  "recurring",
] as const;

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/care/activities",
        destination: "/care",
        permanent: false,
      },
      ...legacyPlanningSegments.flatMap((segment) => [
        {
          source: `/planning/${segment}`,
          destination: "/planning",
          permanent: false,
        },
        {
          source: `/planning/${segment}/:path*`,
          destination: "/planning",
          permanent: false,
        },
      ]),
    ];
  },
};

export default nextConfig;
