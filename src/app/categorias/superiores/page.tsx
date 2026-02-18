import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";

export default function SuperioresPage() {
  const list = products.filter((p) => p.category === "superiores");
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Banner de Oferta */}
      <div className="mb-6 sm:mb-8">
        <HeroBanner
          title="NUEVA COLECCIÓN"
          subtitle="Camisas y buzos premium con 30% de descuento • Texturas de calidad superior"
          ctaText="DESCUBRIR"
          ctaLink="/categorias/superiores"
          backgroundImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80"
          overlayIntensity="heavy"
          height="small"
        />
      </div>

      <h1 className="section-title text-base sm:text-lg">Superiores</h1>
      <p className="mt-2 text-xs sm:text-sm text-muted">Camisas, remeras, buzos, camperas y más.</p>
      
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
            title="NUEVOS ARRIVALS"
            subtitle="Las últimas tendencias en moda masculina ya están aquí"
            ctaText="DESCUBRIR"
            ctaLink="/categorias/superiores"
            backgroundImage="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1600&q=80"
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
