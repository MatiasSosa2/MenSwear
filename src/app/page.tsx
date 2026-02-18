import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { getCachedImageForTitle } from "@/lib/images";
import Carousel from "@/components/Carousel";
import ProductSlide from "@/components/ProductSlide";
import OfferBanner from "@/components/OfferBanner";
import HeroBanner from "@/components/HeroBanner";
import SectionBanner from "@/components/SectionBanner";

export default function Home() {
  return (
    <div>
      {/* Hero Banner con imagen premium de Unsplash */}
      <HeroBanner
        title="Nueva Colección Premium"
        subtitle="Diseño minimalista y calidad premium en cada fibra. Descubrí prendas que redefinen tu estilo."
        ctaText="EXPLORAR COLECCIÓN"
        ctaLink="/productos"
        backgroundImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80"
        overlayIntensity="medium"
        height="hero"
      />

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

        {/* Banners de Categoría con Imágenes */}
        <section className="my-16 sm:my-20 md:my-24">
          <h2 className="section-title text-muted text-xs sm:text-sm mb-4 sm:mb-6">Destacados por Categoría</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <SectionBanner
              title="Superiores Premium"
              description="Camisas Oxford, sweaters de cashmere y lino mercenizado. Texturas que hablan de calidad."
              ctaText="VER SUPERIORES"
              ctaLink="/categorias/superiores"
              backgroundImage="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1600&q=80"
              textAlign="left"
            />
            <SectionBanner
              title="Inferiores Urbanos"
              description="Selvedge denim, chinos sastrero y joggers de gabardina. Para cada ocasión."
              ctaText="VER INFERIORES"
              ctaLink="/categorias/inferiores"
              backgroundImage="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1920&q=80"
              textAlign="right"
            />
          </div>
        </section>

        {/* Banner Mega Sale Premium */}
        <section className="my-16 sm:my-20 md:my-24">
          <HeroBanner
            title="Mega Sale 50% OFF"
            subtitle="Descuentos exclusivos en toda la tienda • Hasta 6 cuotas sin interés • Stock limitado"
            ctaText="VER OFERTAS"
            ctaLink="/productos"
            backgroundImage="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1920&q=80"
            overlayIntensity="heavy"
            height="medium"
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
