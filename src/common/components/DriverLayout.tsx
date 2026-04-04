import { DriverHeader } from "./DriverHeader";

export function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DriverHeader />
      <main className="flex-1 w-full bg-slate-50/50 dark:bg-slate-950/50">
        {children}
      </main>
    </div>
  );
}
