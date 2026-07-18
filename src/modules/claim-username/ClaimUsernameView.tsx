'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CircleHelp } from 'lucide-react';
import { MobileShell } from '@/components/ui/mobile-shell';
import { useMagic } from '@/providers/magic/components/MagicProvider';
import { useUniversalAccount } from '@/providers/universal-account/components/UniversalAccountProvider';
import StepIndicator from "./components/step-indicator";
import ChooseHandle from "./components/choose-handle";
import ConfirmHandle from "./components/confirm-handle";
import CompleteView from "./components/complete-view";
import { useClaimUsername } from "./hooks/useClaimUsername";
import { DEFAULT_CHAIN_ID } from "@/providers/shared/constants/chain.constants";
import { getMyUsername } from "@/modules/username/utils/username.api";

export default function ClaimUsernameView() {
  const { session } = useMagic();
  const { accountInfo } = useUniversalAccount();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [handle, setHandle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const claimMutation = useClaimUsername();
  const ownerAddress = session?.ownerAddress || "";
  const usernameQuery = useQuery({
    queryKey: ["username", "owner", ownerAddress || null],
    queryFn: () => getMyUsername(ownerAddress),
    enabled: Boolean(ownerAddress),
    staleTime: 300_000,
  });

  useEffect(() => {
    if (usernameQuery.data?.username) router.replace("/dashboard");
  }, [router, usernameQuery.data?.username]);

  useEffect(() => {
    if (!handle && ownerAddress) setHandle(ownerAddress.replace(/^0x/i, "").slice(0, 4).toLowerCase());
  }, [handle, ownerAddress]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleContinue = useCallback(() => {
    setStep(2);
  }, []);

  const handleConfirm = useCallback(async () => {
  if (!session?.ownerAddress || usernameQuery.data?.username) return;
    setError(null);
    try {
      const address = accountInfo.evmSmartAccount || session.ownerAddress;
      await claimMutation.mutateAsync({ username: handle, ownerAddress: session.ownerAddress, chainId: DEFAULT_CHAIN_ID, address });
      setStep(3);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to claim username.');
    }
  }, [accountInfo.evmSmartAccount, claimMutation, handle, session?.ownerAddress]);

  const handleViewProfile = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `Check out my mom3 profile @${handle}`,
        text: `I just claimed @${handle} on mom3!`,
        url: window.location.origin + `/u/${handle}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/u/${handle}`);
    }
  }, [handle]);

  if (!ownerAddress || usernameQuery.isPending || usernameQuery.data?.username) return null;

  return (
      <MobileShell>
        <div className="sticky top-0 z-10 -mx-5 bg-black/90 px-5 backdrop-blur-lg">
          <div className="flex items-center justify-between py-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#ccff00]/60"
              aria-label={step > 1 ? 'Go back' : 'Back'}
            >
              <ChevronLeft className="w-6 h-6 text-white" aria-hidden="true" />
            </motion.button>
            <h1 className="text-xl font-bold text-white">Claim Username</h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#ccff00]/60"
              aria-label="Help"
            >
              <CircleHelp className="w-6 h-6 text-[#9A9AA2]" aria-hidden="true" />
            </motion.button>
          </div>

        {step < 3 && (
          <div className="px-4 pb-2">
            <StepIndicator currentStep={step} />
          </div>
        )}
      </div>

        <div className="flex flex-1 flex-col pt-3">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <ChooseHandle
                key="choose"
                handleValue={handle}
                ownerAddress={session?.ownerAddress}
                avatarFallback={session?.email}
                onHandleChange={setHandle}
                onContinue={handleContinue}
              />
            )}
            {step === 2 && (
              <ConfirmHandle
                key="confirm"
                handleValue={handle}
                onBack={handleBack}
                onConfirm={() => void handleConfirm()}
                isClaiming={claimMutation.isPending}
                error={error}
              />
            )}
            {step === 3 && (
              <CompleteView
                key="complete"
                handleValue={handle}
                ownerAddress={session?.ownerAddress}
                avatarFallback={session?.email}
                onViewProfile={handleViewProfile}
                onShare={handleShare}
              />
            )}
          </AnimatePresence>
        </div>
    </MobileShell>
  );
}
