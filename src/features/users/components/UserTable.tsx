import { useState } from "react";
import { SplitDataTable, SplitDetailPanel, type DataTableColumn } from "@/common";
import type { User } from "../types/user.types";
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

  const columns: DataTableColumn<User>[] = [
    {
      id: "id",
      header: "ID",
      cell: (user) => user.id,
      className: "font-medium",
      compact: true,
    },
    {
      id: "name",
      header: "Name",
      cell: (user) => user.name,
      compact: true,
    },
    {
      id: "email",
      header: "Email",
      cell: (user) => user.email,
      compact: true,
    },
    {
      id: "phone",
      header: "Phone",
      cell: (user) => user.phone,
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => <Badge variant="outline">{user.role}</Badge>,
      compact: true,
    },
  ];

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found
      </div>
    );
  }

  return (
    <SplitDataTable
      rows={users}
      columns={columns}
      compactColumns={columns.filter((column) =>
        ["name", "email", "role"].includes(column.id),
      )}
      getRowId={(user) => user.id}
      selectedRowId={selectedUserId}
      onRowSelect={(user) =>
        setSelectedUserId((current) => (current === user.id ? null : user.id))
      }
      onDetailClose={() => setSelectedUserId(null)}
      detailTitle={selectedUser?.name ?? "User details"}
      detailPanel={
        selectedUser ? (
          <SplitDetailPanel
            title={selectedUser.name}
            subtitle={selectedUser.email}
            onClose={() => setSelectedUserId(null)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="ID" value={selectedUser.id} />
              <InfoItem label="Name" value={selectedUser.name} />
              <InfoItem label="Email" value={selectedUser.email} />
              <InfoItem label="Phone" value={selectedUser.phone} />
              <InfoItem
                label="Role"
                value={<Badge variant="outline">{selectedUser.role}</Badge>}
              />
            </div>
          </SplitDetailPanel>
        ) : null
      }
    />
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 break-words text-sm font-medium">{value}</div>
    </div>
  );
}
