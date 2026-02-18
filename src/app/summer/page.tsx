import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";

export default function SummerPage() {
  const list = products.filter((p) => p.category === "summer");
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Banner de Oferta */}
      <div className="mb-6 sm:mb-8">
        <HeroBanner
          title="SUMMER SALE"
          subtitle="Descuentos de hasta 60% en toda la colección de verano • Protección UV + Estilo"
          ctaText="VER TODO"
          ctaLink="/summer"
          backgroundImage="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1920&q=80"
          overlayIntensity="heavy"
          height="small"
        />
      </div>

      <h1 className="section-title text-base sm:text-lg">Summer Edition</h1>
      <p className="mt-2 text-xs sm:text-sm text-muted">Resort, UV y accesorios para el verano.</p>
      
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
            title="🌴 VERANO 2026"
            subtitle="Protección UV + Estilo • Perfectos para la playa o la ciudad"
            ctaText="COMPRAR AHORA"
            ctaLink="/summer"
            backgroundImage="https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=1920&q=80"
            overlayIntensity="heavy"
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
