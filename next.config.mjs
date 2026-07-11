/** @type {import('next').NextConfig} */
const nextConfig = {
  // node:sqlite is a built-in experimental module; keep it external on the server.
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
