import { Product } from "@/data/products";
import { getCachedImageForTitle } from "@/lib/images";

export default function ProductSlide({ product }: { product: Product }) {
  const manual = product.images && product.images.length > 0 ? product.images[0] : null;
  const url = manual || getCachedImageForTitle(product.title);
  return (
    <article className="group rounded-md overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.06)]">
      <div className="relative h-[28rem] sm:h-[32rem] bg-foreground/[0.03]">
        {url ? (
          <img src={url} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-muted">Sin imagen</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4 bg-white">
        <p className="text-sm font-semibold line-clamp-1">{product.title}</p>
        <span className="text-sm font-bold">{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(product.price)}</span>
      </div>
    </article>
  );
}
