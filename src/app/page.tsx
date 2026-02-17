import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { getCachedImageForTitle } from "@/lib/images";
import Carousel from "@/components/Carousel";
import ProductSlide from "@/components/ProductSlide";
import OfferBanner from "@/components/OfferBanner";

export default function Home() {
  return (
    <div>
      {/* Hero: usar la imagen adjunta en public/hero.jpg */}
      <section className="relative h-[60vh] sm:h-[75vh] md:h-[85vh] lg:h-[90vh] w-full overflow-hidden rounded-b-2xl sm:rounded-b-3xl md:rounded-b-[3rem]">
        <img src="/hero.jpg" alt="Hero fashion" className="absolute inset-0 h-full w-full object-cover" />
      </section>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
        {/* Banner Principal */}
        <section className="my-6 sm:my-8 md:my-10">
          <OfferBanner
            title="MEGA SALE 50% OFF"
            subtitle="Descuentos exclusivos en toda la tienda • Cuotas sin interés"
            ctaText="EXPLORAR OFERTAS"
            ctaLink="/productos"
            variant="navy"
          />
        </section>

        {/* Novedades */}
        <section className="my-16 sm:my-20 md:my-24">
          <h2 className="section-title text-muted text-xs sm:text-sm">Novedades</h2>
          <div className="mt-3 sm:mt-4">
            <Carousel itemsPerView={3}>
              {products.slice(0, 6).map((p) => (
                <ProductSlide key={p.slug} product={p} />
              ))}
            </Carousel>
          </div>
        </section>

        {/* Categorías */}
        <section className="my-16 sm:my-20 md:my-24">
          <h2 className="section-title text-muted text-xs sm:text-sm">Categorías</h2>
          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-4">
            {[
              { title: "Inferiores", slug: "inferiores" },
              { title: "Superiores", slug: "superiores" },
              { title: "Ropa Interior", slug: "ropa-interior" },
              { title: "Summer Edition", slug: "summer" },
            ].map((c) => {
              const rep = products.find((p) => p.category === c.slug);
              const img = rep && rep.images && rep.images.length > 0 ? rep.images[0] : (rep ? getCachedImageForTitle(rep.title) : null);
              return (
                <a key={c.title} href={`/categorias/${c.slug}`} className="group cursor-pointer">
                  <div className="relative h-24 sm:h-28 md:h-32 lg:h-36 w-full overflow-hidden rounded-md card transition-transform duration-300 group-hover:scale-[1.02]">
                    {img ? (
                      <img src={img} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-muted">
                        <span className="text-xs text-muted">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-center text-xs sm:text-sm font-medium">{c.title}</div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Banner Secundario */}
        <section className="my-12 sm:my-16 md:my-20">
          <OfferBanner
            title="ENVÍO GRATIS EN 24/48HS"
            subtitle="En compras mayores a $50.000 • Recibí tu pedido donde estés"
            ctaText="COMPRAR AHORA"
            ctaLink="/productos"
            variant="red"
            small
          />
        </section>

        {/* Promos y Descuentos */}
        <section className="my-12 sm:my-16 md:my-20">
          <h2 className="text-center text-lg sm:text-xl md:text-2xl section-title" style={{ fontFamily: "var(--font-display)" }}>
            Promociones destacadas
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-foreground/70">Aprovechá los descuentos de temporada</p>
          <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Hasta 40% OFF", href: "/productos", category: "superiores" },
              { title: "2x1 en básicos", href: "/categorias/ropa-interior", category: "ropa-interior" },
              { title: "Envío GRATIS 24hs", href: "/categorias/inferiores", category: "inferiores" },
            ].map((c) => (
              <a key={c.title} href={c.href} className="group relative block overflow-hidden rounded-md card transition-transform duration-300 hover:scale-[1.02]">
                <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 w-full">
                  {(() => {
                    const rep = products.find((p) => p.category === c.category);
                    const img = rep && rep.images && rep.images.length > 0 ? rep.images[0] : (rep ? getCachedImageForTitle(rep.title) : null);
                    if (img) {
                      return <img src={img} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />;
                    }
                    return (
                      <div className="h-full w-full bg-surface-muted flex items-center justify-center">
                        <span className="text-sm text-muted">Sin imagen</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                  <span className="rounded-md bg-white/90 px-3 py-1 text-sm font-bold">{c.title}</span>
                  <span className="text-xs text-white">Ver más →</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
