/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    future: {
      webpack5: true,
    },
    webpack: (config) => {
      config.resolve.fallback = { fs: false, net: false, tls: false };

      return config;
    },
    images: { unoptimized: true },
    experimental: {
      appDir: true,
      fontLoaders: [
        { loader: "@next/font/google", options: { subsets: ["latin"] } },
      ],
    },
}

module.exports = nextConfig
