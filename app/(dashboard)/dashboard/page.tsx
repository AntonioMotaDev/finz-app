import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getAccountCards,
  getExpensesByCategory,
  getIncomeVsExpensesChart,
  getMonthlyComparison,
  getMonthlyExpenses,
  getMonthlyIncome,
  getRecentTransactions,
} from "@/lib/services/analytics";
import { accountTypeLabels } from "@/lib/validations/account";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/features/dashboard/section-header";
import { BalanceCards } from "@/components/features/dashboard/balance-cards";
import { QuickActions } from "@/components/features/dashboard/quick-actions";
import { KpiTiles } from "@/components/features/dashboard/kpi-tiles";
import { RecentActivity } from "@/components/features/dashboard/recent-activity";
import { StatisticPanel } from "@/components/features/dashboard/statistic-panel";
import { LazyIncomeChart } from "@/components/features/dashboard/lazy-income-chart";

export const metadata: Metadata = { title: "Dashboard" };

/* ------------------------------------------------------------------ */
/* Secciones asíncronas: cada una se transmite (streaming) por separado */
/* para que el esqueleto de la página se pinte de inmediato.            */
/* ------------------------------------------------------------------ */

async function AccountsSection({ userId }: { userId: string }) {
  const accounts = await getAccountCards(userId, 4);
  return (
    <BalanceCards
      accounts={accounts.map((a) => ({
        id: a.id,
        name: a.name,
        balance: a.balance,
        currency: a.currency,
        typeLabel: accountTypeLabels[a.type as keyof typeof accountTypeLabels] ?? a.type,
      }))}
    />
  );
}

async function KpiSection({ userId }: { userId: string }) {
  const [income, expenses, comparison] = await Promise.all([
    getMonthlyIncome(userId),
    getMonthlyExpenses(userId),
    getMonthlyComparison(userId),
  ]);
  return <KpiTiles income={income} expenses={expenses} comparison={comparison} />;
}

async function RecentSection({ userId }: { userId: string }) {
  const transactions = await getRecentTransactions(userId, 5);
  return <RecentActivity transactions={transactions} />;
}

async function StatisticSection({ userId }: { userId: string }) {
  const data = await getExpensesByCategory(userId);
  return <StatisticPanel data={data} />;
}

async function ChartSection({ userId }: { userId: string }) {
  const data = await getIncomeVsExpensesChart(userId);
  return <LazyIncomeChart data={data} />;
}

/* ------------------------------ Skeletons ------------------------------ */

const CardsSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2">
    <Skeleton className="h-44 rounded-3xl" />
    <Skeleton className="hidden h-44 rounded-3xl sm:block" />
  </div>
);
const KpiSkeleton = () => (
  <div className="grid gap-3 sm:grid-cols-3">
    {[0, 1, 2].map((i) => (
      <Skeleton key={i} className="h-[136px] rounded-2xl" />
    ))}
  </div>
);
const RowsSkeleton = () => (
  <div className="space-y-2">
    {[0, 1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-16 rounded-2xl" />
    ))}
  </div>
);

/* -------------------------------- Page -------------------------------- */

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  return (
    <div className="grid gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pt-8">
      <h1 className="sr-only">Dashboard</h1>

      {/* Columna principal */}
      <div className="min-w-0 space-y-8 lg:col-span-8">
        <section aria-labelledby="cards-title">
          <SectionHeader id="cards-title" title="Mis cuentas" href="/accounts" linkLabel="Ver todas" />
          <Suspense fallback={<CardsSkeleton />}>
            <AccountsSection userId={userId} />
          </Suspense>
        </section>

        <QuickActions />

        <section aria-label="Resumen del mes">
          <Suspense fallback={<KpiSkeleton />}>
            <KpiSection userId={userId} />
          </Suspense>
        </section>

        <section aria-labelledby="recent-title">
          <SectionHeader id="recent-title" title="Movimientos recientes" href="/transactions" />
          <Suspense fallback={<RowsSkeleton />}>
            <RecentSection userId={userId} />
          </Suspense>
        </section>
      </div>

      {/* Columna lateral */}
      <aside className="min-w-0 space-y-6 lg:col-span-4">
        <Suspense fallback={<Skeleton className="h-[560px] rounded-[1.75rem]" />}>
          <StatisticSection userId={userId} />
        </Suspense>
      </aside>

      {/* Gráfica (lazy: se carga al hacer scroll) */}
      <div className="min-w-0 lg:col-span-12">
        <Suspense fallback={<Skeleton className="h-[360px] rounded-[1.75rem]" />}>
          <ChartSection userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
