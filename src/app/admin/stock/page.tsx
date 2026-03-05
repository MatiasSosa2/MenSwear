"use client";
import { useEffect, useState, useCallback } from "react";

type ProductStock = {
  slug: string;
  title: string;
  category: string;
  price: number;
  sizes: string[];
  stock: number;
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
  const [saving, setSaving] = useState<string | null>(null);
  const [edited, setEdited] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [saved, setSaved] = useState<string | null>(null);

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

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const handleEdit = (slug: string, value: number) => {
    setEdited((prev) => ({ ...prev, [slug]: value }));
  };

  const handleSave = async (slug: string) => {
    const stock = edited[slug];
    if (stock === undefined) return;

    setSaving(slug);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, stock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, stock } : p))
        );
        setEdited((prev) => {
          const next = { ...prev };
          delete next[slug];
          return next;
        });
        setSaved(slug);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "ALL" || p.category === category;
    return matchSearch && matchCat;
  });

  const totalLowStock = products.filter((p) => {
    const s = edited[p.slug] ?? p.stock;
    return s <= 3;
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Stock</h1>
        {totalLowStock > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 text-sm text-orange-700 font-medium">
            ⚠️ {totalLowStock} producto{totalLowStock !== 1 ? "s" : ""} con stock bajo (≤3)
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Talles</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const currentStock = edited[p.slug] ?? p.stock;
                  const isDirty = edited[p.slug] !== undefined;
                  const isLow = currentStock <= 3;
                  const isSaved = saved === p.slug;

                  return (
                    <tr key={p.slug} className={`hover:bg-gray-50 transition-colors ${isLow ? "bg-orange-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{categoryLabels[p.category] ?? p.category}</td>
                      <td className="px-4 py-3 text-gray-700">{fmt(p.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.sizes.map((s) => (
                            <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {isLow && <span className="text-orange-500 text-xs">⚠️</span>}
                          <input
                            type="number"
                            min={0}
                            value={currentStock}
                            onChange={(e) => handleEdit(p.slug, Math.max(0, parseInt(e.target.value) || 0))}
                            className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                              isDirty ? "border-blue-400 bg-blue-50" : "border-gray-300"
                            }`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isSaved ? (
                          <span className="text-green-600 text-xs font-medium">✓ Guardado</span>
                        ) : (
                          <button
                            onClick={() => handleSave(p.slug)}
                            disabled={!isDirty || saving === p.slug}
                            className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-30"
                          >
                            {saving === p.slug ? "..." : "Guardar"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        {filtered.length} de {products.length} productos · Los cambios se guardan individualmente
      </p>
    </div>
  );
}
