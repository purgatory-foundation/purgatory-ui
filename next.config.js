/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["tailwindui.com", "images.unsplash.com", "storage.googleapis.com", "cdn.rtfkt.com", "testnets.opensea.io", "i.seadn.io", "stakingcrypto.info"],
  },
}

module.exports = nextConfig
