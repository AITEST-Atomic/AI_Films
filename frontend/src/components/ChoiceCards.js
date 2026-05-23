import { motion } from "framer-motion";

export const ChoiceCards = ({ interactive, selectedChoice, onChoiceSelect }) => {
  if (!interactive) return null;

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-100 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {interactive.prompt}
        </h3>
        <p className="text-sm text-zinc-400">{interactive.subtext}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {interactive.choices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          return (
            <motion.button
              key={choice.id}
              data-testid={`choice-card-${choice.id}`}
              onClick={() => onChoiceSelect(choice.id)}
              className={`relative flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200
                ${isSelected
                  ? 'border-amber-500/40 bg-amber-500/[0.08] shadow-[0_0_0_1px_rgba(245,158,11,0.2)]'
                  : 'border-white/[0.08] bg-[#121318] hover:border-white/[0.15] hover:bg-[#161820]'
                }
              `}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">{choice.emoji}</span>
              <div>
                <p className={`text-sm font-medium ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                  {choice.title}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{choice.desc}</p>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="selectedChoice"
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
