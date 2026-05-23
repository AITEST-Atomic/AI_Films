import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const PromptBlock = ({ title, body }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      toast.success("Prompt copied to clipboard!", {
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error("Failed to copy prompt");
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/15 bg-[#0B0C0F] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-zinc-200">{title}</span>
        </div>
        <button
          data-testid="prompt-copy-button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.1] transition-colors duration-150"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy Prompt
            </>
          )}
        </button>
      </div>
      {/* Body */}
      <div className="p-4">
        <pre className="font-mono text-xs md:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {body}
        </pre>
      </div>
    </div>
  );
};
