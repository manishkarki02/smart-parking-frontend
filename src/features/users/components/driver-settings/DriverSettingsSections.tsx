import type { ReactNode } from "react";
import { Check, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/features/users/services/user.service";
import type {
  DriverPasswordFormValues,
  DriverProfileFormValues,
} from "@/features/users/validation/driver-settings.schema";
import {
  formatDriverCurrency,
  getInitials,
  shortDriverId,
  type DriverAccountStats,
  type FormErrors,
} from "@/features/users/utils/driver-settings.utils";
import { cn } from "@/lib/utils";

export type PasswordField = "current" | "next" | "confirm";

export function ProfileCard({
  profile,
  form,
  errors,
  isLoading,
  isPending,
  canSave,
  onFormChange,
  onCancel,
  onSave,
}: {
  profile?: UserProfile;
  form: DriverProfileFormValues;
  errors: FormErrors<keyof DriverProfileFormValues>;
  isLoading: boolean;
  isPending: boolean;
  canSave: boolean;
  onFormChange: (next: DriverProfileFormValues) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const initials = getInitials(profile?.name ?? "Driver");

  return (
    <Card className="gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-950">
              Profile
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Update your personal information
            </p>
          </div>
          <RoleBadge />
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 py-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3 border-b border-slate-200 pb-5">
          {isLoading ? (
            <>
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </>
          ) : (
            <>
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {profile?.name ?? "Driver"}
                </p>
                <DriverStatusBadge banned={profile?.banned ?? false} compact />
              </div>
            </>
          )}
        </div>

        {isLoading ? (
          <ProfileFieldsSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldControl
              id="driver-name"
              label="Full name"
              value={form.name}
              error={errors.name}
              onChange={(value) => onFormChange({ ...form, name: value })}
            />
            <FieldControl
              id="driver-phone"
              label="Phone"
              value={form.phone}
              error={errors.phone}
              onChange={(value) => onFormChange({ ...form, phone: value })}
            />
            <FieldControl
              id="driver-email"
              label="Email address"
              value={profile?.email ?? ""}
              readOnly
              disabled
              className="sm:col-span-2"
              helper="Email cannot be changed. Contact support if needed."
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-xs text-slate-500">
          Name and phone are synced with your account profile.
        </p>
        <div className="flex shrink-0 gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending || isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={!canSave || isLoading}
          >
            <Check className="size-4" />
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function PasswordCard({
  form,
  errors,
  visiblePasswords,
  isPending,
  canSave,
  onFormChange,
  onVisibilityChange,
  onClear,
  onSave,
}: {
  form: DriverPasswordFormValues;
  errors: FormErrors<keyof DriverPasswordFormValues>;
  visiblePasswords: Record<PasswordField, boolean>;
  isPending: boolean;
  canSave: boolean;
  onFormChange: (next: DriverPasswordFormValues) => void;
  onVisibilityChange: (next: Record<PasswordField, boolean>) => void;
  onClear: () => void;
  onSave: () => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-950">
              Change password
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Use a strong password for better account security
            </p>
          </div>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <LockKeyhole className="size-4" />
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 py-5">
        <PasswordInput
          id="driver-current-password"
          label="Current password"
          value={form.currentPassword}
          error={errors.currentPassword}
          visible={visiblePasswords.current}
          onChange={(value) => onFormChange({ ...form, currentPassword: value })}
          onToggle={() =>
            onVisibilityChange({
              ...visiblePasswords,
              current: !visiblePasswords.current,
            })
          }
        />
        <PasswordInput
          id="driver-new-password"
          label="New password"
          value={form.newPassword}
          error={errors.newPassword}
          visible={visiblePasswords.next}
          onChange={(value) => onFormChange({ ...form, newPassword: value })}
          onToggle={() =>
            onVisibilityChange({
              ...visiblePasswords,
              next: !visiblePasswords.next,
            })
          }
        />
        <PasswordInput
          id="driver-confirm-password"
          label="Confirm new password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          visible={visiblePasswords.confirm}
          onChange={(value) =>
            onFormChange({ ...form, confirmPassword: value })
          }
          onToggle={() =>
            onVisibilityChange({
              ...visiblePasswords,
              confirm: !visiblePasswords.confirm,
            })
          }
        />
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={isPending}
        >
          Clear
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={!canSave}>
          <ShieldCheck className="size-4" />
          {isPending ? "Updating..." : "Update password"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function AccountInfoCard({
  profile,
  stats,
  isLoading,
}: {
  profile?: UserProfile;
  stats: DriverAccountStats;
  isLoading: boolean;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Account info</h3>
          <p className="mt-1 text-xs text-slate-500">
            Your driver account details and activity summary
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-5 py-4">
        {isLoading ? (
          <AccountInfoSkeleton />
        ) : (
          <div className="divide-y divide-slate-200">
            <InfoRow label="Driver ID" value={shortDriverId(profile?.id)} />
            <InfoRow
              label="Status"
              value={
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-semibold",
                    profile?.banned ? "text-red-600" : "text-emerald-600",
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {profile?.banned ? "Banned" : "Active"}
                </span>
              }
            />
            <InfoRow label="Total bookings" value={stats.totalBookings} />
            <InfoRow label="Completed bookings" value={stats.completedBookings} />
            <InfoRow label="Cancelled bookings" value={stats.cancelledBookings} />
            <InfoRow
              label="Total spent"
              value={formatDriverCurrency(stats.totalSpent)}
            />
            <InfoRow label="Member since" value="-" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DriverStatusBadge({
  banned,
  label,
  compact = false,
}: {
  banned: boolean;
  label?: string;
  compact?: boolean;
}) {
  return (
    <Badge
      className={cn(
        "border hover:bg-current/0",
        banned
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
        compact && "mt-1 text-[11px]",
      )}
    >
      <ShieldCheck className="size-3" />
      {label ?? (banned ? "Banned account" : "Active driver")}
    </Badge>
  );
}

function FieldControl({
  id,
  label,
  value,
  error,
  helper,
  readOnly,
  disabled,
  className,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  helper?: string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className="h-10 min-w-0 border-slate-200 bg-white text-sm"
        onChange={(event) => onChange?.(event.target.value)}
      />
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : helper ? (
        <p className="text-xs text-slate-500">{helper}</p>
      ) : null}
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  error,
  visible,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          aria-invalid={Boolean(error)}
          className="h-10 min-w-0 border-slate-200 bg-white pr-10 text-sm"
          autoComplete={id.includes("current") ? "current-password" : "new-password"}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 size-8 text-slate-500"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] items-center gap-3 py-3 text-sm">
      <span className="min-w-0 text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-right font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}

function RoleBadge() {
  return (
    <Badge className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">
      <UserRound className="size-3" />
      Driver
    </Badge>
  );
}

function ProfileFieldsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-20 rounded-lg sm:col-span-2" />
    </div>
  );
}

function AccountInfoSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
