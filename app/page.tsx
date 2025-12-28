import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { MainPage } from "./components";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
  });

  if (memberships.length === 0) {
    redirect("/onboarding");
  }
  return <MainPage />;
}
