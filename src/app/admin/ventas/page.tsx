"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Order = {
  id: string;
  externalRef: string;
  customerName: string;
  customerLastName: string;
  customerEmail: string;
  customerDni: string;
  total: number;
  status: string;
  createdAt: string;
  items: { id: string; productTitle: string; quantity: number; unitPrice: number }[];
};

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendiente",  color: "bg-gray-100 text-gray-600 border border-gray-300" },
  APPROVED:  { label: "Aprobado",   color: "bg-black text-white" },
  REJECTED:  { label: "Rechazado",  color: "bg-gray-300 text-gray-700" },
  CANCELLED: { label: "Cancelado",  color: "bg-gray-200 text-gray-500" },
  SHIPPED:   { label: "Despachado", color: "bg-gray-700 text-white" },
  DELIVERED: { label: "Entregado",  color: "bg-gray-900 text-gray-100" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function VentasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce para búsqueda
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        status,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Ventas y Pedidos</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre, email, DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-52 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="ALL">Todos los estados</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron pedidos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Referencia</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">DNI</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Artículos</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const st = statusLabels[o.status] ?? statusLabels.PENDING;
                  const date = new Date(o.createdAt).toLocaleDateString("es-AR", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                  });
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.externalRef}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{o.customerName} {o.customerLastName}</p>
                        <p className="text-xs text-gray-400">{o.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.customerDni}</td>
                      <td className="px-4 py-3 text-gray-600">{o.items.length} artículo{o.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmt(o.total)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/ventas/${o.id}`} className="text-xs text-gray-500 hover:text-black font-medium">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
