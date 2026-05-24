import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Lock, ArrowRight, Sparkles } from "lucide-react";

const CARDS = [
  {
    id: "ai-film-making",
    title: "AI Film Making Process Workflow",
    description: "Master the complete AI filmmaking pipeline — from concept to final cut. 8 steps to create cinematic brand films.",
    emoji: "🎬",
    status: "active",
    route: "/workshop",
    gradient: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    accentColor: "text-amber-400",
    bgGlow: "shadow-amber-500/10",
  },
  {
    id: "lip-sync",
    title: "LIP Sync Workflow",
    description: "Step-by-step guide to creating lip-synced videos using VEO, Wan.video, Google Flow, and more. 4 methods covered.",
    emoji: "🎤",
    status: "active",
    route: "/lip-sync",
    gradient: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500/30",
    accentColor: "text-violet-400",
    bgGlow: "shadow-violet-500/10",
  },
  {
    id: "coming-soon-3",
    title: "Coming Soon",
    description: "Another powerful workshop is on the way. We're building something special.",
    emoji: "✨",
    status: "coming_soon",
    route: null,
    gradient: "from-purple-500/10 to-pink-500/10",
    borderColor: "border-white/[0.08]",
    accentColor: "text-purple-400",
    bgGlow: "",
  },
  {
    id: "coming-soon-4",
    title: "Coming Soon",
    description: "More training content dropping soon. Watch this space.",
    emoji: "🔮",
    status: "coming_soon",
    route: null,
    gradient: "from-emerald-500/10 to-teal-500/10",
    borderColor: "border-white/[0.08]",
    accentColor: "text-emerald-400",
    bgGlow: "",
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f10] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0B0C0F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Film className="w-5 h-5 text-amber-400" />
          </div>
          <h1
            className="text-lg font-semibold text-zinc-100"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Trainings
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 md:mb-14"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight mb-3"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
            data-testid="landing-title"
          >
            Trainings
          </h2>
          <p className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed">
            Explore our workshops and training modules. Pick a card and start learning.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" data-testid="landing-cards-grid">
          {CARDS.map((card, index) => {
            const isActive = card.status === "active";

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <button
                  data-testid={`landing-card-${card.id}`}
                  onClick={() => isActive && card.route && navigate(card.route)}
                  disabled={!isActive}
                  className={`relative w-full text-left rounded-2xl border p-6 transition-all duration-200 group
                    ${card.borderColor}
                    ${isActive
                      ? `bg-gradient-to-br ${card.gradient} hover:border-amber-500/50 hover:shadow-lg ${card.bgGlow} cursor-pointer`
                      : `bg-[#121318] cursor-default opacity-70`
                    }
                  `}
                >
                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{card.emoji}</span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        <Lock className="w-3 h-3" />
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-lg font-semibold mb-2 ${isActive ? "text-zinc-100" : "text-zinc-400"}`}
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-5 ${isActive ? "text-zinc-300" : "text-zinc-500"}`}>
                    {card.description}
                  </p>

                  {/* CTA */}
                  {isActive ? (
                    <div className={`flex items-center gap-2 text-sm font-medium ${card.accentColor} group-hover:gap-3 transition-all duration-200`}>
                      Start Training
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Lock className="w-3.5 h-3.5" />
                      Not available yet
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0B0C0F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-[11px] text-zinc-600 text-center">AFM Workshop</p>
        </div>
      </footer>
    </div>
  );
};
