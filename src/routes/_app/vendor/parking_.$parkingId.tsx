import { createFileRoute } from "@tanstack/react-router";
import { VendorParkingDetailsPage } from "@/features/vendor/pages/VendorParkingDetailsPage";

export const Route = createFileRoute("/_app/vendor/parking_/$parkingId")({
  component: VendorParkingDetailsRoute,
});

function VendorParkingDetailsRoute() {
  const { parkingId } = Route.useParams();

  return <VendorParkingDetailsPage parkingId={parkingId} />;
}
