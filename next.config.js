/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'mhmdhidr-uploads.s3.amazonaws.com',
      'source.unsplash.com',
      'lh3.googleusercontent.com'
    ]
  },
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar'
  }
}

module.exports = nextConfig
