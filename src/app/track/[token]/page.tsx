"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Truck, Package, PackageOpen, X, Loader2 } from "lucide-react";

type OrderStatus = "PENDING" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED";

interface Order {
  id: string;
  tracking_token: string;
  status: OrderStatus;
  customer_email: string;
  shipping_address: any;
  andreani_tracking_number?: string;
  createdAt: string;
  items: any[];
}

const statusSteps: { status: OrderStatus; label: string; icon: React.ComponentType<any> }[] = [
  { status: "PENDING", label: "Pendiente", icon: X }, // X provisional, luego cambiamos lógica
  { status: "PAID", label: "Pagado", icon: Check },
  { status: "PREPARING", label: "Preparando", icon: PackageOpen },
  { status: "SHIPPED", label: "Despachado", icon: Truck },
  { status: "DELIVERED", label: "Entregado", icon: Package },
];

export default function OrderTracking() {
  const params = useParams();
  const token = params?.token as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/orders/track/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || "Pedido no encontrado");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar el pedido");
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-2">¡Ups! Algo salió mal</h1>
        <p className="text-gray-600">{error || "No pudimos encontrar tu pedido."}</p>
        <a href="/" className="mt-4 text-blue-600 hover:underline">Volver al inicio</a>
      </div>
    );
  }

  // Lógica para determinar el paso actual del stepper
  const currentStepIndex = statusSteps.findIndex((step) => step.status === order.status);
  
  // Si el estado no está en la lista (ej. cancelado), o es pending (índice 0), manejamos visualmente
  // Andreani logic
  const andreaniLink = order.andreani_tracking_number 
    ? `https://seguimiento.andreani.com/envio/${order.andreani_tracking_number}`
    : "#";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-black px-6 py-4">
          <h2 className="text-xl font-bold text-white">Seguimiento de Pedido</h2>
          <p className="text-gray-300 text-sm">Orden #{order.id.slice(0, 8)}</p>
        </div>

        {/* Status Stepper */}
        <div className="p-6">
          <div className="relative flex items-center justify-between mb-8">
            {/* Barra de progreso de fondo */}
            <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200 rounded-full -z-10"></div>
            
            {/* Barra de progreso activa */}
            <div 
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-green-500 rounded-full transition-all duration-500 -z-10"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            ></div>

            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div 
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 z-10 
                      ${isCompleted ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300 text-gray-400"}
                      ${isCurrent ? "ring-4 ring-green-100" : ""}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`mt-2 text-xs font-medium ${isCompleted ? "text-green-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detalles del estado actual */}
          <div className="text-center mb-8 bg-gray-50 p-4 rounded-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Estado: <span className="text-green-600">{statusSteps[currentStepIndex]?.label}</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Botón de Andreani (solo si está despachado/entregado y tiene tracking) */}
          {(order.status === "SHIPPED" || order.status === "DELIVERED") && order.andreani_tracking_number && (
            <div className="mb-8 text-center">
              <a 
                href={andreaniLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Truck className="mr-2 -ml-1 h-5 w-5" />
                Seguir envío en Andreani
              </a>
              <p className="mt-2 text-sm text-gray-500">
                Código de seguimiento: <span className="font-mono text-gray-800">{order.andreani_tracking_number}</span>
              </p>
            </div>
          )}

          {/* Lista de Items */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Resumen de compra</h4>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <li key={idx} className="py-4 flex gap-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                    <img 
                      src={item.image || "/placeholder.png"} 
                      alt={item.title} 
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.title}</h3>
                        <p>${item.price.toLocaleString()}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.size && `Talle: ${item.size}`}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <p className="text-gray-500">Cant: {item.quantity}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Información de envío */}
          <div className="mt-6 bg-gray-50 p-4 rounded text-sm text-gray-600">
            <p className="font-semibold mb-1">Dirección de envío:</p>
            <p>
              {order.shipping_address.street || order.shipping_address.address}, {order.shipping_address.city}
              <br />
              CP: {order.shipping_address.zip}, {order.shipping_address.province}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
