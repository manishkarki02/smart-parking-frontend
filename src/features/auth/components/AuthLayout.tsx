import type { ReactNode } from "react";
import { Clock, MailCheck, ParkingCircle } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  const features = [
    {
      icon: ParkingCircle,
      label: "24/7 Parking access",
    },
    {
      icon: Clock,
      label: "Live Slot status",
    },
    {
      icon: MailCheck,
      label: "Secure Email login",
    },
  ];

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] text-[#0F172A]">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <aside className="relative hidden overflow-hidden border-r border-[#E2E8F0] bg-linear-to-br from-blue-50 via-white to-teal-50 px-10 py-14 lg:flex lg:flex-col lg:justify-center xl:px-16">
          <div className="pointer-events-none absolute right-10 top-12 h-40 w-40 rounded-[3rem] border border-blue-100 bg-white/60 rotate-12" />
          <div className="pointer-events-none absolute bottom-16 left-10 h-28 w-28 rounded-[2rem] border border-teal-100 bg-white/70 -rotate-6" />

          <div className="relative z-10 max-w-xl">
            <div className="mt-12">
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-[#0F172A] xl:text-6xl">
                Find a spot.
                <span className="block text-[#14B8A6]">
                  Park with confidence.
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-[#64748B]">
                A simple parking platform for drivers and administrators to
                manage slots, bookings, vehicles, and parking activity from one
                secure dashboard.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="rounded-2xl border border-[#E2E8F0] bg-white/85 p-4 shadow-sm"
                >
                  <feature.icon className="size-5 text-[#2563EB]" />
                  <p className="mt-3 text-sm font-semibold text-[#0F172A]">
                    {feature.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-124">{children}</div>
        </div>
      </div>
    </section>
  );
}
