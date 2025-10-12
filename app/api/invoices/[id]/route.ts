import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function PATCH(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  const { isPaid } = await req.json();

  const invoice = await prisma.invoice.update({
    where: { id: Number(id) },
    data: {
      isPaid,
      paidAt: isPaid ? new Date() : null,
    },
    include: { items: true },
  });

  return NextResponse.json(invoice);
}
