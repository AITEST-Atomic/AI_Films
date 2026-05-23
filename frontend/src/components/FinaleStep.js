import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronLeft, Sparkles, Trophy, ExternalLink, Instagram, ArrowRight, Star } from "lucide-react";
import { ActionItems } from "@/components/ActionItems";

export const FinaleStep = ({ stepData, progress, onPrevious, onComplete, isCompleted }) => {
  const confettiFired = useRef(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!confettiFired.current) {
      confettiFired.current = true;
      fireConfetti();
    }
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const fireConfetti = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        particleCount: Math.floor(count * particleRatio),
        ...opts,
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    // Second burst
    setTimeout(() => {
      fire(0.15, { spread: 80, startVelocity: 35, origin: { x: 0.2, y: 0.6 } });
      fire(0.15, { spread: 80, startVelocity: 35, origin: { x: 0.8, y: 0.6 } });
    }, 300);
  };

  const extras = stepData.finaleExtras || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-400">
          STEP 8
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-400">
          FINALE
        </span>
      </div>

      {/* Hero congratulations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center py-8 mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/15 border border-amber-500/25 mb-6">
          <Trophy className="w-10 h-10 text-amber-400" />
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight mb-3"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          data-testid="finale-title"
        >
          {stepData.heading}
        </h1>
        <p className="text-base text-zinc-400 max-w-[520px] mx-auto leading-relaxed">
          {stepData.description}
        </p>

        {/* Earned title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25"
        >
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">Your Title: Executive Director</span>
          <Star className="w-4 h-4 text-amber-400" />
        </motion.div>
      </motion.div>

      {/* But Wait... YouTube Section */}
      {extras.videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-zinc-100 mb-1 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            But Wait...
          </h2>
          <p className="text-sm text-amber-400 text-center mb-4">We are NOT done yet.</p>

          <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#121318]" data-testid="finale-video-embed">
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={extras.videoUrl}
                title="Workshop Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.06]">
              <p className="text-xs text-zinc-500">Video not loading? Watch directly on YouTube.</p>
              <a
                href={extras.videoUrl.replace('/embed/', '/watch?v=')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-colors"
              >
                <ArrowRight className="w-3 h-3" />
                Watch on YouTube
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Story */}
      {extras.successStory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-xl border border-white/[0.08] bg-[#121318] p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{extras.successStory.emoji_before}</span>
            <ArrowRight className="w-5 h-5 text-zinc-500" />
            <span className="text-3xl">{extras.successStory.emoji_after}</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed mb-3">
            {extras.successStory.text}
          </p>
          <p className="text-xl font-bold text-amber-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {extras.successStory.highlight}
          </p>
        </motion.div>
      )}

      {/* Do This Right Now */}
      {extras.doThisNow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="rounded-xl border-2 border-amber-500/30 bg-amber-500/[0.04] p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-medium text-amber-400 uppercase tracking-[0.15em]">Do This Right Now</p>
          </div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {extras.doThisNow.title}
          </h3>
          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{extras.doThisNow.description}</p>
          <div className="space-y-2">
            {extras.doThisNow.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0B0C0F]/50 border border-white/[0.04]">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-semibold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-zinc-200">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bonus Section */}
      {extras.bonus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="rounded-xl border-2 border-pink-500/30 bg-pink-500/[0.03] p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-medium text-pink-400 uppercase tracking-[0.15em]">{extras.bonus.subtitle}</p>
          </div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {extras.bonus.title}
          </h3>
          <p className="text-sm text-zinc-400 mb-5 leading-relaxed">{extras.bonus.description}</p>

          <div className="flex flex-wrap gap-3 mb-4">
            {extras.bonus.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-white hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/20"
              >
                <Instagram className="w-4 h-4" />
                {link.label}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
          <p className="text-xs text-zinc-500">{extras.bonus.footnote}</p>
        </motion.div>
      )}

      {/* Navigation footer */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
        <button
          data-testid="previous-step-button"
          onClick={onPrevious}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-colors duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Step
        </button>

        <button
          data-testid="complete-and-continue-button"
          onClick={() => {
            onComplete();
            fireConfetti();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 transition-colors duration-150 shadow-lg shadow-amber-500/20"
        >
          <Sparkles className="w-4 h-4" />
          Celebrate Again
          <span className="text-base">🎉</span>
        </button>
      </div>
    </motion.div>
  );
};
