"use client";
import { useSearchParams } from "next/navigation";

export default function CheckoutPending() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícono de pendiente */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pago pendiente
        </h1>
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>

        {/* Detalles */}
        {(paymentId || externalReference) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              {paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de pago:</span>
                  <span className="font-semibold">{paymentId}</span>
                </div>
              )}
              {externalReference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Orden:</span>
                  <span className="font-semibold">{externalReference}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-blue-900 mb-2">¿Qué significa esto?</p>
          <p className="text-xs text-blue-800">
            Algunos medios de pago requieren un tiempo adicional para confirmar el pago. 
            Recibirás un email cuando se confirme tu compra.
          </p>
        </div>

        {/* Botón */}
        <a
          href="/"
          className="block w-full bg-black text-white py-3 px-6 rounded-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Volver a la tienda
        </a>
      </div>
    </div>
  );
}
