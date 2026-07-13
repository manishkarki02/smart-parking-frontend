import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";

const adminUsersSearchSchema = z.object({
  role: z.enum(["ALL", "DRIVER", "VENDOR"]).optional(),
});

export const Route = createFileRoute("/_app/admin/users")({
  validateSearch: adminUsersSearchSchema,
  component: AdminUsersRoute,
});

function AdminUsersRoute() {
  const search = Route.useSearch();

  return <AdminUsersPage initialRole={search.role ?? "ALL"} />;
}
