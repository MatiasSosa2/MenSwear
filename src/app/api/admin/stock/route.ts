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
  const stockMap = new Map(stocks.map((s) => [s.slug, s.sizeStocks as Record<string, number>]));

  // Combinar con la lista de productos del catálogo
  const result = products.map((p) => {
    const sizeStocks = stockMap.get(p.slug) ?? {};
    const total = Object.values(sizeStocks).reduce((acc, q) => acc + (q as number), 0);
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      price: p.price,
      sizes: p.sizes,
      sizeStocks,
      total,
    };
  });

  return NextResponse.json(result);
}

const updateStockSchema = z.object({
  slug: z.string().max(200),
  size: z.string().max(20),
  quantity: z.number().int().min(0).max(99999),
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

  const { slug, size, quantity } = parsed.data;

  // Leer el registro actual y actualizar solo el talle indicado
  const existing = await prisma.productStock.findUnique({ where: { slug } });
  const current = (existing?.sizeStocks as Record<string, number>) ?? {};
  const updated = { ...current, [size]: quantity };

  const record = await prisma.productStock.upsert({
    where: { slug },
    update: { sizeStocks: updated },
    create: { slug, sizeStocks: updated },
  });

  const sizeStocks = record.sizeStocks as Record<string, number>;
  const total = Object.values(sizeStocks).reduce((acc, q) => acc + q, 0);
  return NextResponse.json({ slug: record.slug, sizeStocks, total });
}
