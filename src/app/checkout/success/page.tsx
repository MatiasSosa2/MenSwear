"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

function SuccessContent() {
  const [orderData, setOrderData] = useState<any>(null);
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const externalReference = searchParams.get("external_reference");

  useEffect(() => {
    // Limpiar el carrito
    try {
      localStorage.removeItem("cart");
      
      // Recuperar datos del pedido si existen
      const savedData = localStorage.getItem("checkout_data");
      if (savedData) {
        setOrderData(JSON.parse(savedData));
        localStorage.removeItem("checkout_data");
      }
    } catch (error) {
      console.error("Error cleaning up:", error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícono de éxito */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Pago exitoso!
        </h1>
        <p className="text-gray-600 mb-6">
          Tu compra se ha procesado correctamente.
        </p>

        {/* Detalles del pago */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="space-y-2 text-sm">
            {paymentId && (
              <div className="flex justify-between">
                <span className="text-gray-600">ID de pago:</span>
                <span className="font-semibold">{paymentId}</span>
              </div>
            )}
            {status && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold capitalize">{status}</span>
              </div>
            )}
            {externalReference && (
              <div className="flex justify-between">
                <span className="text-gray-600">Orden:</span>
                <span className="font-semibold">{externalReference}</span>
              </div>
            )}
            {orderData?.email && (
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{orderData.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <p className="text-sm text-gray-600 mb-6">
          Recibirás un email de confirmación en breve con los detalles de tu compra.
        </p>

        {/* Botón para volver */}
        <a
          href="/"
          className="inline-block w-full bg-black text-white py-3 px-6 rounded-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Volver a la tienda
        </a>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Cargando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
