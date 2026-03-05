import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // /admin/login no tiene sidebar, no requiere sesión
  // Next.js aplica este layout a TODAS las rutas bajo /admin/
  // incluida /admin/login, así que solo redirigimos si NO es la pagina de login
  if (!session?.user) {
    // El middleware ya se encarga de redirigir a /admin/login
    // pero por si acaso, renderizamos los children directamente (la login page)
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar userName={session.user.name ?? "Admin"} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
