import { createFileRoute } from "@tanstack/react-router";
import { ParkingMapPage } from "@/features/parkings/pages/ParkingMapPage";

export const Route = createFileRoute("/parkings/map")({
  component: ParkingMapPage,
});
