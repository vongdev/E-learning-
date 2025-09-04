/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [], // Thêm domain nếu bạn sử dụng URL bên ngoài
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig