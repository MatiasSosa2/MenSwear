import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Origen permitido para requests cross-origin (mismo sitio en producción)
// Se puede dejar en * para entornos donde no se necesita restricción de origen
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
  };
}

// OPTIONS — preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// GET /api/stock/[slug] — pública, sin auth
// Devuelve el stock por talle de un producto concreto
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Validar slug: solo letras, números y guiones
  if (!/^[a-z0-9-]+$/i.test(slug) || slug.length > 100) {
    return NextResponse.json(
      { error: "Slug inválido" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const record = await prisma.productStock.findUnique({ where: { slug } });

  if (!record) {
    // Si no existe en DB, todos los talles tienen stock ilimitado (sin control)
    return NextResponse.json(
      { slug, sizeStocks: null, total: null },
      { headers: corsHeaders() }
    );
  }

  const sizeStocks = record.sizeStocks as Record<string, number>;
  const total = Object.values(sizeStocks).reduce((a, b) => a + b, 0);

  return NextResponse.json(
    { slug, sizeStocks, total },
    { headers: corsHeaders() }
  );
}
