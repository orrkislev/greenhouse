const nextConfig = {
  reactStrictMode: false,
  experimental: {
    webpackMemoryOptimizations: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'qwqwwhigrvukwtyziejg.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
