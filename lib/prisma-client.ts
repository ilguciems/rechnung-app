import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error", "warn"], // can be ["error", "info", "query", "warn"]
  }).$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          if (args.where) {
            const makeInsensitive = (obj: Record<string, unknown>) => {
              for (const key in obj) {
                const value = obj[key];

                if (
                  value &&
                  typeof value === "object" &&
                  !Array.isArray(value)
                ) {
                  const filterObj = value as Record<string, unknown>;

                  if (
                    filterObj.contains ||
                    filterObj.startsWith ||
                    filterObj.endsWith
                  ) {
                    filterObj.mode = "insensitive";
                  } else {
                    makeInsensitive(filterObj);
                  }
                } else if (Array.isArray(value)) {
                  value.forEach((item) => {
                    if (item && typeof item === "object") {
                      makeInsensitive(item as Record<string, unknown>);
                    }
                  });
                }
              }
            };
            makeInsensitive(args.where);
          }
          return query(args);
        },
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
