import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import type { ParkingLocation } from "@/features/parkings/types/parking.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  MapPin,
  MoreVertical,
  Navigation,
  Pencil,
  Trash2,
} from "lucide-react";
import { ParkingLocationForm } from "./AddParkingForm";
import useDeleteParkingMutation from "../hooks/useDeleteParkingMutation";

interface VendorParkingCardProps {
  location: ParkingLocation;
}

function getTotalSlots(location: ParkingLocation) {
  return (
    location.totalSlots ??
    (location.totalTwoWheelerSlots ?? 0) + (location.totalFourWheelerSlots ?? 0)
  );
}

function getTwoWheelerSlots(location: ParkingLocation) {
  return location.totalTwoWheelerSlots ?? location.availableTwoWheelerSlots ?? 0;
}

function getFourWheelerSlots(location: ParkingLocation) {
  return (
    location.totalFourWheelerSlots ?? location.availableFourWheelerSlots ?? 0
  );
}

function formatCoordinate(value: number) {
  return Number.isFinite(value) ? value.toFixed(5) : "Unavailable";
}

export function VendorParkingCard({ location }: VendorParkingCardProps) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteParkingMutation({
    onDeleted: () => setDeleteOpen(false),
  });

  const navigateToParking = () => {
    void navigate({
      to: "/vendor/parking/$parkingId",
      params: { parkingId: String(location.id) },
    });
  };

  return (
    <>
      <Card className="min-w-0 border-slate-200 bg-white shadow-none transition-shadow hover:shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-base font-semibold text-slate-950">
                {location.name}
              </CardTitle>
              <Badge className="mt-2 border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 shadow-none hover:bg-green-50">
                {location.availableSlots} available
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0"
                  aria-label={`Open actions for ${location.name}`}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={navigateToParking}>
                  <Eye className="size-4" />
                  View parking
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Edit location
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete location
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex min-w-0 items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-500" />
            <span className="min-w-0 break-words line-clamp-2">
              {location.address}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
            <Navigation className="size-4 shrink-0 text-slate-500" />
            <span className="min-w-0 truncate">
              Lat: {formatCoordinate(location.latitude)}, Lng:{" "}
              {formatCoordinate(location.longitude)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SlotSummary label="2W" value={getTwoWheelerSlots(location)} />
            <SlotSummary label="4W" value={getFourWheelerSlots(location)} />
            <SlotSummary label="Total" value={getTotalSlots(location)} />
          </div>

          <Button
            className="mt-1 w-full bg-blue-600 hover:bg-blue-700"
            onClick={navigateToParking}
          >
            <Eye className="size-4" />
            View Parking
          </Button>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-190">
          <DialogHeader className="border-b px-6 py-5 sm:px-8">
            <DialogTitle className="text-2xl font-semibold">
              Edit location
            </DialogTitle>
          </DialogHeader>
          <ParkingLocationForm
            mode="edit"
            initialValues={location}
            onCancel={() => setEditOpen(false)}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this parking location?"
        description={`This will remove ${location.name} and its parking slots from your vendor account.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate(location.id)}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

function SlotSummary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-100 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
