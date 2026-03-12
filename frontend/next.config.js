/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from localhost (Flask uploads) and external sources
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5001" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Proxy /api calls to Flask in development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5001/uploads/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
