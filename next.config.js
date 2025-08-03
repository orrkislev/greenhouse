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
    ],
  },
};

module.exports = nextConfig;
