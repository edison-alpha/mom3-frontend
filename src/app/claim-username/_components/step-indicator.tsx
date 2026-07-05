'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = ['Choose', 'Confirm', 'Complete'];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-3 flex w-full items-center justify-center overflow-hidden">
      <div className="flex w-full max-w-[320px] items-center justify-center">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={
                    isActive
                      ? { scale: 1, backgroundColor: '#ccff00', color: '#3B33BD' }
                      : isCompleted
                      ? { scale: 1, backgroundColor: '#ccff00', color: '#3B33BD' }
                      : { scale: 1, backgroundColor: '#1C1C1E', color: '#9A9AA2' }
                  }
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border border-[#2A2A3E]"
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    stepNum
                  )}
                </motion.div>
                <span
                  className={`text-[11px] mt-1 ${
                    isActive || isCompleted ? 'text-[#ccff00]' : 'text-[#9A9AA2]'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-10 sm:w-14 h-[2px] mx-1.5 bg-[#2A2A3E] relative -top-[0.5rem] overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={
                      stepNum < currentStep
                        ? { width: '100%' }
                        : { width: '0%' }
                    }
                    className="h-full bg-[#ccff00]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
