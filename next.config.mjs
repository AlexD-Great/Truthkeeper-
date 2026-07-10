/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep heavy Node-only SDKs out of the bundler so they run correctly in
  // Vercel's serverless runtime (Synapse's crypto).
  serverExternalPackages: ["@filoz/synapse-sdk"],
}

export default nextConfig
