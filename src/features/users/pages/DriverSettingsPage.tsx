import { useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { ZodError } from "zod/v4";

import { PageHeader } from "@/common/components/PageHeader";
import { QueryErrorState } from "@/common/components/feedback/QueryErrorState";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/config/query-keys";
import { getMyBookings } from "@/features/bookings/services/booking.service";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
  type UserProfileUpdateRequest,
} from "@/features/users/services/user.service";
import {
  driverPasswordSchema,
  driverProfileSchema,
  type DriverPasswordFormValues,
  type DriverProfileFormValues,
} from "@/features/users/validation/driver-settings.schema";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type PasswordField = "current" | "next" | "confirm";
type FormErrors<T extends string> = Partial<Record<T, string>>;

const emptyPasswordForm: DriverPasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function DriverSettingsPage() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  const profileQuery = useCustomQuery({
    key: ["USERS", "ME"],
    queryFn: getMyProfile,
    options: {
      enabled: true,
    },
  });

  const bookingsQuery = useCustomQuery({
    key: queryKeys.bookings.me(),
    queryFn: getMyBookings,
    options: {
      enabled: true,
    },
  });

  const profile = profileQuery.data;
  const [profileForm, setProfileForm] =
    useState<DriverProfileFormValues | null>(null);
  const [profileErrors, setProfileErrors] = useState<
    FormErrors<keyof DriverProfileFormValues>
  >({});
  const [passwordForm, setPasswordForm] =
    useState<DriverPasswordFormValues>(emptyPasswordForm);
  const [passwordErrors, setPasswordErrors] = useState<
    FormErrors<keyof DriverPasswordFormValues>
  >({});
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<PasswordField, boolean>
  >({
    current: false,
    next: false,
    confirm: false,
  });

  const resolvedProfileForm = profileForm ?? {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
  };

  const profileValidation = driverProfileSchema.safeParse(resolvedProfileForm);
  const passwordValidation = driverPasswordSchema.safeParse(passwordForm);
  const hasProfileChanges =
    resolvedProfileForm.name.trim() !== (profile?.name ?? "") ||
    resolvedProfileForm.phone.trim() !== (profile?.phone ?? "");
  const hasPasswordInput = Object.values(passwordForm).some(Boolean);
  const visibleProfileErrors =
    profileForm && !profileValidation.success
      ? {
          ...profileErrors,
          ...toFormErrors<keyof DriverProfileFormValues>(
            profileValidation.error,
          ),
        }
      : profileErrors;
  const visiblePasswordErrors =
    hasPasswordInput && !passwordValidation.success
      ? {
          ...passwordErrors,
          ...toFormErrors<keyof DriverPasswordFormValues>(
            passwordValidation.error,
          ),
        }
      : passwordErrors;

  const headerContent = useMemo(
    () => (
      <div className="min-w-0 py-1">
        <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
          Account Settings
        </h1>
        <p className="truncate text-sm text-slate-500">
          Manage your profile and security settings for your driver account.
        </p>
      </div>
    ),
    [],
  );

  const headerAction = useMemo(
    () =>
      profileQuery.isLoading ? (
        <Skeleton className="h-7 w-28 rounded-full" />
      ) : (
        <DriverStatusBadge
          banned={profile?.banned ?? false}
          label={profile?.banned ? "Banned Account" : "Active Driver"}
        />
      ),
    [profile?.banned, profileQuery.isLoading],
  );

  const profileMutation = useCustomMutation<
    UserProfileUpdateRequest,
    UserProfile
  >({
    api: updateMyProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["USERS", "ME"], updatedProfile);
      if (token) {
        setAuth(token, {
          id: updatedProfile.id,
          name: updatedProfile.name,
          email: updatedProfile.email,
          role: updatedProfile.role as "DRIVER" | "VENDOR" | "ADMIN",
          banned: updatedProfile.banned,
          approved: updatedProfile.approved,
        });
      }
      setProfileForm(null);
      setProfileErrors({});
      toast.success("Profile updated");
    },
  });

  const passwordMutation = useCustomMutation<
    UserProfileUpdateRequest,
    UserProfile
  >({
    api: updateMyProfile,
    onSuccess: () => {
      setPasswordForm(emptyPasswordForm);
      setPasswordErrors({});
      toast.success("Password updated");
    },
  });

  const accountStats = useMemo(
    () => buildDriverAccountStats(bookingsQuery.data),
    [bookingsQuery.data],
  );

  function handleProfileSave() {
    const validation = driverProfileSchema.safeParse(resolvedProfileForm);
    if (!validation.success) {
      setProfileErrors(toFormErrors(validation.error));
      return;
    }

    profileMutation.mutate({
      name: validation.data.name,
      phone: validation.data.phone,
    });
  }

  function handlePasswordSave() {
    const validation = driverPasswordSchema.safeParse(passwordForm);
    if (!validation.success) {
      setPasswordErrors(toFormErrors(validation.error));
      return;
    }

    passwordMutation.mutate({
      currentPassword: validation.data.currentPassword,
      newPassword: validation.data.newPassword,
    });
  }

  return (
    <>
      <PageHeader
        title="Account Settings"
        content={headerContent}
        action={headerAction}
      />

      {profileQuery.isError ? (
        <QueryErrorState
          title="Unable to load account settings"
          onRetry={() => void profileQuery.refetch()}
          className="mx-auto max-w-xl rounded-xl border-slate-200 bg-white shadow-none"
          contentClassName="min-h-0 items-start gap-4 p-6 text-left"
          showIcon={false}
          titleClassName="text-base text-slate-950"
          messageClassName="mt-1 max-w-none text-slate-500"
        />
      ) : (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]">
            <div className="grid min-w-0 gap-4">
              <ProfileCard
                profile={profile}
                form={resolvedProfileForm}
                errors={visibleProfileErrors}
                isLoading={profileQuery.isLoading}
                isPending={profileMutation.isPending}
                canSave={
                  hasProfileChanges &&
                  profileValidation.success &&
                  !profileMutation.isPending
                }
                onFormChange={(next) => {
                  setProfileForm(next);
                  setProfileErrors({});
                }}
                onCancel={() => {
                  setProfileForm(null);
                  setProfileErrors({});
                }}
                onSave={handleProfileSave}
              />

              <PasswordCard
                form={passwordForm}
                errors={visiblePasswordErrors}
                visiblePasswords={visiblePasswords}
                isPending={passwordMutation.isPending}
                canSave={
                  passwordValidation.success && !passwordMutation.isPending
                }
                onFormChange={(next) => {
                  setPasswordForm(next);
                  setPasswordErrors({});
                }}
                onVisibilityChange={setVisiblePasswords}
                onClear={() => {
                  setPasswordForm(emptyPasswordForm);
                  setPasswordErrors({});
                }}
                onSave={handlePasswordSave}
              />
            </div>

            <div className="grid min-w-0 gap-4">
              <AccountInfoCard
                profile={profile}
                stats={accountStats}
                isLoading={profileQuery.isLoading || bookingsQuery.isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProfileCard({
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

function PasswordCard({
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

function AccountInfoCard({
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
            <InfoRow label="Driver ID" value={shortId(profile?.id)} />
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
            <InfoRow label="Total spent" value={formatCurrency(stats.totalSpent)} />
            <InfoRow label="Member since" value="—" />
          </div>
        )}
      </CardContent>
    </Card>
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

function DriverStatusBadge({
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

type DriverAccountStats = {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
};

function buildDriverAccountStats(bookings?: BookingResponse[]): DriverAccountStats {
  const items = bookings ?? [];
  return {
    totalBookings: items.length,
    completedBookings: items.filter((booking) => booking.status === "COMPLETED")
      .length,
    cancelledBookings: items.filter((booking) => booking.status === "CANCELLED")
      .length,
    totalSpent: items
      .filter((booking) => booking.paymentStatus === "SUCCESS")
      .reduce((sum, booking) => sum + (booking.totalAmount ?? 0), 0),
  };
}

function toFormErrors<T extends string>(error: ZodError): FormErrors<T> {
  return error.issues.reduce<FormErrors<T>>((acc, issue) => {
    const key = issue.path[0];
    if (typeof key === "string") {
      acc[key as T] = issue.message;
    }
    return acc;
  }, {});
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "D";
}

function shortId(id?: string) {
  if (!id) return "—";
  return `DRV-${id.slice(0, 6).toUpperCase()}`;
}

function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-US")}`;
}
