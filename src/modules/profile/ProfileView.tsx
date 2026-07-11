"use client";

import { motion } from "framer-motion";

import { MobilePageHeader, MobileShell } from "@/components/ui/mobile-shell";
import {
  profileActionRows,
  profileStats,
} from "@/modules/profile/constants/profile.constants";
import { ProfileActionList } from "@/modules/profile/components/ProfileActionList";
import { ProfileHeroCard } from "@/modules/profile/components/ProfileHeroCard";
import { ProfileIdentityList } from "@/modules/profile/components/ProfileIdentityList";
import { ProfileLogoutButton } from "@/modules/profile/components/ProfileLogoutButton";
import { ProfileLogoutSheet } from "@/modules/profile/components/ProfileLogoutSheet";
import { ProfileUpgradeSection } from "@/modules/profile/components/ProfileUpgradeSection";
import {
  ProfileUniversalAccountSheet,
  UniversalAccountHeaderButton,
} from "@/modules/profile/components/UniversalAccountSheet";
import { useProfileViewModel } from "@/modules/profile/hooks/useProfileViewModel";
import * as React from "react";

export default function ProfileView() {
  const profile = useProfileViewModel();
  const [logoutSheetOpen, setLogoutSheetOpen] = React.useState(false);

  if (!profile.isAuthenticated) return null;

  return (
    <MobileShell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <MobilePageHeader
          title="Profile"
          backHref="/dashboard"
          backLabel="Back to dashboard"
          action={
            <UniversalAccountHeaderButton
              ownerAddress={profile.ownerAddress}
              onOpen={profile.openUniversalAccountSheet}
            />
          }
        />
      </motion.div>

      <ProfileHeroCard
        email={profile.profileEmail}
        ownerAddress={profile.ownerAddress}
        stats={profileStats}
      />

      <ProfileUpgradeSection
        copiedAddress={profile.copiedAddress}
        errorMessage={profile.delegateErrorMessage}
        isDelegated={profile.isDelegated}
        isPending={profile.isUpgradePending}
        isUpgradeDisabled={profile.isUpgradeDisabled}
        onUpgrade={profile.onUpgrade}
      />

      <ProfileIdentityList
        rows={profile.identityRows}
        onOpenUniversalAccount={profile.openUniversalAccountSheet}
      />

      <ProfileActionList rows={profileActionRows} />

      <ProfileLogoutButton onLogout={() => setLogoutSheetOpen(true)} />

      <ProfileLogoutSheet
        open={logoutSheetOpen}
        onOpenChange={setLogoutSheetOpen}
        onConfirm={() => {
          setLogoutSheetOpen(false);
          void profile.logout();
        }}
      />

      <ProfileUniversalAccountSheet
        open={profile.universalAccountOpen}
        onOpenChange={profile.setUniversalAccountOpen}
        rows={profile.universalAccountRows}
        error={profile.universalAccountError}
        copiedAddress={profile.copiedAddress}
        onCopyAddress={profile.copyAddress}
      />
    </MobileShell>
  );
}
