import type { NextConfig } from "next";

// Cabeceras HTTP de seguridad aplicadas a todas las rutas
const securityHeaders = [
  // Evita que el sitio sea embebido en iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Evita que el browser "adivine" el Content-Type (MIME sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Fuerza HTTPS por 1 año (solo activo cuando se sirve por HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Desactiva acceso a features sensibles del dispositivo
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  // Enviar referrer solo en requests al mismo origen
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts propios + MercadoPago SDK (necesario para Bricks)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://http2.mlstatic.com",
      // Estilos propios + inline (Tailwind usa inline styles en runtime)
      "style-src 'self' 'unsafe-inline'",
      // Imágenes: propio + data URIs + todos los dominios HTTPS (filtrado por remotePatterns)
      "img-src 'self' data: blob: https:",
      // Fuentes
      "font-src 'self' data:",
      // Fetch / XHR: propio + MercadoPago APIs
      "connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com",
      // Iframes: solo MercadoPago (para el Brick de pago)
      "frame-src https://*.mercadopago.com",
      // Objetos Flash/Java: bloqueados totalmente
      "object-src 'none'",
      // Formularios: solo propio
      "form-action 'self'",
      // URL base: solo propio
      "base-uri 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Desactiva React Compiler para descartar bloqueos de navegación en dev
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "http2.mlstatic.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Aplica a todas las rutas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/process_payment",
        destination: "/api/process_payment",
      },
    ];
  },
};

export default nextConfig;
