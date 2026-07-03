import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
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
import type { PasswordField } from "@/features/users/components/driver-settings/DriverSettingsSections";
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

export function useDriverSettingsPageState() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  const profileQuery = useCustomQuery({
    key: queryKeys.users.me(),
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

  function handleProfileChange(next: DriverProfileFormValues) {
    setProfileForm(next);
    setProfileErrors({});
  }

  function handleProfileCancel() {
    setProfileForm(null);
    setProfileErrors({});
  }

  function handlePasswordChange(next: DriverPasswordFormValues) {
    setPasswordForm(next);
    setPasswordErrors({});
  }

  function handlePasswordClear() {
    setPasswordForm(emptyPasswordForm);
    setPasswordErrors({});
  }

  return {
    profile,
    profileQuery,
    bookingsQuery,
    profileForm: resolvedProfileForm,
    profileErrors: visibleProfileErrors,
    passwordForm,
    passwordErrors: visiblePasswordErrors,
    visiblePasswords,
    setVisiblePasswords,
    profileMutation,
    passwordMutation,
    accountStats,
    hasProfileChanges,
    profileValidation,
    passwordValidation,
    handleProfileChange,
    handleProfileCancel,
    handleProfileSave,
    handlePasswordChange,
    handlePasswordClear,
    handlePasswordSave,
  };
}
