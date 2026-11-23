import { Sidebar } from "@/components/layouts/sidebar";
import { AppHeader } from "@/components/layouts/app-header";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-background lg:bg-ink lg:dark:bg-black">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Saltar al contenido
      </a>
      <Sidebar />
      {/* Panel de contenido redondeado dentro del "bezel" oscuro */}
      <div className="lg:py-3 lg:pl-[88px] lg:pr-3">
        <div className="min-h-screen bg-background lg:min-h-[calc(100vh-1.5rem)] lg:rounded-[2rem]">
          <AppHeader
            user={{
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
            }}
          />
          <main id="main" className="pb-28 lg:pb-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
