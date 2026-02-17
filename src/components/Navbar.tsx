"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch de rutas clave para evitar compilaciones lentas al click
    const routes = [
      "/",
      "/productos",
      "/categorias/inferiores",
      "/categorias/superiores",
      "/categorias/ropa-interior",
      "/summer",
    ];
    try {
      routes.forEach((r) => router.prefetch(r));
    } catch {}
  }, [router]);

  const withFallback = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const prev = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
    router.push(href);
    setTimeout(() => {
      const same = typeof window !== "undefined" && (window.location.pathname + window.location.search) === prev;
      if (same) {
        try {
          window.location.assign(href);
        } catch {
          window.location.href = href;
        }
      }
    }, 1000);
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-soft bg-surface bg-opacity-90 backdrop-blur-md supports-[backdrop-filter]:bg-surface supports-[backdrop-filter]:bg-opacity-90 shadow-sm pt-[env(safe-area-inset-top)] relative">
      <nav className="mx-auto flex h-16 sm:h-14 max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
          <Link href="/" className="text-xs sm:text-sm font-semibold tracking-wide" onClick={withFallback("/")} prefetch aria-label="Ir al inicio">
            MENSWEAR
          </Link>
        </div>

        {/* Menú escritorio */}
        <div className="hidden items-center gap-4 lg:gap-6 md:flex">
          <Link href="/productos" className="text-xs lg:text-sm font-medium text-foreground hover:opacity-70 transition-opacity" onClick={withFallback("/productos")} prefetch>Productos</Link>
          <Link href="/categorias/inferiores" className="text-xs lg:text-sm font-medium text-foreground hover:opacity-70 transition-opacity" onClick={withFallback("/categorias/inferiores")} prefetch>Inferiores</Link>
          <Link href="/categorias/superiores" className="text-xs lg:text-sm font-medium text-foreground hover:opacity-70 transition-opacity" onClick={withFallback("/categorias/superiores")} prefetch>Superiores</Link>
          <Link href="/categorias/ropa-interior" className="text-xs lg:text-sm font-medium text-foreground hover:opacity-70 transition-opacity" onClick={withFallback("/categorias/ropa-interior")} prefetch>Ropa Interior</Link>
          <Link href="/summer" className="text-xs lg:text-sm font-medium text-foreground hover:opacity-70 transition-opacity" onClick={withFallback("/summer")} prefetch>Summer</Link>
        </div>

        {/* Menú móvil */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="inline-flex select-none items-center gap-1 rounded-md px-3 py-2 text-xs sm:text-sm font-semibold text-foreground hover:bg-foreground/5 md:hidden transition-colors" aria-label="Abrir menú">
            Menú <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="min-w-[200px] sm:min-w-[220px] rounded-md border border-foreground/10 bg-background p-2 shadow-xl z-[100]" sideOffset={8} align="end">
            <DropdownMenu.Item className="rounded-sm text-xs sm:text-sm hover:bg-foreground/5 focus:bg-foreground/5 outline-none">
              <Link href="/productos" onClick={withFallback("/productos")} prefetch className="block w-full px-3 py-2.5 sm:py-3">Productos</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="rounded-sm text-xs sm:text-sm hover:bg-foreground/5 focus:bg-foreground/5 outline-none">
              <Link href="/categorias/inferiores" onClick={withFallback("/categorias/inferiores")} prefetch className="block w-full px-3 py-2.5 sm:py-3">Inferiores</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="rounded-sm text-xs sm:text-sm hover:bg-foreground/5 focus:bg-foreground/5 outline-none">
              <Link href="/categorias/superiores" onClick={withFallback("/categorias/superiores")} prefetch className="block w-full px-3 py-2.5 sm:py-3">Superiores</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="rounded-sm text-xs sm:text-sm hover:bg-foreground/5 focus:bg-foreground/5 outline-none">
              <Link href="/categorias/ropa-interior" onClick={withFallback("/categorias/ropa-interior")} prefetch className="block w-full px-3 py-2.5 sm:py-3">Ropa Interior</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="rounded-sm text-xs sm:text-sm hover:bg-foreground/5 focus:bg-foreground/5 outline-none">
              <Link href="/summer" onClick={withFallback("/summer")} prefetch className="block w-full px-3 py-2.5 sm:py-3">Summer</Link>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </nav>
      {/* Líneas decorativas animadas: mobile y desktop */}
      <div className="absolute bottom-0 left-0 right-0 md:hidden nav-mobile-glow" />
      <div className="absolute bottom-0 left-0 right-0 hidden md:block nav-desktop-flow" />
    </header>
  );
}
