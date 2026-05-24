import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Lock,
  Mic, Image, Type, Video, Sparkles, Loader2
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STORAGE_KEY = "lipsync_workshop_progress";

const getInitialProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { completedSteps: [], currentStep: 1 };
};

const ICON_MAP = {
  T: Type,
  IMG: Image,
  MIC: Mic,
  VID: Video,
};

// ============ SIDEBAR ============
const LipSyncSidebar = ({ steps, progress, onStepClick }) => {
  const completedCount = progress.completedSteps.length;
  const pct = Math.round((completedCount / 4) * 100);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full" data-testid="lipsync-sidebar">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-3 text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Trainings
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-500/15 border border-violet-500/25">
            <Video className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>LIP Sync Workflow</h1>
            <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider">Step-by-Step Guide</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-zinc-500">Progress</span>
          <span className="text-[11px] text-violet-400 font-medium">{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5 bg-white/10" data-testid="lipsync-progress-bar" />
      </div>

      {/* Steps */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-0.5">
          {steps.map((step) => {
            const isActive = step.order === progress.currentStep;
            const isCompleted = progress.completedSteps.includes(step.order);
            const IconComp = ICON_MAP[step.icon] || Type;

            return (
              <motion.button
                key={step.order}
                data-testid={`lipsync-step-${step.order}-btn`}
                onClick={() => onStepClick(step.order)}
                className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors duration-150
                  ${isActive ? 'bg-violet-500/10 text-zinc-100' : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'}
                `}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div layoutId="lsActiveStep" className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-violet-400" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  ${isCompleted ? 'bg-violet-500 text-white' : isActive ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-white/[0.05] text-zinc-500 border border-white/[0.08]'}
                `}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <IconComp className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm truncate ${isActive ? 'text-zinc-100 font-medium' : 'text-zinc-300'}`}>{step.title}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{step.subtitle}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

// ============ STEP SKELETON ============
const LipSyncSkeleton = () => (
  <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10 animate-pulse">
    <div className="h-6 w-20 rounded-full bg-white/[0.06] mb-6" />
    <div className="h-9 w-[60%] rounded-lg bg-white/[0.06] mb-3" />
    <div className="h-4 w-[80%] rounded bg-white/[0.04] mb-8" />
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
      <div className="h-5 w-32 rounded bg-white/[0.06] mb-4" />
      {[1,2,3,4].map(i => <div key={i} className="h-10 rounded-lg bg-white/[0.04] mb-2" />)}
    </div>
  </div>
);

// ============ PROMPT BLOCK (Purple variant) ============
const LipSyncPromptBlock = ({ title, body }) => {
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
    <div className="rounded-2xl border border-violet-500/20 bg-[#0d0e14] overflow-hidden mt-6">
      <div className="flex items-center justify-between px-5 py-3 border-b border-violet-500/15 bg-violet-500/[0.04]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-zinc-200">{title}</span>
        </div>
        <button data-testid="lipsync-copy-prompt" onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.1] transition-colors">
          {copied ? <><Check className="w-3.5 h-3.5 text-green-400" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Prompt</>}
        </button>
      </div>
      <div className="p-5">
        <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">{body}</pre>
      </div>
    </div>
  );
};

// ============ MAIN STEP CONTENT ============
const LipSyncStepContent = ({ stepData, loading, progress, onComplete, onPrevious }) => {
  const prefersReducedMotion = useReducedMotion();
  const [scriptInput, setScriptInput] = useState("");

  if (loading || !stepData) return <LipSyncSkeleton />;

  const isCompleted = progress.completedSteps.includes(stepData.order);

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
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-medium text-violet-400">
            Step {stepData.order} of 4
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="lipsync-step-title">
          {stepData.title}
        </h1>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-8 max-w-[720px]">{stepData.description}</p>

        {/* Interactive: Choose Character (Step 2) */}
        {stepData.interactive && stepData.interactive.type === "choose_character" && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="w-4 h-4 text-violet-400" />
              <h3 className="text-base font-semibold text-zinc-100">{stepData.interactive.title}</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {stepData.interactive.links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-500/20 bg-violet-500/[0.04] text-sm text-zinc-200 hover:bg-violet-500/[0.08] transition-colors">
                  {link.label} <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Gemini Script Assistant (Step 2) */}
        {stepData.geminiAssistant && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="text-base font-semibold text-zinc-100">Gemini Script Assistant</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Generate a formatted JSON script for your lip-sync workflow.</p>
            <textarea
              data-testid="gemini-script-input"
              value={scriptInput}
              onChange={(e) => setScriptInput(e.target.value)}
              placeholder="Describe the character and what they should say..."
              className="w-full h-28 px-4 py-3 rounded-xl bg-[#0d0e14] border border-white/[0.08] text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500/40 transition-colors"
            />
            <button
              data-testid="generate-json-btn"
              className="w-full mt-3 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Generate JSON Script
            </button>
          </div>
        )}

        {/* Action Items */}
        {stepData.actionItems && stepData.actionItems.length > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-4 h-4 text-violet-400" />
              <h3 className="text-base font-semibold text-zinc-100">Action Items</h3>
            </div>
            <div className="space-y-2">
              {stepData.actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]" data-testid={`lipsync-action-${i+1}`}>
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-500 text-white text-xs font-semibold flex-shrink-0">{i + 1}</div>
                  <p className="text-sm text-zinc-200 pt-0.5">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {stepData.resources && stepData.resources.length > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="w-4 h-4 text-violet-400" />
              <h3 className="text-base font-semibold text-zinc-100">Resources & Links</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {stepData.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" data-testid={`lipsync-resource-${i}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-500/20 bg-violet-500/[0.04] text-sm text-zinc-200 hover:bg-violet-500/[0.08] transition-colors">
                  {r.label} <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Modules (Step 2 & 4) */}
        {stepData.modules && stepData.modules.length > 0 && (
          <div className="space-y-4 mb-6">
            {stepData.modules.map((mod) => (
              <div key={mod.id} className={`rounded-2xl border transition-all ${mod.locked ? 'border-white/[0.06] bg-[#0d0e14] opacity-70 p-5' : 'border-violet-500/15 bg-white/[0.02] overflow-hidden'}`}>
                {/* Module header */}
                <div className={`flex items-center justify-between ${mod.locked ? '' : 'px-5 pt-5 pb-3'}`}>
                  <h4 className="text-sm font-semibold text-zinc-100">{mod.title}</h4>
                  {mod.locked && <Lock className="w-4 h-4 text-amber-400" />}
                </div>
                {/* Module description */}
                {!mod.locked && mod.description && (
                  <p className="text-sm text-zinc-400 leading-relaxed px-5 mb-4">{mod.description}</p>
                )}
                {/* Module action items */}
                {!mod.locked && mod.actionItems && mod.actionItems.length > 0 && (
                  <div className="px-5 mb-4">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Action Items</p>
                    <div className="space-y-2">
                      {mod.actionItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02]">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500 text-white text-[10px] font-semibold flex-shrink-0">{i + 1}</div>
                          <p className="text-sm text-zinc-200 pt-0.5">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Module prompts */}
                {!mod.locked && mod.prompts && mod.prompts.length > 0 && (
                  <div className="px-5 mb-4">
                    {mod.prompts.map((p, i) => (
                      <LipSyncPromptBlock key={i} title={p.title} body={p.body} />
                    ))}
                  </div>
                )}
                {/* Module resources */}
                {!mod.locked && mod.resources && mod.resources.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-5 pb-5">
                    {mod.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-violet-500/20 bg-violet-500/[0.04] text-xs text-zinc-200 hover:bg-violet-500/[0.08] transition-colors">
                        {r.label} <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Prompts */}
        {stepData.prompts && stepData.prompts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-zinc-500" />
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">AI Prompts & Scripts</p>
            </div>
            {stepData.prompts.map((p, i) => (
              <LipSyncPromptBlock key={i} title={p.title} body={p.body} />
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
          <button
            data-testid="lipsync-prev-btn"
            onClick={onPrevious}
            disabled={stepData.order <= 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${stepData.order <= 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06]'}
            `}
          >
            <ChevronLeft className="w-4 h-4" /> Previous Step
          </button>
          <button
            data-testid="lipsync-complete-btn"
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20"
          >
            {isCompleted ? 'Continue' : 'Complete & Continue'}
            <Check className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============ MAIN PAGE ============
export const LipSyncWorkshop = () => {
  const [steps, setSteps] = useState([]);
  const [stepData, setStepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(getInitialProgress);

  // Persist progress
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
  }, [progress]);

  // Fetch steps list
  useEffect(() => {
    axios.get(`${API}/lipsync/steps`).then(r => setSteps(r.data)).catch(console.error);
  }, []);

  // Fetch step data
  const fetchStep = useCallback(async (order) => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/lipsync/steps/${order}`);
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
      return { ...p, completedSteps: newCompleted, currentStep: Math.min(p.currentStep + 1, 4) };
    });
  };

  const goPrev = () => {
    if (progress.currentStep > 1) goToStep(progress.currentStep - 1);
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <div className="sidebar-wrapper" style={{ background: '#0a0b10' }}>
        <LipSyncSidebar steps={steps} progress={progress} onStepClick={goToStep} />
      </div>
      {/* Main */}
      <div className="main-content">
        <LipSyncStepContent
          stepData={stepData}
          loading={loading}
          progress={progress}
          onComplete={completeStep}
          onPrevious={goPrev}
        />
      </div>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
};
