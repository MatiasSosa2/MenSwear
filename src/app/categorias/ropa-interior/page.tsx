import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";

export default function RopaInteriorPage() {
  const list = products.filter((p) => p.category === "ropa-interior");
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Banner de Oferta */}
      <div className="mb-6 sm:mb-8">
        <HeroBanner
          title="2x1 EN BÁSICOS"
          subtitle="Llevá el doble por el mismo precio • Oferta válida en toda la sección"
          ctaText="APROVECHAR OFERTA"
          ctaLink="/categorias/ropa-interior"
          backgroundImage="https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=1600&q=80"
          overlayIntensity="heavy"
          height="small"
        />
      </div>

      <h1 className="section-title text-base sm:text-lg">Ropa Interior</h1>
      <p className="mt-2 text-xs sm:text-sm text-muted">Boxers, medias, remeras interiores.</p>
      
      {/* Primera mitad */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.slice(0, Math.ceil(list.length / 2)).map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {/* Banner intermedio */}
      {list.length > 6 && (
        <div className="my-6 sm:my-8">
          <HeroBanner
            title="PACK X6 ESPECIAL"
            subtitle="Llevá 6 unidades y ahorrá hasta 50% • Calidad premium"
            ctaText="ARMAR MI PACK"
            ctaLink="/categorias/ropa-interior"
            backgroundImage="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1920&q=80"
            overlayIntensity="medium"
            height="small"
          />
        </div>
      )}

      {/* Segunda mitad */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.slice(Math.ceil(list.length / 2)).map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
