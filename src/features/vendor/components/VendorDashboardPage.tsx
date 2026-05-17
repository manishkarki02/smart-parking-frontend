import { PageHeader } from "@/common/components/PageHeader";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVendorDashboard } from "../hooks/useVendorDashboard";
import { VendorDashboardStats } from "./VendorDashboardStats";
import { VendorVehicleStats } from "./VendorVehicleStats";
import { VendorLocationStats } from "./VendorLocationStats";

export function VendorDashboardPage() {
  const { data, isLoading, isError, refetch } = useVendorDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Dashboard"
        description="Overview of your parking locations, slots, and occupancy."
      />

      {isLoading && (
        <Card className="rounded-none sm:rounded-lg p-6">
          <LoadingSpinner />
        </Card>
      )}

      {isError && !isLoading && (
        <Card className="rounded-none sm:rounded-lg p-6">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <p className="text-base font-medium">Unable to load dashboard data.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {data && (
        <>
          {/* Summary stats */}
          <VendorDashboardStats data={data} />

          {/* Vehicle-wise stats */}
          <Card className="rounded-none sm:rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Vehicle Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <VendorVehicleStats data={data} />
            </CardContent>
          </Card>

          {/* Location-wise stats */}
          <Card className="rounded-none sm:rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Location-wise Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {data.locations.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No parking locations found yet.
                </p>
              ) : (
                <VendorLocationStats locations={data.locations} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
