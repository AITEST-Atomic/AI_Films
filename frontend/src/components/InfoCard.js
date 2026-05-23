import { Info } from "lucide-react";

export const InfoCard = ({ title, content }) => {
  return (
    <div className="mb-8 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-amber-300">{title}</span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{content}</p>
    </div>
  );
};
