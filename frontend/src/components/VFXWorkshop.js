import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, Copy, ExternalLink,
  Lock, Sparkles, Grid3X3
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;
const STORAGE_KEY = "vfx_workshop_progress";

const getInitialProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { completedSteps: [], currentStep: 1 };
};

// ============ SIDEBAR ============
const VFXSidebar = ({ steps, progress, onStepClick }) => {
  const completedCount = progress.completedSteps.length;
  const pct = Math.round((completedCount / 5) * 100);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full" data-testid="vfx-sidebar">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-3 text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Trainings
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
            <Grid3X3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>VFX Workspace</h1>
            <p className="text-[10px] text-zinc-500 mt-0.5">Character Product Background Workflow</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Progress</span>
          <span className="text-[11px] text-indigo-400 font-medium">{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5 bg-white/10" data-testid="vfx-progress-bar" />
      </div>

      {/* Steps */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-0.5">
          {steps.map((step) => {
            const isActive = step.order === progress.currentStep;
            const isCompleted = progress.completedSteps.includes(step.order);
            const isLocked = step.locked;

            return (
              <motion.button
                key={step.order}
                data-testid={`vfx-step-${step.order}-btn`}
                onClick={() => onStepClick(step.order)}
                className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors duration-150
                  ${isActive ? 'bg-indigo-500/10 text-zinc-100' : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'}
                `}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div layoutId="vfxActiveStep" className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-indigo-400" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
                <div className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 text-xs font-semibold
                  ${isCompleted ? 'bg-indigo-500 text-white'
                    : isLocked ? 'bg-white/[0.03] text-zinc-600 border border-white/[0.06]'
                    : isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-white/[0.05] text-zinc-500 border border-white/[0.08]'}
                `}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : isLocked ? <Lock className="w-3 h-3" /> : step.order}
                </div>
                <p className={`text-sm leading-snug ${isActive ? 'text-zinc-100 font-medium' : isLocked ? 'text-zinc-500' : 'text-zinc-300'}`}>{step.title}</p>
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

// ============ SKELETON ============
const VFXSkeleton = () => (
  <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10 animate-pulse">
    <div className="h-6 w-20 rounded-full bg-white/[0.06] mb-6" />
    <div className="h-9 w-[60%] rounded-lg bg-white/[0.06] mb-3" />
    <div className="h-4 w-[80%] rounded bg-white/[0.04] mb-8" />
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      {[1,2,3,4].map(i => <div key={i} className="h-10 rounded-lg bg-white/[0.04] mb-2" />)}
    </div>
  </div>
);

// ============ PROMPT BLOCK (Indigo variant) ============
const VFXPromptBlock = ({ title, body }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      toast.success("Prompt copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Copy failed"); }
  };
  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-[#0d0e14] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-500/15 bg-indigo-500/[0.04]">
        <span className="text-sm font-medium text-zinc-200">{title}</span>
        <button data-testid="vfx-copy-prompt" onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.1] transition-colors">
          {copied ? <><Check className="w-3.5 h-3.5 text-green-400" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Prompt</>}
        </button>
      </div>
      <div className="p-5">
        <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">{body}</pre>
      </div>
    </div>
  );
};

// ============ STEP CONTENT ============
const VFXStepContent = ({ stepData, loading, progress, onComplete, onPrevious, totalSteps }) => {
  const prefersReducedMotion = useReducedMotion();

  if (loading || !stepData) return <VFXSkeleton />;

  const isCompleted = progress.completedSteps.includes(stepData.order);
  const isLocked = stepData.locked;
  const isLastStep = stepData.order === totalSteps;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepData.order}
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
        className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10"
      >
        {/* Step pill */}
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-400">
            Step {stepData.order} of {totalSteps}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="vfx-step-title">
          {stepData.title}
        </h1>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-8 max-w-[720px]">{stepData.description}</p>

        {/* Locked state */}
        {isLocked && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d0e14] p-10 flex flex-col items-center justify-center text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Workflow Locked</h3>
            <p className="text-sm text-zinc-500 max-w-sm">This section of the workflow is currently locked and unavailable. Please proceed to the next available step.</p>
          </div>
        )}

        {/* Action Items */}
        {!isLocked && stepData.actionItems && stepData.actionItems.length > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Action Items</h3>
            <div className="space-y-2">
              {stepData.actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]" data-testid={`vfx-action-${i+1}`}>
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500 text-white text-xs font-semibold flex-shrink-0">{i + 1}</div>
                  <p className="text-sm text-zinc-200 pt-0.5">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Prompts */}
        {!isLocked && stepData.prompts && stepData.prompts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">AI Prompts</h3>
            <div className="space-y-4">
              {stepData.prompts.map((p, i) => (
                <VFXPromptBlock key={i} title={p.title} body={p.body} />
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {!isLocked && stepData.resources && stepData.resources.length > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Resources</h3>
            <div className="flex flex-wrap gap-2">
              {stepData.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" data-testid={`vfx-resource-${i}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.04] text-sm text-zinc-200 hover:bg-indigo-500/[0.08] transition-colors">
                  {r.label} <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
          <button
            data-testid="vfx-prev-btn"
            onClick={onPrevious}
            disabled={stepData.order <= 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${stepData.order <= 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06]'}
            `}
          >
            <ChevronLeft className="w-4 h-4" /> Previous Step
          </button>
          <button
            data-testid="vfx-complete-btn"
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
          >
            {isLastStep ? 'Finish Workflow' : isCompleted ? 'Continue' : 'Complete & Continue'}
            <Check className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============ MAIN PAGE ============
export const VFXWorkshop = () => {
  const [steps, setSteps] = useState([]);
  const [stepData, setStepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(getInitialProgress);
  const totalSteps = 5;

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
  }, [progress]);

  useEffect(() => {
    axios.get(`${API}/vfx/steps`).then(r => setSteps(r.data)).catch(console.error);
  }, []);

  const fetchStep = useCallback(async (order) => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/vfx/steps/${order}`);
      setStepData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStep(progress.currentStep); }, [progress.currentStep, fetchStep]);

  const goToStep = (order) => setProgress(p => ({ ...p, currentStep: order }));

  const completeStep = () => {
    setProgress(p => {
      const newCompleted = p.completedSteps.includes(p.currentStep)
        ? p.completedSteps
        : [...p.completedSteps, p.currentStep].sort((a, b) => a - b);
      return { ...p, completedSteps: newCompleted, currentStep: Math.min(p.currentStep + 1, totalSteps) };
    });
  };

  const goPrev = () => {
    if (progress.currentStep > 1) goToStep(progress.currentStep - 1);
  };

  return (
    <div className="app-shell">
      <div className="sidebar-wrapper" style={{ background: '#0a0b10' }}>
        <VFXSidebar steps={steps} progress={progress} onStepClick={goToStep} />
      </div>
      <div className="main-content">
        <VFXStepContent
          stepData={stepData}
          loading={loading}
          progress={progress}
          onComplete={completeStep}
          onPrevious={goPrev}
          totalSteps={totalSteps}
        />
      </div>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
};
