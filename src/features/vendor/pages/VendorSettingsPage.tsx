import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/common/components/PageHeader";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { queryKeys } from "@/config/query-keys";
import {
  getVendorBookings,
  type VendorBooking,
} from "@/features/bookings/services/booking.service";
import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
  type UserProfileUpdateRequest,
} from "@/features/users/services/user.service";
import {
  AccountInfoCard,
  ApprovalBadge,
  PasswordCard,
  ProfileCard,
  type FormErrors,
  type PasswordField,
  type PasswordFormState,
  type ProfileFormState,
} from "@/features/users/components/vendor-settings/VendorSettingsSections";
import { useVendorDashboard } from "@/features/vendor/hooks/useVendorDashboard";
import { useAuthStore } from "@/stores/auth-store";

const emptyPasswordForm: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function VendorSettingsPage() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  const profileQuery = useCustomQuery({
    key: queryKeys.users.me(),
    queryFn: getMyProfile,
  });

  const dashboardQuery = useVendorDashboard();

  const bookingsQuery = useCustomQuery({
    key: queryKeys.bookings.vendor({ status: "ALL" }),
    queryFn: () => getVendorBookings({ status: "ALL" }),
  });

  const profile = profileQuery.data;
  const dashboard = dashboardQuery.data;
  const bookingItems = bookingsQuery.data?.data;
  const approvalStatus = profile?.approved ?? dashboard?.vendor?.approved;

  const [profileForm, setProfileForm] = useState<ProfileFormState | null>(null);
  const [profileErrors, setProfileErrors] = useState<
    FormErrors<keyof ProfileFormState>
  >({});
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(emptyPasswordForm);
  const [passwordErrors, setPasswordErrors] = useState<
    FormErrors<keyof PasswordFormState>
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

  const profileMutation = useCustomMutation<
    UserProfileUpdateRequest,
    UserProfile
  >({
    api: updateMyProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.users.me(), updatedProfile);
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

  const accountStats = useMemo(() => {
    const bookings = bookingItems ?? [];
    const paidBookings = bookings.filter(
      (booking) => booking.paymentStatus === "SUCCESS",
    );
    const totalRevenue = paidBookings.reduce(
      (sum, booking) => sum + getBookingAmount(booking),
      0,
    );

    return {
      activeLocations:
        dashboard?.totalParkingLocations ?? dashboard?.locations.length ?? 0,
      totalBookings: bookings.length,
      totalRevenue,
    };
  }, [bookingItems, dashboard]);

  function handleProfileSave() {
    const errors = validateProfile(resolvedProfileForm);
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    profileMutation.mutate({
      name: resolvedProfileForm.name.trim(),
      phone: resolvedProfileForm.phone.trim(),
    });
  }

  function handlePasswordSave() {
    const errors = validatePassword(passwordForm);
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  }

  function resetProfileForm() {
    setProfileForm(null);
    setProfileErrors({});
  }

  return (
    <div className="min-h-full bg-slate-50">
      <PageHeader
        title="Settings"
        content={
          <div className="min-w-0 py-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
              Account Settings
            </h1>
            <p className="truncate text-sm text-slate-500">
              Manage your profile and security settings for your vendor account.
            </p>
          </div>
        }
        action={<ApprovalBadge approved={approvalStatus} />}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]">
          <div className="grid min-w-0 gap-4">
            <ProfileCard
              profile={profile}
              form={resolvedProfileForm}
              errors={profileErrors}
              isPending={profileMutation.isPending}
              onFormChange={setProfileForm}
              onCancel={resetProfileForm}
              onSave={handleProfileSave}
            />

            <PasswordCard
              form={passwordForm}
              errors={passwordErrors}
              visiblePasswords={visiblePasswords}
              isPending={passwordMutation.isPending}
              onFormChange={setPasswordForm}
              onErrorsChange={setPasswordErrors}
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
              activeLocations={accountStats.activeLocations}
              totalBookings={accountStats.totalBookings}
              totalRevenue={accountStats.totalRevenue}
              isLoading={profileQuery.isLoading || dashboardQuery.isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function validateProfile(
  form: ProfileFormState,
): FormErrors<keyof ProfileFormState> {
  const errors: FormErrors<keyof ProfileFormState> = {};
  if (!form.name.trim()) {
    errors.name = "Full name is required.";
  }
  if (form.phone.trim() && form.phone.trim().length < 7) {
    errors.phone = "Phone number looks too short.";
  }
  return errors;
}

function validatePassword(
  form: PasswordFormState,
): FormErrors<keyof PasswordFormState> {
  const errors: FormErrors<keyof PasswordFormState> = {};
  if (!form.currentPassword) {
    errors.currentPassword = "Current password is required.";
  }
  if (!form.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (form.newPassword.length < 8) {
    errors.newPassword = "Use at least 8 characters.";
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

function getBookingAmount(booking: VendorBooking) {
  return booking.totalAmount ?? booking.amount ?? 0;
}
