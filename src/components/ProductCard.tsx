// Imágenes deshabilitadas: usamos un placeholder visual sin imagen
import Link from "next/link";
import { formatARS, Product } from "@/data/products";
import { getCachedImageForTitle } from "@/lib/images";

export default function ProductCard({ product }: { product: Product }) {
  if (!product.slug) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Producto sin slug", product);
    }
    return null;
  }

  return (
    <Link href={`/product/${encodeURIComponent(product.slug)}`} className="group block h-full" prefetch>
      {/* Marco con borde degradado sutil (grises y beige) */}
      <div className="relative rounded-lg sm:rounded-xl p-[1px] bg-gradient-to-br from-[#EDE3D4] via-[#D1D5DB] to-[#9CA3AF] h-full">
        {/* Tarjeta tipo "glass" elegante */}
        <div className="relative rounded-[11px] bg-white/80 backdrop-blur-sm h-full flex flex-col">
          {/* Lienzo visual (placeholder sin imagen) */}
          <div className="relative aspect-square overflow-hidden rounded-t-[11px] flex-shrink-0">
            {/* Hairline superior */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#D1D5DB] via-[#E3D3BE] to-black/20" />
            {(() => {
              const manual = product.images && product.images.length > 0 ? product.images[0] : null;
              const url = manual || getCachedImageForTitle(product.title);
              if (url) {
                return (
                  <img src={url} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
                );
              }
              return (
                <>
                  {/* Fondo técnico con patrón */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7F2] to-[#E5E7EB]" />
                  <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,#9ca3af_1px,transparent_1px)] [background-size:16px_16px]" />
                  {/* Elemento decorativo diagonal */}
                  <div className="absolute -left-10 top-1/4 h-40 w-40 rotate-12 rounded-xl bg-gradient-to-br from-black/10 to-black/20 blur-sm" />
                  {/* Texto placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] tracking-widest text-gray-500">MENSWEAR</span>
                  </div>
                </>
              );
            })()}
            {/* Overlay de acción al hover */}
              {/* Overlay de acción al hover (solo md+) */}
              <div className="absolute inset-0 hidden md:flex md:items-end md:justify-end md:p-3 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100">
              <span className="rounded-sm bg-black px-3 py-1.5 text-[11px] font-semibold text-white">VER DETALLE</span>
            </div>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="grid gap-2 p-2.5 sm:p-3 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs sm:text-[12px] font-semibold text-gray-900 leading-tight line-clamp-2 flex-1">{product.title}</p>
              <span className="rounded-full border border-gray-300 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] text-gray-600 whitespace-nowrap flex-shrink-0">{product.category.replace("-", " ")}</span>
            </div>
            <div className="hairline" />
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs sm:text-sm font-bold text-gray-900">{formatARS(product.price)}</span>
              <div className="hidden sm:flex items-center gap-1">
                {product.sizes.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-sm border border-gray-300 px-1.5 py-0.5 text-[10px] sm:text-[11px] text-gray-700">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Brillo al hover (solo md+) */}
        <div className="pointer-events-none absolute inset-0 rounded-xl md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100 bg-gradient-to-t from-white/0 via-white/20 to-white/40" />
      </div>
    </Link>
  );
}
