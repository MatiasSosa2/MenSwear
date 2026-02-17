"use client";

import { useState } from "react";
import { Product, Size, formatARS } from "@/data/products";
import { addToCart, CartItem } from "@/lib/cart";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [size, setSize] = useState<Size | null>(null);
  const [colorIndex, setColorIndex] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [adding, setAdding] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const color = product.colors[colorIndex];
  const stockMap: Record<Size, number> = { S: 5, M: 2, L: 8, XL: 3, XXL: 1 } as const;

  return (
    <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium">Talle</p>
          <button className="text-xs sm:text-sm underline-offset-2 hover:underline" onClick={() => setShowSizeGuide(true)}>Find my Size</button>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5 sm:gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-sm border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                size === s ? "border-foreground bg-foreground text-background scale-105" : "border-foreground/30 bg-background hover:border-foreground/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {size && stockMap[size] <= 3 && (
          <p className="mt-2 text-[10px] sm:text-[11px] text-orange-600 font-medium">Últimas {stockMap[size]} unidades en este talle</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium">Color</p>
          <p className="text-[10px] sm:text-[11px] text-foreground/60">{`Color: ${color.name}`}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
          {product.colors.map((c, idx) => (
            <button
              key={c.name}
              onClick={() => setColorIndex(idx)}
              aria-label={c.name}
              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 transition-all ${
                colorIndex === idx ? "border-foreground scale-110 shadow-md" : "border-foreground/30 hover:border-foreground/50"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs sm:text-sm font-medium">Cantidad</p>
        <div className="mt-2 inline-flex items-center gap-2 sm:gap-3">
          <button
            className="rounded-sm border border-foreground/30 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-medium hover:bg-foreground/5 active:scale-95 transition-all"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            -
          </button>
          <span className="min-w-[32px] sm:min-w-[40px] text-center text-sm sm:text-base font-semibold">{qty}</span>
          <button
            className="rounded-sm border border-foreground/30 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-medium hover:bg-foreground/5 active:scale-95 transition-all"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>
      </div>

      <button
        className="w-full rounded-md sm:rounded-none bg-foreground px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        disabled={!size || adding}
        onClick={() => {
          setAdding(true);
          setTimeout(() => {
            // Añadir al carrito en localStorage
            if (size) {
              const id = `${product.slug}-${size}-${product.colors[colorIndex]?.name || "default"}`;
              const item: CartItem = {
                id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                size,
                color: product.colors[colorIndex]?.name,
                image: product.images[0],
                qty,
              };
              addToCart(item);
            }
            // Abrir carrito lateral disparando el trigger existente si está en el DOM
            const btn = document.querySelector('button[aria-label="Abrir carrito"]') as HTMLButtonElement | null;
            btn?.click();
            setAdding(false);
          }, 600);
        }}
      >
        {adding ? "Añadiendo…" : "AÑADIR A LA BOLSA"} — {formatARS(product.price * qty)}
      </button>

      {showSizeGuide && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3 sm:p-4" onClick={() => setShowSizeGuide(false)}>
          <div className="w-full max-w-md rounded-lg border border-foreground/10 bg-background p-4 sm:p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm sm:text-base font-semibold">Guía rápida de talles</p>
            <p className="mt-2 text-xs sm:text-sm text-foreground/70 leading-relaxed">Ingresá tu altura y peso para una sugerencia aproximada.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
              <input className="rounded-md border border-foreground/20 px-3 py-2.5 text-xs sm:text-sm" placeholder="Altura (cm)" type="number" />
              <input className="rounded-md border border-foreground/20 px-3 py-2.5 text-xs sm:text-sm" placeholder="Peso (kg)" type="number" />
            </div>
            <div className="mt-4 flex justify-end gap-2 sm:gap-3">
              <button className="rounded-md px-4 py-2 text-xs sm:text-sm text-foreground hover:bg-foreground/5 transition-colors" onClick={() => setShowSizeGuide(false)}>Cerrar</button>
              <button className="rounded-md bg-foreground px-4 py-2 text-xs sm:text-sm text-background hover:opacity-90 transition-opacity font-medium" onClick={() => setShowSizeGuide(false)}>Sugerir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
