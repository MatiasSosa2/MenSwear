import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders,
    approvedOrders,
    pendingOrders,
    monthOrders,
    lastMonthOrders,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "APPROVED" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    // Ventas del mes actual
    prisma.order.aggregate({
      where: { status: "APPROVED", createdAt: { gte: startOfMonth } },
      _sum: { total: true },
      _count: true,
    }),
    // Ventas del mes anterior
    prisma.order.aggregate({
      where: {
        status: "APPROVED",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { total: true },
      _count: true,
    }),
    // Últimos 5 pedidos
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        customerName: true,
        customerLastName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    // Top 5 productos más vendidos
    prisma.orderItem.groupBy({
      by: ["productSlug", "productTitle"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const totalRevenue = approvedOrders > 0
    ? (await prisma.order.aggregate({
        where: { status: "APPROVED" },
        _sum: { total: true },
      }))._sum.total ?? 0
    : 0;

  return NextResponse.json({
    orders: {
      total: totalOrders,
      approved: approvedOrders,
      pending: pendingOrders,
      rejected: totalOrders - approvedOrders - pendingOrders,
    },
    revenue: {
      total: totalRevenue,
      thisMonth: monthOrders._sum.total ?? 0,
      thisMonthCount: monthOrders._count,
      lastMonth: lastMonthOrders._sum.total ?? 0,
      lastMonthCount: lastMonthOrders._count,
    },
    recentOrders,
    topProducts: topProducts.map((p) => ({
      slug: p.productSlug,
      title: p.productTitle,
      totalSold: p._sum.quantity ?? 0,
      totalRevenue: p._sum.totalPrice ?? 0,
    })),
  });
}
