import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { GoalsPageClient } from "@/app/(dashboard)/goals/goals-page-client"

export default async function GoalsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  return <GoalsPageClient />
}
