"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/ventas", label: "Ventas / Pedidos" },
  { href: "/admin/stock", label: "Stock" },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <h2 className="font-bold text-lg">Panel Admin</h2>
        <p className="text-xs text-gray-500 mt-0.5">Hola, {userName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          Ver tienda
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
