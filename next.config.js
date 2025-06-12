/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'flybjlchqkqochkvhyca.supabase.co', // Your Supabase storage domain
      'avatars.githubusercontent.com', // For GitHub avatars
      'lh3.googleusercontent.com', // For Google avatars
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Only if you also have TypeScript errors
  },
};

module.exports = nextConfig;
