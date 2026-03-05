import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED", "SHIPPED", "DELIVERED", "ALL"]).default("ALL"),
  search: z.string().max(100).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { page, limit, status, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status !== "ALL") where.status = status;
  if (search) {
    where.OR = [
      { customerName: { contains: search } },
      { customerLastName: { contains: search } },
      { customerEmail: { contains: search } },
      { customerDni: { contains: search } },
      { externalRef: { contains: search } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
