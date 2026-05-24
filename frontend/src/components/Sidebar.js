import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Check, RotateCcw, Film, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({ steps, progress, currentLevel, nextBadge, onStepClick, directorLevels }) => {
  const navigate = useNavigate();
  const nextBadgeForLevel = () => {
    if (!directorLevels || directorLevels.length === 0) return null;
    const sorted = [...directorLevels].sort((a, b) => a.min_steps - b.min_steps);
    return sorted.find(l => l.min_steps > progress.completedCount);
  };

  const nextLevel = nextBadgeForLevel();

  return (
    <div className="flex flex-col h-full" data-testid="sidebar">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-3 text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Trainings
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Film className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              AI Film Making Process Workflow
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5"></p>
          </div>
        </div>
      </div>

      {/* Director Level */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.18em] mb-3">Director Level</p>
        <div className="rounded-lg border border-white/[0.08] bg-[#121318] p-3">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-2xl" data-testid="director-level-emoji">{currentLevel?.emoji || '\u{1F3AC}'}</span>
            <div>
              <p className="text-sm font-medium text-zinc-100" data-testid="director-level-title">{currentLevel?.title || 'Aspiring Filmmaker'}</p>
              <p className="text-xs text-zinc-500">{currentLevel?.subtitle || 'The journey begins'}</p>
            </div>
          </div>
          <Progress
            value={progress.progressPercent}
            className="h-1.5 bg-white/10 mt-2"
            data-testid="step-progress-bar"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-zinc-500" data-testid="progress-label">{progress.completedCount}/8 steps</span>
            <span className="text-[11px] text-amber-400 font-medium">{progress.progressPercent}%</span>
          </div>
          {nextLevel && (
            <p className="text-[11px] text-zinc-500 mt-2">
              Next: <span className="text-zinc-400">{nextLevel.emoji} {nextLevel.title}</span>
            </p>
          )}
        </div>
      </div>

      {/* Curriculum */}
      <div className="flex-1 overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-[10px] font-medium text-zinc-500 uppercase tracking-[0.18em]">Curriculum</p>
        <ScrollArea className="h-[calc(100%-32px)] px-2">
          <div className="space-y-0.5 pb-4">
            {steps.map((step) => {
              const isActive = step.order === progress.currentStep;
              const isCompleted = progress.isStepCompleted(step.order);

              return (
                <motion.button
                  key={step.order}
                  data-testid={`curriculum-step-${step.order}-button`}
                  onClick={() => onStepClick(step.order)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 group
                    ${
                      isActive
                        ? 'bg-white/[0.05] text-zinc-100'
                        : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'
                    }
                  `}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Left accent bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeStep"
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-amber-400"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Step number */}
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold flex-shrink-0
                    ${isCompleted
                      ? 'bg-amber-500 text-black'
                      : isActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/[0.05] text-zinc-500 border border-white/[0.08]'
                    }
                  `}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.order}
                  </div>

                  {/* Step info */}
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>
                      <span className="mr-1.5">{step.emoji}</span>
                      {step.title}
                    </p>
                    <p className="text-xs mt-0.5 text-zinc-500">{step.subtitle}</p>
                  </div>

                  {/* Completion dot */}
                  {isCompleted && !isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <p className="text-[10px] text-zinc-600 text-center">AFM Workshop</p>
          {progress.syncing && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] text-zinc-600">syncing</span>
            </div>
          )}
        </div>
        {progress.sessionId && (
          <p className="text-[9px] text-zinc-700 text-center mb-1.5 font-mono truncate" title={`Session: ${progress.sessionId}`}>
            Session: {progress.sessionId.slice(0, 16)}...
          </p>
        )}
        <button
          data-testid="sidebar-reset-progress-button"
          onClick={progress.resetProgress}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors duration-150"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Progress
        </button>
      </div>
    </div>
  );
};
