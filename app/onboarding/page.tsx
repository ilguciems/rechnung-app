import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "user") {
    redirect("/admin");
  }

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
  });

  if (memberships.length > 0) {
    redirect("/");
  }

  return (
    <div className="max-w-xl mx-auto py-20 text-center space-y-6">
      <h1 className="text-3xl font-bold">Hallo {session.user.name} 👋</h1>

      <p className="text-muted-foreground">
        Willkommen! Du bist fast startklar.
      </p>

      <div className="space-y-4">
        <Link
          href="/"
          className="block w-full rounded-md bg-black text-white py-3"
        >
          Eigene Firma erstellen
        </Link>

        <p className="text-sm text-muted-foreground">Oder:</p>

        <p className="text-sm">
          Warte auf eine Einladung von einem Administrator, um einer bestehenden
          Firma beizutreten.
        </p>
      </div>
    </div>
  );
}
