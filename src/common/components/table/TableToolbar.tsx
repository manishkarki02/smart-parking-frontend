import type { ReactNode } from "react";

export function TableToolbar({
  left,
  right,
}: {
  left?: ReactNode;
  right?: ReactNode;
}) {
  if (!left && !right) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">{left}</div>
      {right ? (
        <div className="flex flex-wrap items-center gap-2">{right}</div>
      ) : null}
    </div>
  );
}
