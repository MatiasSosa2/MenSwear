// Imágenes deshabilitadas: usamos placeholders
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, formatARS } from "@/data/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import { ChevronRight, Shield, Truck, Flag } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import { Suspense } from "react";
import { getCachedImageForTitle } from "@/lib/images";

type ProductPageParams = { slug?: string };
type ProductPageProps = { params: ProductPageParams | Promise<ProductPageParams> };

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slugParam = resolvedParams?.slug ?? "";
  const decodedSlug = typeof slugParam === "string" ? decodeURIComponent(slugParam) : "";
  const product = products.find((p) => p.slug === decodedSlug);
  if (!product) {
    if (process.env.NODE_ENV !== "production") {
      return (
        <div className="mx-auto max-w-2xl px-4 py-10 text-sm">
          <p className="font-semibold">Debug: producto no encontrado</p>
          <p className="mt-1 text-foreground/70">slug recibido: {slugParam || "(vacío)"}</p>
          <p className="text-foreground/70">slug decodificado: {decodedSlug || "(vacío)"}</p>
          <p className="mt-3">Slugs disponibles (primeros 5):</p>
          <ul className="list-disc pl-5 text-foreground/70">
            {products.slice(0, 5).map((p) => (
              <li key={p.slug}>{p.slug}</li>
            ))}
          </ul>
        </div>
      );
    }
    return notFound();
  }

  const cached = getCachedImageForTitle(product.title);
  const images = (product.images && product.images.length > 0)
    ? product.images
    : (cached ? [cached] : []);

  const cuotas6 = Math.round(product.price / 6);
  const categoryLabel = product.category.replace("-", " ");

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      {/* Breadcrumbs */}
      <nav className="mb-2 sm:mb-3 flex items-center gap-1 text-[10px] sm:text-xs text-muted overflow-x-auto hide-scrollbar">
        <Link href="/" className="whitespace-nowrap">Inicio</Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
        <Link href={`/categorias/${product.category}`} className="capitalize whitespace-nowrap">{categoryLabel}</Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
        <span className="truncate" title={product.title}>{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
        {/* Galería sticky con miniaturas verticales */}
        <div className="md:sticky md:top-20 lg:top-24 md:self-start">
          <Suspense fallback={<div className="aspect-square bg-surface-muted rounded-lg animate-pulse" />}>
            <ProductGallery images={images} title={product.title} />
          </Suspense>
        </div>

        {/* Encabezado + Selectores + CTA + Acordeones + Trust */}
        <div>
          <h1 className="section-title text-base sm:text-lg">{product.title}</h1>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <p className="text-lg sm:text-xl font-semibold">{formatARS(product.price)}</p>
            <span className="text-xs sm:text-sm text-muted">6 cuotas sin interés de {formatARS(cuotas6)}</span>
          </div>

          <ProductDetailClient product={product} />

          {/* Trust box */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 panel p-2.5 sm:p-3 text-[10px] sm:text-[11px] text-muted">
            <div className="inline-flex items-center gap-1.5 sm:gap-2"><Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> <span>Pago Seguro</span></div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2"><Truck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> <span>Envío Express</span></div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2"><Flag className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> <span>Industria Nacional</span></div>
          </div>

          {/* Acordeones minimalistas */}
          <div className="mt-4 sm:mt-6 space-y-2">
            <details className="panel p-2.5 sm:p-3">
              <summary className="cursor-pointer text-xs sm:text-sm font-medium">Descripción del Diseñador</summary>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">Calce pensado para el uso urbano premium, con materiales seleccionados para máxima comodidad y durabilidad.</p>
            </details>

            <details className="panel p-2.5 sm:p-3">
              <summary className="cursor-pointer text-xs sm:text-sm font-medium">Composición y Cuidados</summary>
              <ul className="mt-2 list-disc pl-4 sm:pl-5 text-xs sm:text-sm text-muted space-y-1">
                <li>Lavado a mano o ciclo delicado</li>
                <li>No usar cloro</li>
                <li>Secado a la sombra</li>
              </ul>
            </details>

            <details className="panel p-2.5 sm:p-3">
              <summary className="cursor-pointer text-xs sm:text-sm font-medium">Envío y Devoluciones</summary>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">Cambios gratis por 30 días. Envío prioritario en CABA y GBA en 24hs.</p>
            </details>
          </div>

          {/* Cross-selling */}
          {related.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <h3 className="text-xs sm:text-sm font-semibold">Combinado con…</h3>
              <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-3">
                {related.map((r) => {
                  const manualRel = r.images && r.images.length > 0 ? r.images[0] : null;
                  const cachedRel = getCachedImageForTitle(r.title);
                  const relUrl = manualRel || cachedRel;
                  return (
                    <Link key={r.slug} href={`/product/${encodeURIComponent(r.slug)}`} className="group">
                      <div className="overflow-hidden card">
                        <div className="relative aspect-square">
                          {relUrl ? (
                            <img src={relUrl} alt={r.title} className="absolute inset-0 h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-foreground/[0.03]">
                              <span className="text-xs text-muted">Imagen no disponible</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-1 text-xs text-muted">{r.title}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
