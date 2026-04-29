import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

// Proxy로 감싸서 빌드 시점에 PrismaClient를 인스턴스화하지 않도록 한다.
// 실제 메서드 호출(prisma.user.findMany 등) 시점에 인스턴스가 생성됨.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop as string];
    return typeof value === "function" ? (value as Function).bind(client) : value;
  },
});
