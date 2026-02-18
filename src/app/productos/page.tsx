"use client";

import { products, Size, Product, formatARS } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";
import { useMemo, useState } from "react";

export default function ProductosPage() {
  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Array<Product["category"]>>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc">("relevance");
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const catOk = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const sizeOk = selectedSizes.length === 0 || selectedSizes.some((s) => p.sizes.includes(s));
      const colorOk = selectedColors.length === 0 || selectedColors.some((c) => p.colors.map((cc) => cc.name).includes(c));
      const minOk = minPrice === "" || p.price >= (minPrice as number);
      const maxOk = maxPrice === "" || p.price <= (maxPrice as number);
      return catOk && sizeOk && colorOk && minOk && maxOk;
    });

    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [selectedCategories, selectedSizes, selectedColors, minPrice, maxPrice, sortBy]);

  function toggleSize(size: Size) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function toggleCategory(cat: Product["category"]) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleColor(colorName: string) {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  }

  function clearAll() {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      {/* Banner Principal */}
      <div className="mb-6 sm:mb-8">
        <HeroBanner
          title="MEGA SALE 50% OFF"
          subtitle="Descuentos exclusivos en toda la tienda • Hasta 6 cuotas sin interés • Todas las categorías"
          ctaText="EXPLORAR OFERTAS"
          ctaLink="/productos"
          backgroundImage="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1920&q=80"
          overlayIntensity="heavy"
          height="medium"
        />
      </div>

      <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">
        {/* Panel de filtros móvil */}
        <div className="lg:hidden">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="w-full btn-outline text-xs sm:text-sm py-2.5 sm:py-3"
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? "Ocultar filtros" : "Filtrar y ordenar"}
          </button>
          {filtersOpen && (
            <div className="mt-3 panel">
              {/* Reutilizamos bloques del sidebar */}
              <div className="p-4">
                <p className="text-sm font-medium">Categorías</p>
                <div className="mt-2 space-y-2">
                  {["inferiores", "superiores", "ropa-interior", "summer"].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat as Product["category"])}
                        onChange={() => toggleCategory(cat as Product["category"]) }
                      />
                      <span className="capitalize">{cat.replace("-", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rule" />
              <div className="p-4">
                <p className="text-sm font-medium">Precio</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input type="number" inputMode="numeric" placeholder="Mín." className="rounded-md border-soft bg-surface px-3 py-2 text-sm" value={minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "") } />
                  <input type="number" inputMode="numeric" placeholder="Máx." className="rounded-md border-soft bg-surface px-3 py-2 text-sm" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "") } />
                </div>
              </div>
              <div className="rule" />
              <div className="p-4">
                <p className="text-sm font-medium">Talle</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {["S", "M", "L", "XL", "XXL"].map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedSizes.includes(s as Size)} onChange={() => toggleSize(s as Size)} />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rule" />
              <div className="p-4">
                <p className="text-sm font-medium">Color</p>
                <div className="mt-2 space-y-2">
                  {Array.from(new Set(products.flatMap((p) => p.colors.map((c) => c.name)))).map((name) => (
                    <label key={name} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedColors.includes(name)} onChange={() => toggleColor(name)} />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rule" />
              <div className="p-4 flex items-center gap-2">
                <button onClick={clearAll} className="btn-outline">Limpiar filtros</button>
                <div className="ml-auto">
                  <label className="mr-2 text-xs text-muted">Ordenar</label>
                  <select className="rounded-md border-soft bg-surface px-3 py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                    <option value="relevance">Relevancia</option>
                    <option value="price_asc">Menor precio</option>
                    <option value="price_desc">Mayor precio</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Sidebar estilo Mercado Libre (oculto en móvil) */}
        <aside className="hidden md:block md:sticky md:top-16">
          <div className="panel">
            {/* Categorías */}
            <div className="p-4">
              <p className="text-sm font-medium">Categorías</p>
              <div className="mt-2 space-y-2">
                {["inferiores", "superiores", "ropa-interior", "summer"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat as Product["category"])}
                      onChange={() => toggleCategory(cat as Product["category"]) }
                    />
                    <span className="capitalize">{cat.replace("-", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="rule" />

            {/* Precio */}
            <div className="p-4">
              <p className="text-sm font-medium">Precio</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Mín."
                  className="rounded-md border-soft bg-surface px-3 py-2 text-sm"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Máx."
                  className="rounded-md border-soft bg-surface px-3 py-2 text-sm"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                />
              </div>
            </div>
            <div className="rule" />

            {/* Talle */}
            <div className="p-4">
              <p className="text-sm font-medium">Talle</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {["S", "M", "L", "XL", "XXL"].map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(s as Size)}
                      onChange={() => toggleSize(s as Size)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="rule" />

            {/* Color */}
            <div className="p-4">
              <p className="text-sm font-medium">Color</p>
              <div className="mt-2 space-y-2">
                {Array.from(new Set(products.flatMap((p) => p.colors.map((c) => c.name)))).map((name) => (
                  <label key={name} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(name)}
                      onChange={() => toggleColor(name)}
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="rule" />
            <div className="p-4">
              <button onClick={clearAll} className="btn-outline">Limpiar filtros</button>
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <main>
          {/* Barra superior: chips y orden (oculta en móvil si filtros cerrados) */}
          <div className={`flex flex-wrap items-center justify-between gap-4 ${filtersOpen ? "" : "hidden md:flex"}`}>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((c) => (
                <span key={c} className="chip inline-flex items-center gap-2 text-xs">
                  {c.replace("-", " ")}
                  <button className="text-foreground/60" onClick={() => toggleCategory(c)}>✕</button>
                </span>
              ))}
              {selectedSizes.map((s) => (
                <span key={s} className="chip inline-flex items-center gap-2 text-xs">
                  Talle {s}
                  <button className="text-foreground/60" onClick={() => toggleSize(s)}>✕</button>
                </span>
              ))}
              {selectedColors.map((name) => (
                <span key={name} className="chip inline-flex items-center gap-2 text-xs">
                  {name}
                  <button className="text-foreground/60" onClick={() => toggleColor(name)}>✕</button>
                </span>
              ))}
              {(minPrice !== "" || maxPrice !== "") && (
                <span className="chip inline-flex items-center gap-2 text-xs">
                  Precio {minPrice !== "" ? `≥ ${formatARS(minPrice as number)}` : ""} {maxPrice !== "" ? `≤ ${formatARS(maxPrice as number)}` : ""}
                  <button className="text-foreground/60" onClick={() => { setMinPrice(""); setMaxPrice(""); }}>✕</button>
                </span>
              )}
            </div>
            <div className="ml-auto">
              <label className="mr-2 text-xs text-muted">Ordenar</label>
              <select
                className="rounded-md border-soft bg-surface px-3 py-2 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="relevance">Relevancia</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted">Mostrando {filtered.length} de {products.length}</p>
            <p className="text-xs sm:text-sm font-medium">{formatARS(filtered.reduce((acc, p) => acc + p.price, 0) / (filtered.length || 1))} promedio</p>
          </div>

          {/* Primera mitad de productos */}
          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(0, Math.ceil(filtered.length / 2)).map((p: Product) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>

          {/* Banner en medio de productos */}
          {filtered.length > 6 && (
            <div className="my-6 sm:my-8 md:my-10">
              <HeroBanner
                title="ENVÍO GRATIS"
                subtitle="En compras mayores a $50.000 • Recibilo en 24/48hs • Seguimiento online"
                ctaText="SEGUIR COMPRANDO"
                ctaLink="/productos"
                backgroundImage="https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=1920&q=80"
                overlayIntensity="heavy"
                height="small"
              />
            </div>
          )}

          {/* Segunda mitad de productos */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(Math.ceil(filtered.length / 2)).map((p: Product) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
