import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { products } from "@/data/products";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Traer todos los stocks de la DB
  const stocks = await prisma.productStock.findMany();
  const stockMap = new Map(stocks.map((s) => [s.slug, s.stock]));

  // Combinar con la lista de productos del catálogo
  const result = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    price: p.price,
    sizes: p.sizes,
    stock: stockMap.get(p.slug) ?? 0,
  }));

  return NextResponse.json(result);
}

const updateStockSchema = z.object({
  slug: z.string().max(200),
  stock: z.number().int().min(0).max(99999),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateStockSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { slug, stock } = parsed.data;

  const updated = await prisma.productStock.upsert({
    where: { slug },
    update: { stock },
    create: { slug, stock },
  });

  return NextResponse.json(updated);
}
