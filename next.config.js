/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['mhmdhidr-uploads.s3.amazonaws.com', 'source.unsplash.com']
  }
}

export default nextConfig
