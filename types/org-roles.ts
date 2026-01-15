export enum OrgRole {
  admin = "admin",
  member = "member",
}

export type OrgValidRole = (typeof OrgRole)[keyof typeof OrgRole];

export const ORG_ADMIN_ROLES: readonly OrgValidRole[] = [
  OrgRole.admin,
] as const;

export const ORG_USER_ROLES: readonly OrgValidRole[] = [
  OrgRole.member,
] as const;

export const ORG_PROTECTED_ROLES: readonly OrgValidRole[] = [
  OrgRole.admin,
] as const;
