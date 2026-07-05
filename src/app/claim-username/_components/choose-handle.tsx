'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Lock,
  ShieldCheck,
  Type as TypeIcon,
  type LucideIcon,
} from 'lucide-react';

interface ChooseHandleProps {
  handleValue: string;
  onHandleChange: (value: string) => void;
  onContinue: () => void;
}

const rules = [
  {
    Icon: TypeIcon,
    title: '3–20 characters',
    description: 'Use letters, numbers, and underscores',
  },
  {
    Icon: ShieldCheck,
    title: 'Must be unique',
    description: 'One handle per user',
  },
  {
    Icon: Lock,
    title: "Can't be changed",
    description: 'Choose wisely, handle is permanent',
  },
] satisfies {
  Icon: LucideIcon;
  title: string;
  description: string;
}[];

export default function ChooseHandle({
  handleValue,
  onHandleChange,
  onContinue,
}: ChooseHandleProps) {
  const isValid =
    handleValue.length >= 3 &&
    handleValue.length <= 20 &&
    /^[a-zA-Z0-9_]+$/.test(handleValue);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col pb-8"
    >
      {/* Hero illustration */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative mb-3">
          <div className="w-20 h-20 bg-gradient-to-br from-[#3B33BD] to-[#2E279A] rounded-full flex items-center justify-center relative">
            <span className="text-4xl">👾</span>
            <div className="absolute -top-1 -right-1">
              <Icon
                icon="material-symbols:verified-rounded"
                aria-hidden="true"
                width={20}
                height={20}
                className="text-[#ccff00]"
              />
            </div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-1.5">
          Your handle is your identity
        </h2>
        <p className="text-[#9A9AA2] text-center text-xs leading-relaxed">
          Create a unique @username to represent
          <br />
          your profile across mom3.
        </p>
      </div>

      {/* Handle Input */}
      <div className="mb-3">
        <label className="block text-sm font-semibold text-white mb-2">
          Choose your handle
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9AA2]">
            <span className="text-lg font-medium">@</span>
          </div>
          <input
            type="text"
            value={handleValue}
            onChange={(e) => onHandleChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="yourhandle"
            maxLength={20}
            className="w-full bg-[#1C1C1E] text-white rounded-xl py-3 pl-10 pr-12 text-base placeholder-[#5F5F67] outline-none focus:ring-2 focus:ring-[#ccff00]/50 transition-all border border-[#2A2A3E]"
          />
          {isValid && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <div className="w-6 h-6 rounded-full bg-[#ccff00] flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-[#3B33BD]" aria-hidden="true" />
              </div>
            </motion.div>
          )}
        </div>
        {handleValue.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm mt-2 ${isValid ? 'text-[#ccff00]' : 'text-red-400'}`}
          >
            {isValid
              ? `@${handleValue} is available`
              : '3–20 characters, letters, numbers, underscores only'}
          </motion.p>
        )}
      </div>

      {/* Handle Rules */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white mb-2">Handle rules</h3>
        <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2A2A3E]">
          {rules.map(({ Icon: RuleIcon, ...rule }, index) => (
            <div
              key={rule.title}
              className={`flex items-start gap-3 ${index < rules.length - 1 ? 'pb-3 mb-3 border-b border-[#2A2A3E]' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#2A2A3E] flex items-center justify-center shrink-0">
                <RuleIcon className="w-4 h-4 text-[#9A9AA2]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{rule.title}</p>
                <p className="text-xs text-[#9A9AA2]">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-white mb-2">Preview</h3>
        <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2A2A3E] flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3B33BD] to-[#2E279A] rounded-full flex items-center justify-center">
            <span className="text-xl">👾</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">@{handleValue || 'yourhandle'}</p>
            <p className="text-xs text-[#9A9AA2]">This is how others will see you<br />on mom3.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#9A9AA2] shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Continue Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        disabled={!isValid}
        className={`mt-auto w-full py-4 rounded-2xl text-lg font-bold transition-all mb-2 ${
          isValid
            ? 'bg-[#3B33BD] text-[#ccff00] shadow-[0_0_20px_rgba(59,51,189,0.3)]'
            : 'bg-[#2A2A3E] text-[#9A9AA2] cursor-not-allowed'
        }`}
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
