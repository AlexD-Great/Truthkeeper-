/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep heavy Node-only SDKs out of the bundler so they run correctly in
  // Vercel's serverless runtime (firebase-admin's gRPC / Synapse's crypto).
  serverExternalPackages: ["firebase-admin", "@filoz/synapse-sdk"],
}

export default nextConfig
