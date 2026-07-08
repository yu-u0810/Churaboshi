/** @type {import('next').NextConfig} */
const nextConfig = {
  // 一旦、警告が出ている eslint セクションを削除するか
  // 正しい形式（あるいは何もしない）にする
  typescript: {
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;