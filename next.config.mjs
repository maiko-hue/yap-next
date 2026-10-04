/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/inicio.html',
        destination: '/inicio',
        permanent: true,
      },
      {
        source: '/login_pin.html',
        destination: '/login_pin',
        permanent: true,
      },
      {
        source: '/opciones.html',
        destination: '/opciones',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
