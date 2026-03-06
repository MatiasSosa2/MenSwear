"use client";
import { useEffect, useState, useCallback } from "react";

type ProductStock = {
  slug: string;
  title: string;
  category: string;
  price: number;
  sizes: string[];
  sizeStocks: Record<string, number>;
  total: number;
};

const categoryLabels: Record<string, string> = {
  superiores: "Superiores",
  inferiores: "Inferiores",
  "ropa-interior": "Ropa interior",
  summer: "Summer",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function StockPage() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // "slug-size"
  const [saved, setSaved] = useState<string | null>(null);
  // edits: { "slug|size": newQuantity }
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stock");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const key = (slug: string, size: string) => `${slug}|${size}`;

  const handleEdit = (slug: string, size: string, value: number) => {
    setEdits((prev) => ({ ...prev, [key(slug, size)]: value }));
  };

  const handleSave = async (slug: string, size: string) => {
    const k = key(slug, size);
    const quantity = edits[k];
    if (quantity === undefined) return;

    setSaving(k);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, size, quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) =>
            p.slug === slug
              ? { ...p, sizeStocks: updated.sizeStocks, total: updated.total }
              : p
          )
        );
        setEdits((prev) => { const n = { ...prev }; delete n[k]; return n; });
        setSaved(k);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "ALL" || p.category === category;
    return matchSearch && matchCat;
  });

  const totalLowStock = products.reduce((acc, p) => {
    const hasLow = p.sizes.some((s) => {
      const qty = edits[key(p.slug, s)] ?? p.sizeStocks[s] ?? 0;
      return qty <= 3;
    });
    return acc + (hasLow ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Stock</h1>
        {totalLowStock > 0 && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 font-medium">
            ! {totalLowStock} producto{totalLowStock !== 1 ? "s" : ""} con stock bajo (&le;3 en algún talle)
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-52 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="ALL">Todas las categorías</option>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron productos.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((p) => {
              const productTotal = p.sizes.reduce((acc, s) => {
                return acc + (edits[key(p.slug, s)] ?? p.sizeStocks[s] ?? 0);
              }, 0);
              const hasLowSize = p.sizes.some((s) => (edits[key(p.slug, s)] ?? p.sizeStocks[s] ?? 0) <= 3);

              return (
                <div key={p.slug} className={`p-4 ${hasLowSize ? "bg-gray-50" : ""}`}>
                  {/* Encabezado del producto */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {categoryLabels[p.category] ?? p.category} · {fmt(p.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total en stock</p>
                      <p className={`text-xl font-bold ${productTotal <= 5 ? "text-gray-800" : "text-gray-900"}`}>
                        {productTotal}
                      </p>
                    </div>
                  </div>

                  {/* Grilla de talles */}
                  <div className="flex flex-wrap gap-2">
                    {p.sizes.map((size) => {
                      const k = key(p.slug, size);
                      const currentQty = edits[k] ?? p.sizeStocks[size] ?? 0;
                      const isDirty = edits[k] !== undefined;
                      const isLow = currentQty <= 3;
                      const isSaved = saved === k;

                      return (
                        <div
                          key={size}
                          className={`flex flex-col items-center gap-1 border rounded-lg p-2 min-w-[72px] transition-colors ${
                            isDirty ? "border-gray-700 bg-gray-50" : isLow ? "border-gray-300 bg-gray-50" : "border-gray-200"
                          }`}
                        >
                          <span className="text-xs font-semibold text-gray-600 uppercase">{size}</span>
                          <input
                            type="number"
                            min={0}
                            value={currentQty}
                            onChange={(e) =>
                              handleEdit(p.slug, size, Math.max(0, parseInt(e.target.value) || 0))
                            }
                            className="w-14 text-center border-0 bg-transparent text-sm font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-black rounded"
                          />
                          {isLow && !isSaved && (
                            <span className="text-xs text-gray-500 font-medium">bajo</span>
                          )}
                          {isSaved ? (
                            <span className="text-xs text-gray-600 font-medium">✓</span>
                          ) : isDirty ? (
                            <button
                              onClick={() => handleSave(p.slug, size)}
                              disabled={saving === k}
                              className="text-xs bg-black text-white px-2 py-0.5 rounded font-medium hover:bg-gray-800 disabled:opacity-40"
                            >
                              {saving === k ? "..." : "Guardar"}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        {filtered.length} de {products.length} productos &middot; Editá el número de cada talle y presioná Guardar
      </p>
    </div>
  );
}
