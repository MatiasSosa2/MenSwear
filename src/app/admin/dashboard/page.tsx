import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders,
    approvedOrders,
    pendingOrders,
    shippedOrders,
    monthStats,
    lastMonthStats,
    totalRevenueData,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "APPROVED" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.aggregate({
      where: { status: "APPROVED", createdAt: { gte: startOfMonth } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        status: "APPROVED",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: "APPROVED" },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        customerName: true,
        customerLastName: true,
        total: true,
        status: true,
        createdAt: true,
        externalRef: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productSlug", "productTitle"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return {
    orders: { total: totalOrders, approved: approvedOrders, pending: pendingOrders, shipped: shippedOrders },
    revenue: {
      total: totalRevenueData._sum.total ?? 0,
      thisMonth: monthStats._sum.total ?? 0,
      thisMonthCount: monthStats._count,
      lastMonth: lastMonthStats._sum.total ?? 0,
      lastMonthCount: lastMonthStats._count,
    },
    recentOrders,
    topProducts: topProducts.map((p) => ({
      slug: p.productSlug,
      title: p.productTitle,
      totalSold: p._sum.quantity ?? 0,
      totalRevenue: p._sum.totalPrice ?? 0,
    })),
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendiente",  color: "bg-gray-100 text-gray-600 border border-gray-300" },
  APPROVED:  { label: "Aprobado",   color: "bg-black text-white" },
  REJECTED:  { label: "Rechazado",  color: "bg-gray-300 text-gray-700" },
  CANCELLED: { label: "Cancelado",  color: "bg-gray-200 text-gray-500" },
  SHIPPED:   { label: "Despachado", color: "bg-gray-700 text-white" },
  DELIVERED: { label: "Entregado",  color: "bg-gray-900 text-gray-100" },
};

export default async function DashboardPage() {
  await auth();
  const data = await getDashboardData();

  const monthGrowth =
    data.revenue.lastMonth > 0
      ? (((data.revenue.thisMonth - data.revenue.lastMonth) / data.revenue.lastMonth) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Ingresos totales" value={fmt(data.revenue.total)} sub="pedidos aprobados" />
        <KpiCard
          title="Este mes"
          value={fmt(data.revenue.thisMonth)}
          sub={`${data.revenue.thisMonthCount} ventas${monthGrowth ? ` · ${monthGrowth}%` : ""}`}
        />
        <KpiCard title="Pedidos totales" value={String(data.orders.total)} sub={`${data.orders.pending} pendientes`} />
        <KpiCard title="Despachados" value={String(data.orders.shipped)} sub="para entregar" />
      </div>

      {/* Estados de pedidos */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aprobados", count: data.orders.approved, color: "bg-black border-black text-white" },
          { label: "Pendientes", count: data.orders.pending, color: "bg-white border-gray-300 text-gray-700" },
          { label: "Rechazados", count: data.orders.total - data.orders.approved - data.orders.pending - data.orders.shipped, color: "bg-gray-200 border-gray-300 text-gray-600" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Últimos pedidos */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Últimos pedidos</h2>
            <Link href="/admin/ventas" className="text-sm text-gray-500 hover:text-black">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentOrders.length === 0 && (
              <p className="p-4 text-sm text-gray-400">Sin pedidos aún.</p>
            )}
            {data.recentOrders.map((o) => {
              const st = statusLabels[o.status] ?? statusLabels.PENDING;
              return (
                <Link key={o.id} href={`/admin/ventas/${o.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{o.customerName} {o.customerLastName}</p>
                    <p className="text-xs text-gray-400">{o.externalRef}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{fmt(o.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Top productos */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Productos más vendidos</h2>
            <Link href="/admin/stock" className="text-sm text-gray-500 hover:text-black">
              Ver stock →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.topProducts.length === 0 && (
              <p className="p-4 text-sm text-gray-400">Sin ventas aún.</p>
            )}
            {data.topProducts.map((p, i) => (
              <div key={p.slug} className="flex items-center gap-3 p-4">
                <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{p.totalSold} unidades vendidas</p>
                </div>
                <p className="text-sm font-semibold">{fmt(p.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 font-medium mb-2">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
