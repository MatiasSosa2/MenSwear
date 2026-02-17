"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ShoppingCart, X, CreditCard, ArrowLeftRight, CheckCircle2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
// Imágenes deshabilitadas en carrito
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatARS } from "@/data/products";
import { CartItem, getCart, onCartUpdated, removeFromCart, clearCart } from "@/lib/cart";
import { getCachedImageForTitle } from "@/lib/images";

function getPromotions(total: number) {
  const promos: string[] = [];
  if (total >= 30000) promos.push("3 cuotas sin interés con Cuenta DNI");
  if (total >= 50000) promos.push("6 cuotas fijas con Mercado Pago");
  promos.push("10% OFF pagando con Personal Pay");
  return promos;
}

export default function FloatingCart() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"cart" | "checkout">("cart");
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [items, setItems] = useState<CartItem[]>([]);
  const debug = process.env.NEXT_PUBLIC_DEBUG_CHECKOUT === "true";
  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  useEffect(() => {
    // Cargar carrito de localStorage y suscribirse a cambios
    setItems(getCart());
    const off = onCartUpdated(() => setItems(getCart()));
    // También escuchar storage (otro tab) como fallback
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cart_items") setItems(getCart());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      off();
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const promos = getPromotions(subtotal);

  useEffect(() => {
    // Prefetch de la ruta de checkout para reducir la latencia en navegación
    try {
      router.prefetch("/checkout");
    } catch {}
  }, [router]);

  const handleCheckoutSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkoutStatus === "submitting") return;
    setCheckoutStatus("submitting");
    setTimeout(() => {
      setCheckoutStatus("success");
    }, 1200);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Abrir carrito"
          className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black text-white shadow-xl hover:opacity-90 hover:scale-105 active:scale-95 focus:outline-none transition-all"
        >
          <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content asChild>
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full sm:max-w-md md:max-w-lg overflow-y-auto border-l border-black/10 bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                {stage === "checkout" && (
                  <button
                    className="rounded-full border border-black/10 p-1 text-xs"
                    onClick={() => {
                      setStage("cart");
                      setCheckoutStatus("idle");
                    }}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                )}
                <Dialog.Title>{stage === "cart" ? "Carrito" : "Checkout seguro"}</Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button aria-label="Cerrar" className="rounded p-1 hover:bg-black/5">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              Panel lateral de carrito y checkout seguro; contiene el listado de productos, subtotal, promociones y acciones para pagar.
            </Dialog.Description>

            {stage === "cart" ? (
              <div className="space-y-4 p-4">
                {items.length === 0 && (
                  <p className="text-sm text-black/70">Tu bolsa está vacía.</p>
                )}
                {items.map((item) => {
                  const preview = item.image || getCachedImageForTitle(item.title);
                  return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-[72px] w-[72px] overflow-hidden rounded bg-foreground/[0.03]">
                      {preview ? (
                        <img src={preview} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-[10px] text-foreground/50">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-black/60">Talle {item.size}</p>
                      <p className="text-sm">{formatARS(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">x{item.qty}</div>
                      <button
                        aria-label="Eliminar producto"
                        className="rounded p-1 hover:bg-black/5"
                        onClick={() => {
                          if (debug) console.log("[Cart] remove", { id: item.id });
                          removeFromCart(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  );
                })}

                <div className="mt-2 border-t border-black/10 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatARS(subtotal)}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <button
                    className="rounded-md border border-black/20 px-3 py-2 text-xs hover:bg-black/5 disabled:opacity-60"
                    onClick={() => {
                      if (items.length === 0) return;
                      if (debug) console.log("[Cart] clearCart");
                      clearCart();
                    }}
                    disabled={items.length === 0}
                  >
                    Vaciar carrito
                  </button>
                </div>

                <div className="rounded-md border border-black/10 bg-black/[.03] p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <CreditCard className="h-4 w-4" />
                    Medios de pago
                  </div>
                  <ul className="space-y-1 text-xs">
                    <li>Mercado Pago (link o QR inmediato)</li>
                    <li>Cuenta DNI / Personal Pay (10% OFF)</li>
                    <li>Transferencia bancaria (Alias: MCO.MENSWEAR.AR)</li>
                  </ul>
                  <div className="mt-2 text-xs text-black/70">
                    Promociones vigentes:
                    <ul className="ml-4 list-disc">
                      {promos.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  className="mt-2 w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  disabled={subtotal <= 0}
                  onClick={() => {
                    const amount = subtotal > 0 ? subtotal : 0;
                    // Generar y propagar traceId para correlacionar cliente ↔ backend
                    const traceId = typeof crypto !== "undefined" && (crypto as any).randomUUID
                      ? (crypto as any).randomUUID()
                      : `trace-${Date.now()}`;
                    const cartSummary = items.map((it) => ({ id: it.id, qty: it.qty, price: it.price }));
                    try {
                      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("checkout_email") : null;
                      const emailParam = storedEmail ? `&email=${encodeURIComponent(storedEmail)}` : "";
                      if (debug) console.log("[Cart] Ir a pagar clicked", { subtotal, amount, storedEmail, traceId, cartSummary });
                      try {
                        sessionStorage.setItem("checkout_trace_id", traceId);
                      } catch {}
                      setOpen(false);
                      const url = `/checkout?amount=${amount}${emailParam}&traceId=${encodeURIComponent(traceId)}`;
                      if (debug) console.log("[Cart] Dialog cerrado, navegando a /checkout", { url });
                      const prevPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
                      router.push(url);
                      // Fallback: si el router no navega en ~1s, forzar navegación
                      setTimeout(() => {
                        const sameLocation = typeof window !== "undefined" && (window.location.pathname + window.location.search) === prevPath;
                        if (sameLocation) {
                          if (debug) console.warn("[Cart] Fallback navigation via window.location", { url });
                          try {
                            window.location.assign(url);
                          } catch {
                            window.location.href = url;
                          }
                        }
                      }, 1000);
                    } catch (err) {
                      if (debug) console.warn("[Cart] Error preparando navegación", err);
                      setOpen(false);
                      const url = `/checkout?amount=${amount}&traceId=${encodeURIComponent(traceId)}`;
                      const prevPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
                      router.push(url);
                      setTimeout(() => {
                        const sameLocation = typeof window !== "undefined" && (window.location.pathname + window.location.search) === prevPath;
                        if (sameLocation) {
                          if (debug) console.warn("[Cart] Fallback navigation via window.location (no email)", { url });
                          try {
                            window.location.assign(url);
                          } catch {
                            window.location.href = url;
                          }
                        }
                      }, 1000);
                    }
                  }}
                >
                  {subtotal > 0 ? "Ir a pagar" : "Agrega productos para pagar"}
                </button>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                <div className="rounded-md border border-black/10 bg-white p-4">
                  <p className="text-[11px] uppercase tracking-wide text-black/60">Resumen</p>
                  <p className="text-2xl font-semibold">{formatARS(subtotal)}</p>
                  <ul className="mt-3 space-y-2 text-xs text-black/70">
                    <li><strong>Mercado Pago:</strong> link de cobro inmediato. 3 y 6 cuotas sin interés confirmadas.</li>
                    <li><strong>Cuenta DNI / Personal Pay:</strong> 10% OFF automático + reintegro bancario los martes.</li>
                    <li><strong>Transferencia bancaria:</strong> Alias <span className="font-semibold">MCO.MENSWEAR.AR</span> (Banco Nación).</li>
                  </ul>
                </div>

                <form className="space-y-3 text-xs" onSubmit={handleCheckoutSubmit}>
                  <div className="grid gap-2">
                    <label className="text-black/70">Nombre y apellido</label>
                    <input required className="rounded-md border border-black/20 px-3 py-2" placeholder="Ej: Matías Cortez" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-black/70">Correo electrónico</label>
                    <input required type="email" className="rounded-md border border-black/20 px-3 py-2" placeholder="correo@ejemplo.com" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-black/70">WhatsApp (para link de pago)</label>
                    <input required className="rounded-md border border-black/20 px-3 py-2" placeholder="+54 11 5555 5555" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-black/70">Medio elegido</label>
                    <select className="rounded-md border border-black/20 px-3 py-2" defaultValue="Mercado Pago">
                      <option>Mercado Pago</option>
                      <option>Cuenta DNI</option>
                      <option>Personal Pay</option>
                      <option>Transferencia bancaria</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    disabled={checkoutStatus === "submitting"}
                  >
                    {checkoutStatus === "submitting" ? "Procesando datos…" : "Enviar datos para pagar"}
                  </button>
                  {checkoutStatus === "success" && (
                    <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Listo, en minutos te enviamos el link o las instrucciones según el medio elegido.
                    </p>
                  )}
                </form>
              </div>
            )}
          </motion.aside>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
