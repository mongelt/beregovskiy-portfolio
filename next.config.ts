import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Required for BlockNote compatibility with Next.js 15/React 19
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for html2pdf.js/fflate - 'module' doesn't exist in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        module: false,
      };
    }

    return config;
  },
};

export default nextConfig;

