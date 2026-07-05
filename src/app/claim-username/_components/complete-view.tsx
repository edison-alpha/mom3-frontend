'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { ExternalLink, Share2 } from 'lucide-react';

interface CompleteViewProps {
  handleValue: string;
  onViewProfile: () => void;
  onShare: () => void;
}

export default function CompleteView({
  handleValue,
  onViewProfile,
  onShare,
}: CompleteViewProps) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col pb-8"
    >
      {/* Success Animation */}
      <div className="flex flex-col items-center mb-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mb-4"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#3B33BD] to-[#2E279A] rounded-full flex items-center justify-center relative">
            <span className="text-5xl">👾</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-58px)`,
                  }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    i % 2 === 0 ? 'bg-[#ccff00]' : 'bg-white'
                  }`} />
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="absolute -bottom-1 -right-1"
          >
            <Icon
              icon="material-symbols:verified-rounded"
              aria-hidden="true"
              width={32}
              height={32}
              className="text-[#ccff00]"
            />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-1.5"
        >
          Congratulations!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[#9A9AA2] text-center mb-1"
        >
          You successfully claimed
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-bold text-[#ccff00]"
        >
          @{handleValue}
        </motion.p>
      </div>

      {/* Transaction Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1C1C1E] rounded-2xl border border-[#2A2A3E] mb-5 overflow-hidden"
      >
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
          <span className="text-sm text-[#9A9AA2]">Transaction</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-white">0x4f3h...8a7d</span>
            <ExternalLink className="w-4 h-4 text-[#9A9AA2]" aria-hidden="true" />
          </div>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-sm text-[#9A9AA2]">Date</span>
          <span className="text-sm text-white">{today} {time}</span>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-auto space-y-3 mb-2"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onViewProfile}
          className="w-full py-4 bg-[#ccff00] text-[#3B33BD] rounded-2xl text-lg font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)]"
        >
          View My Profile
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onShare}
          className="w-full py-4 bg-[#1C1C1E] border border-[#2A2A3E] text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" aria-hidden="true" />
          Share
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
