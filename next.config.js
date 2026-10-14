/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' }, // Supabase storage
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }, // GitHub avatars
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google avatars
      { protocol: 'https', hostname: 'placehold.jp' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
