/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.jp'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Only if you also have TypeScript errors
  },
};

export default nextConfig;
