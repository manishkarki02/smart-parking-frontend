import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/drivers")({
  beforeLoad: () => {
    throw redirect({
      to: "/admin/users",
      search: {
        role: "DRIVER",
      },
    });
  },
});
