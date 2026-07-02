import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminRecentUser } from "@/features/admin/types/admin.types";
import {
  formatAdminStatusLabel,
  getUserStatusTone,
} from "@/features/admin/utils/admin-dashboard.utils";

type AdminRecentUsersCardProps = {
  title: string;
  users: AdminRecentUser[];
  viewAllTo: string;
  userType: "vendor" | "driver";
};

export function AdminRecentUsersCard({
  title,
  users,
  viewAllTo,
  userType,
}: AdminRecentUsersCardProps) {
  const EmptyIcon = userType === "vendor" ? Building2 : UserRound;
  const description =
    userType === "vendor" ? "Latest vendor accounts." : "Latest driver accounts.";

  return (
    <Card className="rounded-lg border shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to={viewAllTo}>
            View all
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-4 text-center">
            <EmptyIcon
              className="mb-2 size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">
              No {userType === "vendor" ? "vendors" : "drivers"} found
            </p>
            <p className="text-xs text-muted-foreground">
              New accounts will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {userType === "vendor"
                        ? user.email ?? "No email"
                        : user.phone ?? "No phone"}
                    </p>
                  </div>
                </div>
                <Badge variant={getUserStatusTone(user.status)}>
                  {formatAdminStatusLabel(user.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
