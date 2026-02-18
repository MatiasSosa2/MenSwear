import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";

export default function InferioresPage() {
  const list = products.filter((p) => p.category === "inferiores");
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Banner de Oferta */}
      <div className="mb-6 sm:mb-8">
        <HeroBanner
          title="INFERIORES 40% OFF"
          subtitle="Jeans, pantalones y joggers en oferta por tiempo limitado"
          ctaText="COMPRAR AHORA"
          ctaLink="/categorias/inferiores"
          backgroundImage="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1920&q=80"
          overlayIntensity="heavy"
          height="small"
        />
      </div>

      <h1 className="section-title text-base sm:text-lg">Inferiores</h1>
      <p className="mt-2 text-xs sm:text-sm text-muted">Pantalones, jeans, joggers y más.</p>
      
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
            title="3 CUOTAS SIN INTERÉS"
            subtitle="En todos los medios de pago • Para compras superiores a $30.000"
            ctaText="VER MÁS"
            ctaLink="/categorias/inferiores"
            backgroundImage="https://images.unsplash.com/photo-1542272604-787c3835535d?w=1920&q=80"
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
