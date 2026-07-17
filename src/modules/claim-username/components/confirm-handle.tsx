'use client';

import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';

interface ConfirmHandleProps {
  handleValue: string;
  onBack: () => void;
  onConfirm: () => void;
}

const benefits = [
  'Your unique @username',
  'Your public profile on mom3',
  'Send & receive easily with your handle',
  'Access to mom3 Agent',
];

export default function ConfirmHandle({
  handleValue,
  onBack,
  onConfirm,
}: ConfirmHandleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col pb-8"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-1">
          Confirm your handle
        </h2>
        <p className="text-xl font-bold text-[#ccff00]">@{handleValue}</p>
        <p className="text-[#9A9AA2] text-xs mt-2 leading-relaxed">
          This will be your unique identity on mom3.
          <br />
          You won't be able to change it later.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-[#1C1C1E] rounded-2xl border border-[#2A2A3E] mb-4 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-[#2A2A3E]">
          <span className="text-sm text-[#9A9AA2]">Handle</span>
          <span className="text-sm font-semibold text-white">@{handleValue}</span>
        </div>
        <div className="flex items-center justify-between p-3 border-b border-[#2A2A3E]">
          <span className="text-sm text-[#9A9AA2]">Network</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#3B33BD] flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-white rounded-full" />
            </div>
            <span className="text-sm font-semibold text-white">Base</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 border-b border-[#2A2A3E]">
          <span className="text-sm text-[#9A9AA2]">Transaction fee</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">0.0012 ETH</p>
            <p className="text-xs text-[#9A9AA2]">~ $2.35</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-sm text-[#9A9AA2]">Payment method</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#3B33BD] to-[#ccff00] flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">M</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">Universal Balance</p>
              <p className="text-xs text-[#9A9AA2]">$12.43</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white mb-2">What you get</h3>
        <div className="space-y-2.5">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full border border-[#ccff00] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-[#ccff00]" aria-hidden="true" />
              </div>
              <span className="text-sm text-white">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2A2A3E] mb-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#2A2A3E] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 text-[#9A9AA2]" aria-hidden="true" />
        </div>
        <p className="text-sm text-[#9A9AA2] leading-relaxed">
          By continuing, you agree to mom3's{' '}
          <span className="text-[#ccff00] font-semibold">Terms of Service</span> and{' '}
          <span className="text-[#ccff00] font-semibold">Privacy Policy</span>.
        </p>
      </div>

      {/* Actions */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onConfirm}
        className="mt-auto w-full py-4 bg-[#3B33BD] text-[#ccff00] rounded-2xl text-lg font-bold mb-3 shadow-[0_0_20px_rgba(59,51,189,0.3)]"
      >
        Confirm & Claim
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onBack}
        className="w-full py-3 text-[#9A9AA2] text-sm font-semibold mb-2"
      >
        Cancel
      </motion.button>
    </motion.div>
  );
}
