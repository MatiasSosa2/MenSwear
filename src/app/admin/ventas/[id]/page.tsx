"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OrderItem = {
  id: string;
  productSlug: string;
  productTitle: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type Order = {
  id: string;
  externalRef: string;
  mercadoPagoId: string | null;
  customerName: string;
  customerLastName: string;
  customerDni: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  notes: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingService: string | null;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pendiente",  color: "bg-yellow-100 text-yellow-800" },
  APPROVED:  { label: "Aprobado",   color: "bg-green-100 text-green-800" },
  REJECTED:  { label: "Rechazado",  color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelado",  color: "bg-gray-100 text-gray-800" },
  SHIPPED:   { label: "Despachado", color: "bg-blue-100 text-blue-800" },
  DELIVERED: { label: "Entregado",  color: "bg-purple-100 text-purple-800" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setNewStatus(data.status);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async () => {
    if (!order || newStatus === order.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setNewStatus(updated.status);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;
  if (!order) return <div className="p-8 text-center text-gray-400">Pedido no encontrado.</div>;

  const st = statusLabels[order.status] ?? statusLabels.PENDING;
  const date = new Date(order.createdAt).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/ventas" className="text-gray-400 hover:text-black text-sm">
          ← Volver a ventas
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.externalRef}</h1>
          <p className="text-sm text-gray-400 mt-1">{date}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${st.color}`}>{st.label}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Datos del cliente */}
        <Card title="Datos del cliente">
          <Row label="Nombre" value={`${order.customerName} ${order.customerLastName}`} />
          <Row label="DNI" value={order.customerDni} />
          <Row label="Email" value={order.customerEmail} />
          <Row label="Teléfono" value={order.customerPhone} />
        </Card>

        {/* Dirección */}
        <Card title="Dirección de envío">
          <Row label="Calle" value={order.address} />
          <Row label="Ciudad" value={order.city} />
          <Row label="Provincia" value={order.province} />
          <Row label="Código postal" value={order.zip} />
          {order.notes && <Row label="Notas" value={order.notes} />}
          {order.shippingService && <Row label="Servicio de envío" value={order.shippingService} />}
        </Card>
      </div>

      {/* Artículos */}
      <Card title="Artículos del pedido">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-sm">{item.productTitle}</p>
                <p className="text-xs text-gray-400">
                  {[item.size && `Talle: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{fmt(item.totalPrice)}</p>
                <p className="text-xs text-gray-400">{item.quantity} × {fmt(item.unitPrice)}</p>
              </div>
            </div>
          ))}
          <div className="pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Envío</span>
              <span>{fmt(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span>{fmt(order.total)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Cambiar estado */}
      <Card title="Gestionar pedido">
        <div className="flex items-center gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            onClick={handleStatusChange}
            disabled={updating || newStatus === order.status}
            className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            {updating ? "Guardando..." : "Actualizar estado"}
          </button>
        </div>
        {order.mercadoPagoId && (
          <p className="text-xs text-gray-400 mt-2">ID MercadoPago: {order.mercadoPagoId}</p>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-all">{value}</span>
    </div>
  );
}
