"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Checkout from "./Checkout";
import { useSearchParams } from "next/navigation";
import { getCart, CartItem, onCartUpdated } from "@/lib/cart";
import { formatARS } from "@/data/products";

// Este componente integra el Payment Brick de Mercado Pago (SDK v2)
// Claves:
// - Public Key (frontend): coloca en .env.local como NEXT_PUBLIC_MP_PUBLIC_KEY
//   Ej: NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-XXXXXXXXXXXXXXXXXXXXXXXX
// - Access Token (backend): coloca en .env.local como MP_ACCESS_TOKEN
//   Ej: MP_ACCESS_TOKEN=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXX

function CheckoutContent() {
  const containerId = "paymentBrick_container";
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>(searchParams.get("email") || "");
  const [amount, setAmount] = useState<number>(0);
  const [traceId, setTraceId] = useState<string>(searchParams.get("traceId") || "");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [isReady, setIsReady] = useState<boolean>(false);
  const bricksBuilderRef = useRef<any>(null);
  const autoRenderedRef = useRef<boolean>(false);
  const brickMountedRef = useRef<boolean>(false);
  const [sdkReady, setSdkReady] = useState<boolean>(false);
  const debug = process.env.NEXT_PUBLIC_DEBUG_CHECKOUT === "true";
  const AUTO_RENDER = process.env.NEXT_PUBLIC_MP_AUTO_RENDER === "true";
  const USE_CHECKOUT_PRO_ONLY = process.env.NEXT_PUBLIC_MP_USE_CHECKOUT_PRO_ONLY === "true";
  // Steps: 0 Datos, 1 Envío/Resumen, 2 Pago
  const [step, setStep] = useState<number>(0);
  const [buyerName, setBuyerName] = useState<string>("");
  const [buyerPhone, setBuyerPhone] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [shippingCity, setShippingCity] = useState<string>("");
  const [shippingProvince, setShippingProvince] = useState<string>("");
  const [shippingZip, setShippingZip] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<CartItem[]>([]);
  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "";
    if (!publicKey) {
      setStatusMsg("Falta NEXT_PUBLIC_MP_PUBLIC_KEY en .env.local");
      return;
    }
    if (USE_CHECKOUT_PRO_ONLY) {
      if (debug) console.log("[Checkout] Modo Checkout Pro solamente: no se inicializa SDK");
      return;
    }
    if (!traceId) {
      try {
        const fromStorage = sessionStorage.getItem("checkout_trace_id");
        const generated = typeof crypto !== "undefined" && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : `trace-${Date.now()}`;
        setTraceId(fromStorage || generated);
      } catch {
        const generated = typeof crypto !== "undefined" && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : `trace-${Date.now()}`;
        setTraceId(generated);
      }
    }
    if (debug) console.log("[Checkout] Mount effect: init SDK", { amount, email, hasPublicKey: !!publicKey, traceId: traceId || "(pending)" });
    if (!publicKey) {
      setStatusMsg("Falta NEXT_PUBLIC_MP_PUBLIC_KEY en .env.local");
      return;
    }
    const maybeMP = (window as any).MercadoPago;
    if (maybeMP) {
      try {
        const mp = new maybeMP(publicKey, { locale: "es-AR" });
        const bricksBuilder = mp.bricks();
        bricksBuilderRef.current = bricksBuilder;
        setSdkReady(true);
        if (debug) console.log("[Checkout] SDK listo (sin polling)");
      } catch (e: any) {
        setStatusMsg(e?.message || "No se pudo inicializar Mercado Pago");
        if (debug) console.error("[Checkout] Error inicializando MP", e);
      }
    } else {
      setStatusMsg("Cargando SDK de Mercado Pago...");
      // Polling para inicializar apenas esté disponible el SDK global cargado por layout
      let tries = 0;
      const maxTries = 50; // ~5s
      const interval = setInterval(() => {
        const MP = (window as any).MercadoPago;
        if (MP) {
          try {
            const mp = new MP(publicKey, { locale: "es-AR" });
            const bricksBuilder = mp.bricks();
            bricksBuilderRef.current = bricksBuilder;
            setSdkReady(true);
            setStatusMsg("");
            if (debug) console.log("[Checkout] SDK listo (polling)");
          } catch (e: any) {
            setStatusMsg(e?.message || "No se pudo inicializar Mercado Pago");
            if (debug) console.error("[Checkout] Error inicializando MP (polling)", e);
          }
          clearInterval(interval);
        } else if (++tries >= maxTries) {
          clearInterval(interval);
          setStatusMsg("No cargó el SDK de Mercado Pago. Reintenta o verifica conexión.");
          if (debug) console.warn("[Checkout] SDK no cargó en tiempo esperado");
        }
      }, 100);
      return () => clearInterval(interval);
    }
    return () => {
      // Limpia el brick si existe
      try {
        bricksBuilderRef.current?.unmount(containerId);
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (debug) console.log("[Checkout] sdkReady/amount changed", { sdkReady, amount, traceId });
    // Deshabilitar auto-render: el usuario debe presionar "Pagar ahora" en el paso 3
    // if (AUTO_RENDER && sdkReady && Number(amount) > 0 && !autoRenderedRef.current) {
    //   autoRenderedRef.current = true;
    //   renderBrick();
    // }
  }, [sdkReady, amount, AUTO_RENDER]);

  useEffect(() => {
    // Fallback: si no vino email por URL, toma el último guardado
    try {
      if (!email) {
        const lastEmail = localStorage.getItem("checkout_email");
        if (lastEmail) setEmail(lastEmail);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Persistir cambios de email
    try {
      if (email) localStorage.setItem("checkout_email", email);
    } catch {}
  }, [email]);

  useEffect(() => {
    // Cargar carrito para resumen y suscribirse a cambios
    try {
      setItems(getCart());
      const off = onCartUpdated(() => setItems(getCart()));
      return () => off();
    } catch {}
  }, []);

  useEffect(() => {
    // El monto a pagar SIEMPRE se calcula desde el carrito
    setAmount(subtotal);
  }, [subtotal]);

  const canGoNextFromStep1 = () => {
    return buyerName.trim().length >= 2 && /.+@.+\..+/.test(email.trim()) && buyerPhone.trim().length >= 6;
  };

  const canGoNextFromStep2 = () => {
    return (
      shippingAddress.trim().length >= 3 &&
      shippingCity.trim().length >= 2 &&
      shippingProvince.trim().length >= 2 &&
      shippingZip.trim().length >= 3
    );
  };

  const nextStep = () => {
    if (step === 0) {
      if (!canGoNextFromStep1()) {
        setStatusMsg("Completa nombre, e-mail y teléfono para continuar");
        return;
      }
      try { if (email) localStorage.setItem("checkout_email", email); } catch {}
      setStep(1);
      setStatusMsg("");
    } else if (step === 1) {
      if (!canGoNextFromStep2()) {
        setStatusMsg("Completa dirección, ciudad, provincia y código postal para continuar");
        return;
      }
      setStep(2);
      setStatusMsg("");
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderBrick = () => {
    if (!bricksBuilderRef.current) {
      setStatusMsg("SDK de Mercado Pago no está listo");
      return;
    }
    if (brickMountedRef.current) {
      if (debug) console.warn("[Checkout] Brick already mounted, skipping re-render");
      return;
    }
    if (!email || !buyerName) {
      setStatusMsg("Completa tus datos antes de proceder al pago");
      return;
    }
    setStatusMsg("");
    if (debug) console.log("[Checkout] Render Brick", { amount: Number(amount || 0), email, name: buyerName, traceId });

    try {
      bricksBuilderRef.current.create("payment", containerId, {
      initialization: {
        amount: Number(amount || 0),
        payer: {
          email: email || "",
        },
      },
      callbacks: {
        onReady: () => {
          setIsReady(true);
          brickMountedRef.current = true;
          if (debug) console.log("[Checkout] Brick ready");
        },
        onSubmit: async ({ formData }: { formData: any }) => {
          setStatusMsg("Procesando pago...");
          if (debug) console.log("[Checkout] onSubmit", { keys: Object.keys(formData || {}), traceId });
          try {
            const res = await fetch("/api/process_payment", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Trace-Id": traceId || "" },
              body: JSON.stringify({ formData }),
            });
            const data = await res.json();
            if (debug) console.log("[Checkout] Payment response", { ok: res.ok, status: res.status, traceId, dataSummary: { id: data?.id, status: data?.status, status_detail: data?.status_detail } });
            if (!res.ok) {
              setStatusMsg(data?.message || "Error procesando el pago");
              return;
            }
            setStatusMsg(data?.message || "Pago procesado");
            // Aquí podrías redirigir, mostrar comprobante de ticket, etc.
          } catch (err: any) {
            setStatusMsg(err?.message || "Error de red al enviar el pago");
            if (debug) console.error("[Checkout] onSubmit error", { err, traceId });
          }
        },
          onError: (error: any) => {
            let msg = "Error inicializando el Brick";
            if (typeof error === "string") msg = error;
            else if (error?.message) msg = error.message;
            else if (error?.cause) msg = String(error.cause);
            else if (error?.type) msg = `Tipo de error: ${error.type}`;
            setStatusMsg(msg);
            if (debug) console.error("[Checkout] Brick error", { error, msg });
            // Si el error indica falta de tipo de pago, sugerir revisar métodos habilitados en la cuenta
            const lower = (error?.message || error?.cause || "").toLowerCase();
            if (lower.includes("no payment type")) {
              setStatusMsg("No hay métodos de pago disponibles en tu cuenta. Revisa en Mercado Pago que tengas habilitado al menos un tipo (tarjeta, débito, ticket o transferencia).");
            }
            // Permitir reintentos si falló antes de montar
            brickMountedRef.current = false;
          },
      },
      });
    } catch (e: any) {
      const msg = e?.message || "No se pudo crear el Brick";
      setStatusMsg(msg);
      brickMountedRef.current = false;
      if (debug) console.error("[Checkout] Brick create exception", { e, msg });
    }
  };

  const generateCheckoutProLink = async () => {
    try {
      setStatusMsg("Generando link de pago...");
      const res = await fetch("/api/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Trace-Id": traceId || "" },
        body: JSON.stringify({ amount: Number(amount || 0), email: email || "" }),
      });
      const data = await res.json();
      if (debug) console.log("[Checkout] Preference response", { ok: res.ok, status: res.status, traceId, id: data?.id });
      if (!res.ok || !data?.init_point) {
        setStatusMsg(data?.message || "No se pudo generar la preferencia");
        return;
      }
      window.location.assign(data.init_point);
    } catch (e: any) {
      setStatusMsg(e?.message || "Error generando link de pago");
      if (debug) console.error("[Checkout] Preference error", { e, traceId });
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Checkout</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Completa tus datos, confirma envío y paga de forma segura. El total se calcula automáticamente según tu carrito.
      </p>

      {debug && (
        <div style={{ marginBottom: 12, padding: 8, border: "1px dashed #ccc", borderRadius: 8, background: "#fbfbfb" }}>
          <strong>Debug:</strong> amount={amount} | email={email || "(vacío)"} | traceId={traceId || "(no-set)"}
        </div>
      )}

      {/* Stepper compacto */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {["Datos", "Entrega", "Pago"].map((label, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: step === i ? "#0f172a" : "#f8fafc",
              color: step === i ? "#fff" : "#0f172a",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: 999,
              background: step === i ? "#111827" : "#e5e7eb",
              color: step === i ? "#fff" : "#374151",
              fontSize: 12,
              fontWeight: 700,
            }}>{i + 1}</span>
            {label}
          </div>
        ))}
      </div>
      {/* Separador visual entre stepper y secciones */}
      <div style={{ height: 2, background: "#0f172a", borderRadius: 999, opacity: 0.9, margin: "16px 0" }} />

      {/* Paso 1: Datos */}
      <section style={{ border: step === 0 ? "2px solid #0f172a" : "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#ffffff", boxShadow: step === 0 ? "0 6px 12px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 999, background: step === 0 ? "#111827" : "#e5e7eb", color: step === 0 ? "#fff" : "#374151", fontWeight: 700 }}>1</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Datos del comprador</h2>
          </div>
          <span style={{ fontSize: 12, color: canGoNextFromStep1() ? "#059669" : "#9ca3af" }}>
            {canGoNextFromStep1() ? "Completo" : step > 0 ? "Pendiente" : "En curso"}
          </span>
        </div>
        {step === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>Nombre y apellido</label>
              <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Ej: Matías Cortez" style={{ width: "100%", padding: 12, border: "1px solid #e5e7eb", borderRadius: 10 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>Teléfono</label>
              <input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="+54 11 5555 5555" style={{ width: "100%", padding: 12, border: "1px solid #e5e7eb", borderRadius: 10 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>Email del pagador</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@correo.com" style={{ width: "100%", padding: 12, border: "1px solid #e5e7eb", borderRadius: 10 }} />
            </div>
            <div style={{ gridColumn: "1 / -1", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Total a pagar</strong>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Se calcula automáticamente según tu carrito</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {formatARS(amount)}
                </div>
              </div>
            </div>
            {!canGoNextFromStep1() && (
              <div style={{ gridColumn: "1 / -1", marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                Completa nombre, e-mail y teléfono para continuar.
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1", color: "#6b7280", fontSize: 13 }}>
              <div><strong>Nombre:</strong> {buyerName || "(pendiente)"}</div>
              <div><strong>Teléfono:</strong> {buyerPhone || "(pendiente)"}</div>
              <div><strong>Email:</strong> {email || "(pendiente)"}</div>
            </div>
          </div>
        )}
      </section>
      {/* Separador entre Paso 1 y Paso 2 */}
      <div style={{ height: 2, background: "#0f172a", borderRadius: 999, opacity: 0.9, margin: "16px 0" }} />

      {/* Paso 2: ENTREGA */}
      <section style={{ border: step === 1 ? "2px solid #0f172a" : "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#ffffff", boxShadow: step === 1 ? "0 6px 12px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 999, background: step === 1 ? "#111827" : "#e5e7eb", color: step === 1 ? "#fff" : "#374151", fontWeight: 700 }}>2</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>ENTREGA</h2>
          </div>
          <span style={{ fontSize: 12, color: step > 1 ? "#059669" : step === 1 ? "#9ca3af" : "#9ca3af" }}>
            {step > 1 ? "Completo" : step === 1 ? "En curso" : "Pendiente"}
          </span>
        </div>
        {step === 1 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>Dirección</label>
              <input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Calle 123" style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>Ciudad</label>
              <input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} placeholder="CABA" style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>Provincia</label>
              <input value={shippingProvince} onChange={(e) => setShippingProvince(e.target.value)} placeholder="Buenos Aires" style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>Código Postal</label>
              <input value={shippingZip} onChange={(e) => setShippingZip(e.target.value)} placeholder="1000" style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>Notas (opcional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Instrucciones de entrega…" style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
            </div>
            {!canGoNextFromStep2() && (
              <div style={{ gridColumn: "1 / -1", marginTop: 8, fontSize: 12, color: "#b91c1c" }}>
                Completa dirección, ciudad, provincia y código postal para continuar.
              </div>
            )}
            {/* Resumen movido al Paso 3 */}
          </div>
        ) : (
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            Completá este paso para ver el resumen y confirmar el envío.
          </div>
        )}
      </section>
      {/* Separador entre Paso 2 y Paso 3 */}
      <div style={{ height: 2, background: "#0f172a", borderRadius: 999, opacity: 0.9, margin: "16px 0" }} />

      {/* Paso 3: Pago */}
      <section style={{ border: step === 2 ? "2px solid #0f172a" : "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#ffffff", boxShadow: step === 2 ? "0 6px 12px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 999, background: step === 2 ? "#111827" : "#e5e7eb", color: step === 2 ? "#fff" : "#374151", fontWeight: 700 }}>3</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Pago</h2>
          </div>
          <span style={{ fontSize: 12, color: step === 2 ? "#9ca3af" : "#9ca3af" }}>
            {step === 2 ? "En curso" : "Pendiente"}
          </span>
        </div>
        {step === 2 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Resumen de tu compra (Paso 3, izquierda) */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#f8fafc" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>RESUMEN</div>
              {items.length === 0 ? (
                <p style={{ color: "#777" }}>Tu carrito está vacío.</p>
              ) : (
                <div>
                  {items.map((it) => (
                    <div key={it.id} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 14 }}>{it.title}</div>
                          <div style={{ fontSize: 12, color: "#6b7280", letterSpacing: 0.5 }}>{it.title.toUpperCase()}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>x{it.qty}</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{formatARS(it.price * it.qty)}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Totales */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                      <span>Subtotal</span>
                      <span>{formatARS(subtotal)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                      <span>Envío</span>
                      <span style={{ fontWeight: 600 }}>GRATIS</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, fontWeight: 700, borderTop: "1px solid #e5e7eb", marginTop: 6 }}>
                      <span>Total</span>
                      <span>{formatARS(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Pago (Paso 3, derecha) */}
            <div>
              {!USE_CHECKOUT_PRO_ONLY && (
                <div>
                  <button
                    onClick={renderBrick}
                    disabled={!sdkReady || brickMountedRef.current || amount <= 0 || !email || !buyerName}
                    style={{ padding: "12px 16px", width: "100%", background: !sdkReady || brickMountedRef.current || amount <= 0 || !email || !buyerName ? "#9ca3af" : "#111827", color: "#fff", border: 0, borderRadius: 10, cursor: !sdkReady || brickMountedRef.current || amount <= 0 || !email || !buyerName ? "not-allowed" : "pointer", fontWeight: 600, marginBottom: 8 }}
                  >
                    {brickMountedRef.current ? "Formulario de pago cargado ✓" : "Cargar formulario de pago"}
                  </button>
                  {(!email || !buyerName) && (
                    <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
                      ⚠️ Completa tus datos en los pasos anteriores
                    </p>
                  )}
                </div>
              )}
              {!USE_CHECKOUT_PRO_ONLY && (
                <div id={containerId} style={{ marginTop: 12, background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}></div>
              )}
              {!USE_CHECKOUT_PRO_ONLY && !isReady && (
                <p style={{ marginTop: 12, color: "#999" }}>Inicializando Payment Brick...</p>
              )}
              <div style={{ marginTop: 12, border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                <p style={{ marginBottom: 8 }}>
                  <strong>{USE_CHECKOUT_PRO_ONLY ? "Modo activo: Checkout Pro" : "Alternativa:"}</strong> {USE_CHECKOUT_PRO_ONLY ? "Usando solo link de pago" : "si el Brick no está disponible, podés generar un link de pago de Checkout Pro."}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{formatARS(total)}</div>
                  <button
                    onClick={generateCheckoutProLink}
                    disabled={amount <= 0}
                    style={{ padding: "12px 16px", background: amount <= 0 ? "#9ca3af" : "#0d9488", color: "#fff", border: 0, borderRadius: 10, cursor: amount <= 0 ? "not-allowed" : "pointer", fontWeight: 600 }}
                  >
                    Generar link de pago (Checkout Pro)
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            El pago se habilita al completar los pasos anteriores.
          </div>
        )}
      </section>

      {/* Navegación de pasos */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={prevStep} disabled={step === 0} style={{ padding: "12px 16px", background: step === 0 ? "#9ca3af" : "#374151", color: "#fff", border: 0, borderRadius: 10, cursor: step === 0 ? "not-allowed" : "pointer", fontWeight: 600 }}>Atrás</button>
        <button onClick={nextStep} disabled={(step === 0 && !canGoNextFromStep1()) || (step === 1 && !canGoNextFromStep2()) || (step === 2)} style={{ padding: "12px 16px", background: (step === 0 && !canGoNextFromStep1()) || (step === 1 && !canGoNextFromStep2()) || step === 2 ? "#9ca3af" : "#111827", color: "#fff", border: 0, borderRadius: 10, cursor: (step === 0 && !canGoNextFromStep1()) || (step === 1 && !canGoNextFromStep2()) || step === 2 ? "not-allowed" : "pointer", fontWeight: 600 }}>{step < 2 ? "Siguiente" : "Listo"}</button>
      </div>

      {statusMsg && (
        <div style={{ marginTop: 16, padding: 12, background: "#f9fafb", border: "1px solid #eee", borderRadius: 8 }}>
          <strong>Estado:</strong> {statusMsg}
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>Cargando checkout…</div>}>
      <Checkout />
    </Suspense>
  );
}
