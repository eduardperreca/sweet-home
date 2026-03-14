/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const nextConfig = {
  // Allow images from Flask backend (localhost in dev, production URL in prod)
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5001" },
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(process.env.NEXT_PUBLIC_API_URL
        ? [
            {
              protocol: "https",
              hostname: new URL(process.env.NEXT_PUBLIC_API_URL).hostname,
            },
          ]
        : []),
    ],
  },
  // Proxy /api and /uploads calls to Flask backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
