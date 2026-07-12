/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  images: {
    // En desarrollo, desactivamos la optimización para evitar problemas con el proxy de Next.js y localhost.
    // Esto hace que las imágenes se carguen directamente desde la URL del backend.
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: '[::1]',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'gp-backend-test.loca.lt',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: '79.143.191.165',
        port: '8080',
        pathname: '/storage/**',
      }
    ],
  },
  allowedDevOrigins: [
    '192.168.0.105',
    'localhost:3000',
  ],
};

export default nextConfig;
