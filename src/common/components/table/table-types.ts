import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  compact?: boolean;
  align?: "left" | "center" | "right";
};
