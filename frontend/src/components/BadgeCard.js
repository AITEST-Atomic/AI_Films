import { Lock, Unlock } from "lucide-react";
import { motion } from "framer-motion";

export const BadgeCard = ({ badgeName, badgeIcon, isUnlocked, stepOrder }) => {
  return (
    <motion.div
      className={`relative rounded-xl border p-4 mb-8 transition-all duration-300
        ${isUnlocked
          ? 'border-amber-500/30 bg-amber-500/[0.06]'
          : 'border-white/[0.08] bg-[#121318]'
        }
      `}
      data-testid={`badge-card-step-${stepOrder}`}
      initial={false}
      animate={isUnlocked ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {isUnlocked ? (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20">
            <Unlock className="w-5 h-5 text-amber-400" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.04]">
            <Lock className="w-5 h-5 text-zinc-600" />
          </div>
        )}
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">
            {isUnlocked ? 'Badge unlocked!' : 'Badge for this step'}
          </p>
          <p className="text-sm font-medium text-zinc-100" data-testid={`badge-name-step-${stepOrder}`}>
            {badgeIcon} {badgeName}
          </p>
          {!isUnlocked && (
            <p className="text-xs text-zinc-500 mt-1">Complete this step to unlock "{badgeName}"</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
