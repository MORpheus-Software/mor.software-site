/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/contractstaking',
                destination: '/staking',
                permanent: true, // or false depending on whether this is a permanent redirect
            },
        ]
    },
}

module.exports = nextConfig
