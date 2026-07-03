import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarClock,
  Car,
  CircleParking,
  MapPin,
  PlusCircle,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { ParkingLocationForm } from "@/features/vendor/components/AddParkingForm";
import { AddOnSiteBookingDialog } from "@/features/vendor/components/AddOnSiteBookingDialog";
import { useVendorDashboard } from "../hooks/useVendorDashboard";
import type {
  VendorDashboardLocation,
} from "../types/vendor.types";
import {
  DashboardKpis,
  DashboardSkeleton,
  ErrorCard,
  LocationSummaryCard,
  QuickActionCard,
  SectionHeading,
  VehicleBreakdownCard,
  VendorApprovalBadge,
} from "@/features/vendor/components/dashboard/VendorDashboardSections";
import { AddLocationDialog } from "@/features/vendor/components/dashboard/AddLocationDialog";
import { toParkingLocation } from "@/features/vendor/utils/vendor-dashboard.utils";

export function VendorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useVendorDashboard();
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<VendorDashboardLocation | null>(null);

  const vendorName = data?.vendor?.name ?? user?.name ?? "Vendor";
  const isApproved = data?.vendor?.approved ?? user?.approved ?? false;

  const headerAction = (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <VendorApprovalBadge approved={isApproved} />
      <AddLocationDialog
        open={isAddLocationOpen}
        onOpenChange={setIsAddLocationOpen}
      />
    </div>
  );

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader
        title="Vendor Dashboard"
        content={
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950">
              Vendor Dashboard
            </h1>
            <p className="truncate text-sm text-slate-500">
              Welcome back, {vendorName} — here's your parking overview
            </p>
          </div>
        }
        action={headerAction}
      />

      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5">
        {isError ? (
          <ErrorCard onRetry={() => void refetch()} />
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : data ? (
          <>
            <DashboardKpis data={data} />

            <section className="min-w-0 space-y-3">
              <SectionHeading
                title="Vehicle Type Breakdown"
                subtitle="Slot usage by vehicle category"
              />
              <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                <VehicleBreakdownCard
                  title="Two Wheelers"
                  subtitle="Bikes & scooters"
                  stats={data.twoWheelerSlots}
                  icon={CircleParking}
                  accent="orange"
                />
                <VehicleBreakdownCard
                  title="Four Wheelers"
                  subtitle="Cars & SUVs"
                  stats={data.fourWheelerSlots}
                  icon={Car}
                  accent="blue"
                />
              </div>
            </section>

            <section className="min-w-0 space-y-3">
              <SectionHeading title="Quick Actions" />
              <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <QuickActionCard
                  title="Manage Bookings"
                  subtitle="View & process bookings"
                  icon={CalendarClock}
                  accent="blue"
                  onClick={() => void navigate({ to: "/vendor/bookings" })}
                />
                <QuickActionCard
                  title="My Locations"
                  subtitle="Manage parking lots"
                  icon={MapPin}
                  accent="purple"
                  onClick={() => void navigate({ to: "/vendor/parkings" })}
                />
                <QuickActionCard
                  title="Walk-in Booking"
                  subtitle="Book slot for on-site driver"
                  icon={PlusCircle}
                  accent="green"
                  onClick={() => setIsWalkInOpen(true)}
                />
                <QuickActionCard
                  title="Slot Maintenance"
                  subtitle="Set slots under repair"
                  icon={Wrench}
                  accent="amber"
                  onClick={() =>
                    data.locations[0]
                      ? void navigate({
                          to: "/vendor/parking/$parkingId",
                          params: { parkingId: data.locations[0].id },
                        })
                      : void navigate({ to: "/vendor/parkings" })
                  }
                />
              </div>
            </section>

            <section className="min-w-0 space-y-3">
              <SectionHeading
                title="Location Summary"
                subtitle="Per-location slot status at a glance"
              />
              <LocationSummaryCard
                locations={data.locations}
                onAddLocation={() => setIsAddLocationOpen(true)}
                onViewAll={() => void navigate({ to: "/vendor/parkings" })}
                onViewLocation={(location) =>
                  void navigate({
                    to: "/vendor/parking/$parkingId",
                    params: { parkingId: location.id },
                  })
                }
                onEditLocation={setEditingLocation}
              />
            </section>
          </>
        ) : null}
      </div>

      <AddOnSiteBookingDialog open={isWalkInOpen} onOpenChange={setIsWalkInOpen} />

      <Dialog
        open={Boolean(editingLocation)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLocation(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-190">
          <DialogHeader className="border-b px-6 py-5 sm:px-8">
            <DialogTitle className="text-2xl font-semibold">
              Edit location
            </DialogTitle>
          </DialogHeader>
          {editingLocation ? (
            <ParkingLocationForm
              mode="edit"
              initialValues={toParkingLocation(editingLocation)}
              onCancel={() => setEditingLocation(null)}
              onSuccess={() => setEditingLocation(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

