import { ClipboardList } from "lucide-react";

export const ActionItems = ({ items }) => {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-4 h-4 text-zinc-500" />
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">Action Items</p>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#121318] border border-white/[0.06]"
            data-testid={`action-item-${index + 1}`}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-black text-xs font-semibold flex-shrink-0 mt-0.5 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]">
              {index + 1}
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed pt-0.5">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
