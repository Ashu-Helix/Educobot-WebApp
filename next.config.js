/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        URL: "http://localhost:3000/api",
        PATH_URL: "https://api.educobot.com",
        SERVER_URL: "https://app.educobot.com",
        Dashboard_URl: "http://3.110.238.1:3001/dashboard/app/"
    },
    // URL: 'http://192.168.1.33:3000/api',

    fs: "empty", // This is required
};

module.exports = nextConfig;