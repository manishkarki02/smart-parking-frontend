import { useMemo } from "react";

import { PageHeader } from "@/common/components/PageHeader";
import { QueryErrorState } from "@/common/components/feedback/QueryErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AccountInfoCard,
  DriverStatusBadge,
  PasswordCard,
  ProfileCard,
} from "@/features/users/components/driver-settings/DriverSettingsSections";
import { useDriverSettingsPageState } from "@/features/users/hooks/useDriverSettingsPageState";

export function DriverSettingsPage() {
  const page = useDriverSettingsPageState();

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
      page.profileQuery.isLoading ? (
        <Skeleton className="h-7 w-28 rounded-full" />
      ) : (
        <DriverStatusBadge
          banned={page.profile?.banned ?? false}
          label={page.profile?.banned ? "Banned Account" : "Active Driver"}
        />
      ),
    [page.profile?.banned, page.profileQuery.isLoading],
  );

  return (
    <>
      <PageHeader
        title="Account Settings"
        content={headerContent}
        action={headerAction}
      />

      {page.profileQuery.isError ? (
        <QueryErrorState
          title="Unable to load account settings"
          onRetry={() => void page.profileQuery.refetch()}
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
                profile={page.profile}
                form={page.profileForm}
                errors={page.profileErrors}
                isLoading={page.profileQuery.isLoading}
                isPending={page.profileMutation.isPending}
                canSave={
                  page.hasProfileChanges &&
                  page.profileValidation.success &&
                  !page.profileMutation.isPending
                }
                onFormChange={page.handleProfileChange}
                onCancel={page.handleProfileCancel}
                onSave={page.handleProfileSave}
              />

              <PasswordCard
                form={page.passwordForm}
                errors={page.passwordErrors}
                visiblePasswords={page.visiblePasswords}
                isPending={page.passwordMutation.isPending}
                canSave={
                  page.passwordValidation.success &&
                  !page.passwordMutation.isPending
                }
                onFormChange={page.handlePasswordChange}
                onVisibilityChange={page.setVisiblePasswords}
                onClear={page.handlePasswordClear}
                onSave={page.handlePasswordSave}
              />
            </div>

            <div className="grid min-w-0 gap-4">
              <AccountInfoCard
                profile={page.profile}
                stats={page.accountStats}
                isLoading={
                  page.profileQuery.isLoading || page.bookingsQuery.isLoading
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
