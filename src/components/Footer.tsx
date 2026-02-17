import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold tracking-wide">MENSWEAR</h3>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-neutral-400">
              Moda masculina de alta gama. Diseño minimalista, calidad premium y
              experiencia de compra cuidada.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs sm:text-sm font-medium uppercase tracking-wider">Navegación</h4>
            <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/productos" className="hover:text-white transition-colors">Productos</Link>
              </li>
              <li>
                <Link href="/categorias/superiores" className="hover:text-white transition-colors">Superiores</Link>
              </li>
              <li>
                <Link href="/categorias/inferiores" className="hover:text-white transition-colors">Inferiores</Link>
              </li>
              <li>
                <Link href="/categorias/ropa-interior" className="hover:text-white transition-colors">Ropa interior</Link>
              </li>
              <li>
                <Link href="/summer" className="hover:text-white transition-colors">Summer</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs sm:text-sm font-medium uppercase tracking-wider">Contacto</h4>
            <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <a href="mailto:contacto@menswear.com" className="hover:text-white transition-colors">contacto@menswear.com</a>
              </li>
              <li>
                <span className="text-neutral-400">Buenos Aires, Argentina</span>
              </li>
            </ul>
            <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3">
              <a aria-label="Instagram" href="#" className="p-1.5 sm:p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6.5-.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z"/></svg>
              </a>
              <a aria-label="Facebook" href="#" className="p-1.5 sm:p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M13.5 9H16V6h-2.5A3.5 3.5 0 0 0 10 9.5V12H8v3h2v7h3v-7h2.1l.4-3H13v-2a1 1 0 0 1 1-1Z"/></svg>
              </a>
              <a aria-label="X" href="#" className="p-1.5 sm:p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M14.7 3H18l-5.2 7.2L19 21h-3.3l-4.3-6-4.8 6H5l6-7.6L5 3h3.4l4 5.6L14.7 3Z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs sm:text-sm font-medium uppercase tracking-wider">Pagos</h4>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-neutral-400">Aceptamos Mercado Pago, Visa y Mastercard.</p>
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-500">
              <span className="px-2 py-1 rounded bg-neutral-800">Mercado Pago</span>
              <span className="px-2 py-1 rounded bg-neutral-800">Visa</span>
              <span className="px-2 py-1 rounded bg-neutral-800">Mastercard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-[10px] sm:text-xs text-neutral-400 text-center sm:text-left">© {new Date().getFullYear()} MENSWEAR. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
            <Link href="#" className="hover:text-white">Términos</Link>
            <Link href="#" className="hover:text-white">Privacidad</Link>
            <Link href="#" className="hover:text-white">Devoluciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
