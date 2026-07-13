import { createFileRoute } from "@tanstack/react-router";
import { ParkingDetailsPage } from "@/features/parkings/pages/ParkingDetailsPage";

export const Route = createFileRoute("/parkings/$id")({
  component: ParkingDetailsRoute,
});

function ParkingDetailsRoute() {
  const { id } = Route.useParams();

  return <ParkingDetailsPage id={id} />;
}
