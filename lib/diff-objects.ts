import type { Prisma } from "@/app/generated/prisma/client";

function normalizeValue(value: Prisma.InputJsonValue) {
  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (value === null) {
    return "null";
  }
  return value;
}
export default function diffObjects<
  T extends Record<string, Prisma.InputJsonValue>,
>(oldObj: T, newObj: Partial<T>) {
  const diff: Record<
    string,
    { old: Prisma.InputJsonValue; new: undefined | Prisma.InputJsonValue }
  > = {};

  for (const key of Object.keys(newObj)) {
    if (oldObj[key] !== newObj[key]) {
      diff[key] = {
        old: normalizeValue(oldObj[key]),
        new: normalizeValue(newObj[key] as Prisma.InputJsonValue),
      };
    }
  }

  return diff;
}
