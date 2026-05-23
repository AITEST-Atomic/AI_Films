import { motion, AnimatePresence } from "framer-motion";
import { BadgeCard } from "@/components/BadgeCard";
import { ActionItems } from "@/components/ActionItems";
import { PromptBlock } from "@/components/PromptBlock";
import { ResourceLinks } from "@/components/ResourceLinks";
import { ChoiceCards } from "@/components/ChoiceCards";
import { FinaleStep } from "@/components/FinaleStep";
import { InfoCard } from "@/components/InfoCard";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";

export const StepContent = ({ stepData, loading, progress, onComplete, onPrevious, totalSteps }) => {
  if (loading || !stepData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const isCompleted = progress.isStepCompleted(stepData.order);
  const isFinale = stepData.order === 8;

  if (isFinale) {
    return (
      <FinaleStep
        stepData={stepData}
        progress={progress}
        onPrevious={onPrevious}
        onComplete={onComplete}
        isCompleted={isCompleted}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepData.order}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10"
      >
        {/* Step indicator pills */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-400">
            STEP {stepData.order}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-400">
            {stepData.order} / {totalSteps}
          </span>
        </div>

        {/* Step title */}
        <div className="mb-8">
          <h1
            className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight mb-3"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            data-testid="step-title"
          >
            {stepData.heading}
          </h1>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-[680px]">
            {stepData.description}
          </p>
        </div>

        {/* Badge card */}
        <BadgeCard
          badgeName={stepData.badgeName}
          badgeIcon={stepData.badgeIcon}
          isUnlocked={isCompleted}
          stepOrder={stepData.order}
        />

        {/* Interactive section */}
        {stepData.interactive && stepData.interactive.type === 'choice_cards' && (
          <ChoiceCards
            interactive={stepData.interactive}
            selectedChoice={progress.step1Choice}
            onChoiceSelect={progress.setStep1Choice}
          />
        )}

        {stepData.interactive && stepData.interactive.type === 'info_card' && (
          <InfoCard
            title={stepData.interactive.title}
            content={stepData.interactive.content}
          />
        )}

        {/* Action Items */}
        {stepData.actionItems && stepData.actionItems.length > 0 && (
          <ActionItems items={stepData.actionItems} />
        )}

        {/* AI Prompts */}
        {stepData.prompts && stepData.prompts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-zinc-500" />
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">AI Prompts</p>
            </div>
            <div className="space-y-4">
              {stepData.prompts.map((prompt, i) => (
                <PromptBlock key={i} title={prompt.title} body={prompt.body} />
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {stepData.resources && stepData.resources.length > 0 && (
          <ResourceLinks resources={stepData.resources} />
        )}

        {/* Navigation footer */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
          <button
            data-testid="previous-step-button"
            onClick={onPrevious}
            disabled={stepData.order <= 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150
              ${stepData.order <= 1
                ? 'text-zinc-600 cursor-not-allowed'
                : 'text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06]'
              }
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>

          <button
            data-testid="complete-and-continue-button"
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 transition-colors duration-150 shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            {isCompleted ? 'Continue' : 'Complete & Continue'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
