/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/contractstaking',
        destination: '/staking',
        permanent: true, // or false depending on whether this is a permanent redirect
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/(.*)', // Adjust to match your API routes
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Replace with your frontend URL
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
