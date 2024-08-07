/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
                port: '',
                pathname: '/**'
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '30mb'
        },
    },
    output: "standalone",
};

export default nextConfig;
