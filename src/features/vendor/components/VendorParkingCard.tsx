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
import { Eye, MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ParkingLocationForm } from "./AddParkingForm";
import useDeleteParkingMutation from "../hooks/useDeleteParkingMutation";

interface VendorParkingCardProps {
  location: ParkingLocation;
}

export function VendorParkingCard({ location }: VendorParkingCardProps) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteParkingMutation({
    onDeleted: () => setDeleteOpen(false),
  });

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">
                {location.name}
              </CardTitle>
              <Badge variant="secondary" className="mt-2">
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Edit parking
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete parking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{location.address}</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Lat: {location.latitude.toFixed(5)}, Lng:{" "}
            {location.longitude.toFixed(5)}
          </div>

          <Button
            size="sm"
            className="w-full mt-4"
            onClick={() =>
              navigate({
                to: "/vendor/parking/$parkingId",
                params: { parkingId: String(location.id) },
              })
            }
          >
            <Eye className="mr-2 h-4 w-4" />
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
