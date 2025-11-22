import { Sidebar } from "@/components/layouts/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Spacer for desktop sidebar */}
      <div className="lg:pl-64">
        <main className="min-h-screen pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
