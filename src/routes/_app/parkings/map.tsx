import { createFileRoute } from "@tanstack/react-router";
import { RouteGuard } from "@/common/components/RouteGuard";
import { ParkingMapPage } from "@/features/parkings/pages/ParkingMapPage";

export const Route = createFileRoute("/_app/parkings/map")({
  component: ParkingMapRoute,
});

function ParkingMapRoute() {
  return (
    <RouteGuard allowedRoles={["DRIVER"]}>
      <ParkingMapPage />
    </RouteGuard>
  );
}
