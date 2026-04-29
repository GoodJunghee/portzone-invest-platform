/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 빌드 시점에 페이지를 prerender 하지 않도록 모든 페이지를 동적으로 처리.
  // DB(Prisma)를 사용하는 페이지가 많아 정적 생성이 부적절함.
  experimental: {
    // App Router에선 페이지마다 export const dynamic = "force-dynamic" 사용 권장
  },
};

export default nextConfig;
