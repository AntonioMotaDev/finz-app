import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReportsPageClient from "./reports-page-client";

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return <ReportsPageClient />;
}
