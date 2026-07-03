import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/common/components/PageHeader";
import { QueryErrorState } from "@/common/components/feedback/QueryErrorState";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/config/query-keys";
import { getMyBookings } from "@/features/bookings/services/booking.service";
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
import {
  AccountInfoCard,
  DriverStatusBadge,
  PasswordCard,
  ProfileCard,
  type PasswordField,
} from "@/features/users/components/driver-settings/DriverSettingsSections";
import {
  buildDriverAccountStats,
  toFormErrors,
  type FormErrors,
} from "@/features/users/utils/driver-settings.utils";
import { useAuthStore } from "@/stores/auth-store";

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

