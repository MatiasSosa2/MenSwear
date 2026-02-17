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

  // Estados de confirmación
  const [datosConfirmados, setDatosConfirmados] = useState(false);
  const [entregaConfirmada, setEntregaConfirmada] = useState(false);
  const [compraConfirmada, setCompraConfirmada] = useState(false);

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
        console.log('[MP Init] Initializing with key:', process.env.NEXT_PUBLIC_MP_PUBLIC_KEY?.substring(0, 20) + '...');
        initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
        mpInitialized.current = true;
        console.log('[MP Init] Successfully initialized');
      } catch (error) {
        console.error('[MP Init] Error initializing MercadoPago:', error);
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

  const canPay = datosConfirmados && entregaConfirmada && compraConfirmada && total > 0;

  // Función para remover items del carrito
  const removeItem = (productId) => {
    try {
      const updatedItems = items.filter(item => item.id !== productId);
      setItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

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
    console.error('Payment error type:', typeof error);
    console.error('Payment error keys:', error ? Object.keys(error) : 'null');
    console.error('Payment error JSON:', JSON.stringify(error, null, 2));
    
    // Determinar mensaje de error más específico
    let errorMessage = 'Error en el formulario de pago. Verifica los datos ingresados.';
    
    // Verificar si el error está vacío o no tiene información útil
    const isEmptyError = !error || (typeof error === 'object' && Object.keys(error).length === 0);
    
    if (!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
      errorMessage = 'Error de configuración: Falta configurar las credenciales de Mercado Pago. Reinicia el servidor después de configurar .env.local';
    } else if (isEmptyError) {
      errorMessage = 'Error desconocido en el sistema de pago. Verifica que hayas completado todos los campos del formulario de pago (número de tarjeta, vencimiento, código de seguridad, nombre del titular).';
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.cause) {
      errorMessage = `Error: ${error.cause}`;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    setPaymentStatus({
      type: 'error',
      message: errorMessage,
    });
    setProcessing(false);
  };

  const initialization = useMemo(() => {
    const config = {
      amount: total,
      payer: {
        email: email || 'test@test.com',
        entityType: 'individual'
      }
    };
    console.log('[MP Payment] Initialization config:', config);
    console.log('[MP Payment] Items in cart:', items.length, 'Total:', total);
    return config;
  }, [total, email, items.length]);

  const customization = useMemo(() => {
    const config = {
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
    console.log('[MP Payment] Customization config:', config);
    return config;
  }, []);

  const onReadyPayment = () => {
    console.log('[MP Payment] Payment Brick is ready');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        
        {/* Mensaje si el carrito está vacío */}
        {items.length === 0 && (
          <div className="max-w-md mx-auto mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-sm text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h2 className="text-xl font-bold mb-2">Tu carrito está vacío</h2>
            <p className="text-sm text-gray-600 mb-4">
              Agrega productos a tu carrito para continuar con la compra.
            </p>
            <a
              href="/productos"
              className="inline-block bg-black text-white px-6 py-3 rounded-sm font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Ver productos
            </a>
          </div>
        )}

        {/* Contenido del checkout solo si hay items */}
        {items.length > 0 && (
          <>
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
          <Summary items={items} subtotal={subtotal} shippingLabel={shippingLabel} shippingAmount={shippingAmount} total={total} removeItem={removeItem} />
        )}
      </div>

      {/* Desktop grid */}
      <div className="grid md:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: 100% (secciones apiladas) */}
        <div className="md:col-span-12">
          {/* 1. DATOS */}
          <SectionTitle number={1} title="DATOS" />
          {!datosConfirmados ? (
            <div className="border border-gray-200 rounded-sm p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="space-y-3 sm:space-y-4">
                <Input label="Nombre y apellido" value={name} onChange={setName} placeholder="EJ: MATÍAS CORTEZ" />
                <Input label="Email" type="email" value={email} onChange={(v) => { setEmail(v); try { localStorage.setItem("checkout_email", v); } catch {} }} placeholder="CLIENTE@CORREO.COM" />
                <Input label="Teléfono" value={phone} onChange={setPhone} placeholder="+54 11 5555 5555" />
                {!datosValidos && (
                  <p className="text-xs sm:text-sm text-red-600">Completa nombre, email y teléfono para continuar.</p>
                )}
                <button
                  onClick={() => datosValidos && setDatosConfirmados(true)}
                  disabled={!datosValidos}
                  className={classNames(
                    "w-full py-2.5 sm:py-3 px-4 rounded-sm font-semibold text-sm transition-all",
                    datosValidos 
                      ? "bg-black text-white hover:opacity-90" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  CONFIRMAR DATOS
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-sm p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-green-800">DATOS CONFIRMADOS</span>
                </div>
                <button
                  onClick={() => {
                    setDatosConfirmados(false);
                    setEntregaConfirmada(false);
                    setCompraConfirmada(false);
                  }}
                  className="text-xs font-semibold text-green-700 hover:text-green-900 underline"
                >
                  Editar
                </button>
              </div>
              <div className="space-y-2 text-sm text-green-900">
                <p><span className="font-semibold">Nombre:</span> {name}</p>
                <p><span className="font-semibold">Email:</span> {email}</p>
                <p><span className="font-semibold">Teléfono:</span> {phone}</p>
              </div>
            </div>
          )}

          {/* Separador */}
          <div className="h-[2px] bg-black/90 rounded-full my-4" />

          {/* 2. ENTREGA (habilitar solo si 1 confirmada) */}
          <SectionTitle number={2} title="ENTREGA" />
          {!entregaConfirmada ? (
            <div className={classNames("relative border rounded-sm p-4 mb-4", datosConfirmados ? "border-gray-200" : "border-gray-300")}> 
              <div className={classNames("space-y-4", !datosConfirmados && "opacity-50 pointer-events-none")}> 
                <Input label="Dirección" value={address} onChange={setAddress} placeholder="CALLE 123" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Ciudad" value={city} onChange={setCity} placeholder="CABA" />
                  <Input label="Provincia" value={province} onChange={setProvince} placeholder="BUENOS AIRES" />
                  <Input label="Código Postal" value={zip} onChange={setZip} placeholder="1000" />
                </div>
                <Input label="Notas (opcional)" value={notes} onChange={setNotes} placeholder="INSTRUCCIONES DE ENTREGA…" textarea />
                {!entregaValida && datosConfirmados && (
                  <p className="text-xs text-red-600">Completa dirección, ciudad, provincia y código postal.</p>
                )}
                <button
                  onClick={() => entregaValida && datosConfirmados && setEntregaConfirmada(true)}
                  disabled={!entregaValida || !datosConfirmados}
                  className={classNames(
                    "w-full py-2.5 sm:py-3 px-4 rounded-sm font-semibold text-sm transition-all",
                    entregaValida && datosConfirmados
                      ? "bg-black text-white hover:opacity-90" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  CONFIRMAR ENTREGA
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-sm p-4 mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-green-800">ENTREGA CONFIRMADA</span>
                </div>
                <button
                  onClick={() => {
                    setEntregaConfirmada(false);
                    setCompraConfirmada(false);
                  }}
                  className="text-xs font-semibold text-green-700 hover:text-green-900 underline"
                >
                  Editar
                </button>
              </div>
              <div className="space-y-2 text-sm text-green-900">
                <p><span className="font-semibold">Dirección:</span> {address}</p>
                <p><span className="font-semibold">Ciudad:</span> {city}, {province} ({zip})</p>
                {notes && <p><span className="font-semibold">Notas:</span> {notes}</p>}
              </div>
            </div>
          )}

          {/* Separador */}
          <div className="h-[2px] bg-black/90 rounded-full my-4" />

          {/* 3. RESUMEN DE COMPRA */}
          <SectionTitle number={3} title="RESUMEN DE COMPRA" />
          {!compraConfirmada ? (
            <div className={classNames("border rounded-sm p-4 mb-4", datosConfirmados && entregaConfirmada ? "border-gray-200" : "border-gray-300")}>
              <div className={classNames("space-y-4", (!datosConfirmados || !entregaConfirmada) && "opacity-50 pointer-events-none")}>
                <Summary items={items} subtotal={subtotal} shippingLabel={shippingLabel} shippingAmount={shippingAmount} total={total} removeItem={removeItem} />
                
                {items.length > 0 && (
                  <button
                    onClick={() => datosConfirmados && entregaConfirmada && setCompraConfirmada(true)}
                    disabled={!datosConfirmados || !entregaConfirmada || items.length === 0}
                    className={classNames(
                      "w-full py-2.5 sm:py-3 px-4 rounded-sm font-semibold text-sm transition-all",
                      datosConfirmados && entregaConfirmada && items.length > 0
                        ? "bg-black text-white hover:opacity-90" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    CONFIRMAR COMPRA
                  </button>
                )}
                {items.length === 0 && (
                  <p className="text-xs text-red-600">No hay productos en el carrito.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-sm p-4 mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-green-800">COMPRA CONFIRMADA</span>
                </div>
                <button
                  onClick={() => setCompraConfirmada(false)}
                  className="text-xs font-semibold text-green-700 hover:text-green-900 underline"
                >
                  Editar
                </button>
              </div>
              <div className="space-y-2 text-sm text-green-900">
                <p><span className="font-semibold">Productos:</span> {items.length} {items.length === 1 ? 'item' : 'items'}</p>
                <p><span className="font-semibold">Total:</span> {formatARS(total)}</p>
              </div>
            </div>
          )}

          {/* Separador */}
          <div className="h-[2px] bg-black/90 rounded-full my-4" />

          {/* 4. PAGO */}
          <SectionTitle number={4} title="PAGO" />
          <div className={classNames("border rounded-sm p-4", canPay ? "border-gray-200" : "border-gray-300")}>
            <div className={classNames(!canPay && "opacity-50 pointer-events-none")}>
              {paymentStatus && (
                <div className={classNames(
                  "p-4 rounded-sm border mb-4",
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

                  {!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-sm">
                      <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Configuración pendiente</p>
                      <p className="text-xs text-yellow-800 mb-3">
                        Para aceptar pagos, necesitas configurar tus credenciales de Mercado Pago.
                      </p>
                      <div className="text-xs text-yellow-900 space-y-1">
                        <p>1. Crea archivo <code className="bg-yellow-100 px-1 py-0.5 rounded">.env.local</code></p>
                        <p>2. Agrega: <code className="bg-yellow-100 px-1 py-0.5 rounded">NEXT_PUBLIC_MP_PUBLIC_KEY=TU_KEY</code></p>
                        <p>3. Reinicia el servidor</p>
                      </div>
                      <a 
                        href="https://www.mercadopago.com.ar/developers/panel/credentials" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs font-semibold text-yellow-900 underline hover:text-yellow-700"
                      >
                        Obtener credenciales →
                      </a>
                    </div>
                  ) : total > 0 && typeof window !== 'undefined' && mpInitialized.current ? (
                    <Payment
                      key={`payment-${email}-${total}`}
                      initialization={initialization}
                      customization={customization}
                      onSubmit={onSubmitPayment}
                      onReady={onReadyPayment}
                      onError={onErrorPayment}
                    />
                  ) : total <= 0 ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
                      <p className="text-sm text-red-800">
                        ⚠️ No se puede procesar el pago: el carrito está vacío.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
                      <p className="text-sm text-blue-800">
                        ⏳ Inicializando sistema de pago...
                      </p>
                    </div>
                  )}
                </>
              )}

              {!canPay && total <= 0 && (
                <p className="text-xs text-gray-500">Tu carrito está vacío.</p>
              )}
            </div>
            {!canPay && (
              <div className="mt-3 text-xs text-gray-600">
                {!datosConfirmados && "Confirma tus datos personales para continuar."}
                {datosConfirmados && !entregaConfirmada && "Confirma la dirección de entrega para continuar."}
                {datosConfirmados && entregaConfirmada && !compraConfirmada && "Confirma la compra para continuar."}
                {datosConfirmados && entregaConfirmada && compraConfirmada && total <= 0 && "Tu carrito está vacío."}
              </div>
            )}
          </div>
        </div>
          </>
        )}
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

function Summary({ items, subtotal, shippingLabel, shippingAmount, total, removeItem }) {
  return (
    <div className="border border-gray-200 rounded-sm p-4 bg-[#F9F9F9]">
      <h3 className="text-sm font-bold mb-3 tracking-wider">RESUMEN</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-gray-500">Tu carrito está vacío.</p>
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 group">
              <div className="w-14 h-14 border border-gray-200 rounded-sm overflow-hidden bg-white flex-shrink-0">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-wide truncate">{(it.title || "").toUpperCase()}</p>
                <p className="text-xs text-gray-500">x{it.qty}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">{formatARS(it.price * it.qty)}</div>
                <button
                  onClick={() => removeItem(it.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-100 rounded-sm ml-auto"
                  title="Eliminar producto"
                >
                  <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
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
