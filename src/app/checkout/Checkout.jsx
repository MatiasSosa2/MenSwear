"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { getCart } from "@/lib/cart";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const mpInitialized = useRef(false);

  // Section 1: Datos
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Section 2: Entrega
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");

  // Inicializar Mercado Pago una sola vez
  useEffect(() => {
    if (!mpInitialized.current && process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
      try {
        initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
        mpInitialized.current = true;
      } catch (error) {
        console.error('Error initializing MercadoPago:', error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      setItems(getCart());
      const lastEmail = localStorage.getItem("checkout_email");
      if (lastEmail) setEmail(lastEmail);
    } catch {}
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.price || 0) * (it.qty || 0), 0);
  }, [items]);

  const shippingLabel = "GRATIS";
  const shippingAmount = 0;
  const total = subtotal + shippingAmount;

  const isValidEmail = (v) => /.+@.+\..+/.test(v.trim());
  const datosValidos = name.trim().length >= 2 && isValidEmail(email) && phone.trim().length >= 7;
  const entregaValida = address.trim().length >= 3 && city.trim().length >= 2 && province.trim().length >= 2 && zip.trim().length >= 3;

  const canPay = datosValidos && entregaValida && total > 0;

  const onSubmitPayment = async (formData) => {
    if (!canPay || processing) return;
    
    setProcessing(true);
    setPaymentStatus(null);

    try {
      // Agregar información adicional del cliente
      const paymentData = {
        ...formData,
        payer: {
          ...formData.payer,
          entity_type: 'individual',
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || name,
          email: email,
          phone: {
            area_code: phone.substring(0, 3),
            number: phone.substring(3)
          },
          address: {
            street_name: address,
            street_number: "S/N",
            zip_code: zip,
          }
        },
        additional_info: {
          shipments: {
            receiver_address: {
              street_name: address,
              city_name: city,
              state_name: province,
              zip_code: zip,
            }
          },
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.qty,
            unit_price: item.price,
          }))
        }
      };

      const response = await fetch('/api/process_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData: paymentData }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentStatus({
          type: 'success',
          message: '¡Pago realizado con éxito! Recibirás un email de confirmación.',
        });
        // Limpiar carrito
        setTimeout(() => {
          try {
            localStorage.removeItem('cart');
            window.location.href = '/';
          } catch {}
        }, 3000);
      } else {
        setPaymentStatus({
          type: 'error',
          message: result.message || 'Hubo un error al procesar el pago. Intenta nuevamente.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setPaymentStatus({
        type: 'error',
        message: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const onErrorPayment = (error) => {
    console.error('Payment error:', error);
    setPaymentStatus({
      type: 'error',
      message: 'Error en el formulario de pago. Verifica los datos ingresados.',
    });
    setProcessing(false);
  };

  const initialization = {
    amount: total,
    payer: {
      email: email,
      entity_type: 'individual',
    }
  };

  const customization = {
    visual: {
      style: {
        theme: 'default',
      }
    },
    paymentMethods: {
      maxInstallments: 12,
      minInstallments: 1,
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Mobile summary toggle */}
      <div className="md:hidden mb-3 sm:mb-4">
        <button
          onClick={() => setSummaryOpen((s) => !s)}
          className="w-full flex items-center justify-between border border-gray-200 rounded-sm px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <span>Resumen de compra</span>
          <span className="text-gray-600">{summaryOpen ? "Cerrar" : "Ver"}</span>
        </button>
        {summaryOpen && (
          <Summary items={items} subtotal={subtotal} shippingLabel={shippingLabel} shippingAmount={shippingAmount} total={total} />
        )}
      </div>

      {/* Desktop grid */}
      <div className="grid md:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: 100% (secciones apiladas) */}
        <div className="md:col-span-12">
          {/* 1. DATOS */}
          <SectionTitle number={1} title="DATOS" />
          <div className="border border-gray-200 rounded-sm p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="space-y-3 sm:space-y-4">
              <Input label="Nombre y apellido" value={name} onChange={setName} placeholder="EJ: MATÍAS CORTEZ" />
              <Input label="Email" type="email" value={email} onChange={(v) => { setEmail(v); try { localStorage.setItem("checkout_email", v); } catch {} }} placeholder="CLIENTE@CORREO.COM" />
              <Input label="Teléfono" value={phone} onChange={setPhone} placeholder="+54 11 5555 5555" />
              {!datosValidos && (
                <p className="text-xs sm:text-sm text-red-600">Completa nombre, email y teléfono para continuar.</p>
              )}
            </div>
          </div>

          {/* Separador */}
          <div className="h-[2px] bg-black/90 rounded-full my-4" />

          {/* 2. ENTREGA (habilitar solo si 1 válida) */}
          <SectionTitle number={2} title="ENTREGA" />
          <div className={classNames("relative border rounded-sm p-4 mb-4", datosValidos ? "border-gray-200" : "border-gray-300")}> 
            <div className={classNames("space-y-4", !datosValidos && "opacity-50 pointer-events-none")}> 
              <Input label="Dirección" value={address} onChange={setAddress} placeholder="CALLE 123" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Ciudad" value={city} onChange={setCity} placeholder="CABA" />
                <Input label="Provincia" value={province} onChange={setProvince} placeholder="BUENOS AIRES" />
                <Input label="Código Postal" value={zip} onChange={setZip} placeholder="1000" />
              </div>
              <Input label="Notas (opcional)" value={notes} onChange={setNotes} placeholder="INSTRUCCIONES DE ENTREGA…" textarea />
              {!entregaValida && datosValidos && (
                <p className="text-xs text-red-600">Completa dirección, ciudad, provincia y código postal.</p>
              )}
            </div>
          </div>

          {/* Separador */}
          <div className="h-[2px] bg-black/90 rounded-full my-4" />

          {/* 3. PAGO */}
          <SectionTitle number={3} title="PAGO" />
          <div className={classNames("border rounded-sm p-4", canPay ? "border-gray-200" : "border-gray-300")}> 
            <div className={classNames("grid md:grid-cols-2 gap-4", !canPay && "opacity-50 pointer-events-none")}> 
              {/* Resumen integrado (izquierda) */}
              <Summary items={items} subtotal={subtotal} shippingLabel={shippingLabel} shippingAmount={shippingAmount} total={total} />

              {/* Formulario de pago (derecha) */}
              <div className="space-y-4">
                {paymentStatus && (
                  <div className={classNames(
                    "p-4 rounded-sm border",
                    paymentStatus.type === 'success' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                  )}>
                    <p className="text-sm font-medium">{paymentStatus.message}</p>
                  </div>
                )}

                {canPay && !paymentStatus && (
                  <>
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-sm">
                      <p className="text-xs text-gray-600 mb-1">TOTAL A PAGAR</p>
                      <p className="text-2xl font-bold">{formatARS(total)}</p>
                    </div>

                    {typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MP_PUBLIC_KEY && mpInitialized.current ? (
                      <Payment
                        key={`payment-${email}-${total}`}
                        initialization={initialization}
                        customization={customization}
                        onSubmit={onSubmitPayment}
                        onError={onErrorPayment}
                      />
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-sm">
                        <p className="text-sm text-yellow-800">
                          {!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY 
                            ? '⚠️ Falta configurar NEXT_PUBLIC_MP_PUBLIC_KEY en las variables de entorno'
                            : 'Inicializando sistema de pago...'}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {total <= 0 && (
                  <p className="text-xs text-gray-500">Tu carrito está vacío.</p>
                )}
              </div>
            </div>
            {!canPay && (
              <div className="mt-3 text-xs text-gray-600">Completá los pasos anteriores para habilitar el pago.</div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-sm text-xs font-bold">{number}</div>
      <h2 className="text-sm font-bold tracking-wider">{title}</h2>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", textarea = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-24 border border-gray-300 rounded-sm px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-black"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-black"
        />
      )}
    </div>
  );
}

function Summary({ items, subtotal, shippingLabel, shippingAmount, total }) {
  return (
    <div className="border border-gray-200 rounded-sm p-4 bg-[#F9F9F9]">
      <h3 className="text-sm font-bold mb-3 tracking-wider">RESUMEN</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-gray-500">Tu carrito está vacío.</p>
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <div className="w-14 h-14 border border-gray-200 rounded-sm overflow-hidden bg-white">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-wide">{(it.title || "").toUpperCase()}</p>
                <p className="text-xs text-gray-500">x{it.qty}</p>
              </div>
              <div className="text-sm font-semibold">{formatARS(it.price * it.qty)}</div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">{formatARS(subtotal)}</span></div>
        <div className="flex justify-between"><span className="font-semibold">Envío</span><span className="font-semibold">{shippingLabel}</span></div>
        <div className="pt-2 border-t border-gray-200 flex justify-between"><span className="font-bold">Total</span><span className="font-bold">{formatARS(total)}</span></div>
      </div>
    </div>
  );
}

function formatARS(value) {
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0);
  } catch {
    return `$${value ?? 0}`;
  }
}
