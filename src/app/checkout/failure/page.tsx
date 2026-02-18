"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FailureContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícono de error */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pago no completado
        </h1>
        <p className="text-gray-600 mb-6">
          No se pudo procesar tu pago. Por favor, intenta nuevamente.
        </p>

        {/* Detalles si existen */}
        {(paymentId || status) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              {paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de referencia:</span>
                  <span className="font-semibold">{paymentId}</span>
                </div>
              )}
              {status && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-semibold capitalize">{status}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posibles causas */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-yellow-900 mb-2">Posibles causas:</p>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• Fondos insuficientes</li>
            <li>• Datos de tarjeta incorrectos</li>
            <li>• Cancelaste el pago</li>
            <li>• El banco rechazó la transacción</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <a
            href="/checkout"
            className="block w-full bg-black text-white py-3 px-6 rounded-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Intentar nuevamente
          </a>
          <a
            href="/"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-sm font-semibold hover:bg-gray-300 transition-colors"
          >
            Volver a la tienda
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailure() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Cargando...</div>
      </div>
    }>
      <FailureContent />
    </Suspense>
  );
}
