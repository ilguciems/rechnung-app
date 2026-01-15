export enum GlobalRole {
  superadmin = "superadmin",
  admin = "admin",
  user = "user",
}

export type GlobalValidRole = (typeof GlobalRole)[keyof typeof GlobalRole];

export const GLOBAL_ADMIN_ROLES: readonly GlobalValidRole[] = [
  GlobalRole.superadmin,
  GlobalRole.admin,
] as const;

export const GLOBAL_USER_ROLES: readonly GlobalValidRole[] = [
  GlobalRole.user,
] as const;

export const GLOBAL_PROTECTED_ROLES: readonly GlobalValidRole[] = [
  GlobalRole.superadmin,
] as const;
