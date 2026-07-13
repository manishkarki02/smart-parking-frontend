import type { ReactNode } from "react";
import {
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/features/users/services/user.service";
import { cn } from "@/lib/utils";

export type PasswordField = "current" | "next" | "confirm";

export type ProfileFormState = {
  name: string;
  phone: string;
};

export type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type FormErrors<T extends string> = Partial<Record<T, string>>;

export function ProfileCard({
  profile,
  form,
  errors,
  isPending,
  onFormChange,
  onCancel,
  onSave,
}: {
  profile?: UserProfile;
  form: ProfileFormState;
  errors: FormErrors<keyof ProfileFormState>;
  isPending: boolean;
  onFormChange: (next: ProfileFormState) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const initials = getInitials(profile?.name ?? "Vendor");

  return (
    <Card className="gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Profile</h3>
            <p className="mt-1 text-xs text-slate-500">
              Update your personal information
            </p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            <UserRound className="size-3" />
            Vendor
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 py-5">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {profile?.name ?? "Vendor"}
            </p>
            <ApprovalBadge approved={profile?.approved} compact />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldControl
            id="vendor-name"
            label="Full name"
            value={form.name}
            error={errors.name}
            onChange={(value) => onFormChange({ ...form, name: value })}
          />
          <FieldControl
            id="vendor-phone"
            label="Phone"
            value={form.phone}
            error={errors.phone}
            onChange={(value) => onFormChange({ ...form, phone: value })}
          />
          <FieldControl
            id="vendor-email"
            label="Email address"
            value={profile?.email ?? ""}
            readOnly
            disabled
            className="sm:col-span-2"
            helper="Email cannot be changed. Contact support if needed."
          />
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
        <p className="text-xs text-slate-500">
          Name and phone are synced with your account profile.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={onSave} disabled={isPending}>
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
  onFormChange,
  onErrorsChange,
  onVisibilityChange,
  onClear,
  onSave,
}: {
  form: PasswordFormState;
  errors: FormErrors<keyof PasswordFormState>;
  visiblePasswords: Record<PasswordField, boolean>;
  isPending: boolean;
  onFormChange: (next: PasswordFormState) => void;
  onErrorsChange: (next: FormErrors<keyof PasswordFormState>) => void;
  onVisibilityChange: (next: Record<PasswordField, boolean>) => void;
  onClear: () => void;
  onSave: () => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
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
          id="current-password"
          label="Current password"
          value={form.currentPassword}
          error={errors.currentPassword}
          visible={visiblePasswords.current}
          onChange={(value) => {
            onFormChange({ ...form, currentPassword: value });
            onErrorsChange({ ...errors, currentPassword: undefined });
          }}
          onToggle={() =>
            onVisibilityChange({
              ...visiblePasswords,
              current: !visiblePasswords.current,
            })
          }
        />

        <PasswordInput
          id="new-password"
          label="New password"
          value={form.newPassword}
          error={errors.newPassword}
          visible={visiblePasswords.next}
          onChange={(value) => {
            onFormChange({ ...form, newPassword: value });
            onErrorsChange({ ...errors, newPassword: undefined });
          }}
          onToggle={() =>
            onVisibilityChange({
              ...visiblePasswords,
              next: !visiblePasswords.next,
            })
          }
        />

        <PasswordInput
          id="confirm-password"
          label="Confirm new password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          visible={visiblePasswords.confirm}
          onChange={(value) => {
            onFormChange({ ...form, confirmPassword: value });
            onErrorsChange({ ...errors, confirmPassword: undefined });
          }}
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
        <Button type="button" size="sm" onClick={onSave} disabled={isPending}>
          <ShieldCheck className="size-4" />
          {isPending ? "Updating..." : "Update password"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function AccountInfoCard({
  profile,
  activeLocations,
  totalBookings,
  totalRevenue,
  isLoading,
}: {
  profile?: UserProfile;
  activeLocations: number;
  totalBookings: number;
  totalRevenue: number;
  isLoading: boolean;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-xl border-slate-200 bg-white py-0 shadow-none">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Account info</h3>
          <p className="mt-1 text-xs text-slate-500">
            Your vendor account details and live stats
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-5 py-4">
        <div className="divide-y divide-slate-200">
          <InfoRow label="Vendor ID" value={shortId(profile?.id)} />
          <InfoRow
            label="Status"
            value={
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-semibold",
                  profile?.approved ? "text-emerald-600" : "text-amber-600",
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {profile?.approved ? "Approved" : "Pending"}
              </span>
            }
          />
          <InfoRow
            label="Active locations"
            value={isLoading ? "Loading..." : activeLocations.toString()}
          />
          <InfoRow
            label="Total bookings"
            value={isLoading ? "Loading..." : totalBookings.toString()}
          />
          <InfoRow
            label="Total revenue"
            value={isLoading ? "Loading..." : formatCurrency(totalRevenue)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ApprovalBadge({
  approved,
  compact = false,
}: {
  approved?: boolean;
  compact?: boolean;
}) {
  const label = approved ? "Approved Vendor" : "Pending Approval";

  return (
    <Badge
      className={cn(
        "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
        approved === false &&
          "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50",
        compact && "mt-1 text-[11px]",
      )}
    >
      <ShieldCheck className="size-3" />
      {compact ? label.toLowerCase() : label}
    </Badge>
  );
}

function FieldControl({
  id,
  label,
  value,
  error,
  helper,
  placeholder,
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
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className="h-10 border-slate-200 bg-white text-sm"
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
    <div className="space-y-2">
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
          className="h-10 border-slate-200 bg-white pr-10 text-sm"
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
  value: string | ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="min-w-0 text-right font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function shortId(id?: string) {
  if (!id) return "Not available";
  return `VND-${id.slice(0, 6).toUpperCase()}`;
}

function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-US")}`;
}
