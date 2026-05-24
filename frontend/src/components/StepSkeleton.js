export const StepSkeleton = () => {
  return (
    <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 animate-pulse" data-testid="step-skeleton">
      {/* Step indicator pills */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-6 w-16 rounded-full bg-white/[0.06]" />
        <div className="h-6 w-12 rounded-full bg-white/[0.04]" />
      </div>

      {/* Title */}
      <div className="mb-8">
        <div className="h-8 w-[70%] rounded-lg bg-white/[0.06] mb-3" />
        <div className="h-4 w-[90%] rounded bg-white/[0.04] mb-2" />
        <div className="h-4 w-[60%] rounded bg-white/[0.04]" />
      </div>

      {/* Badge card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#121318] p-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/[0.04]" />
          <div>
            <div className="h-3 w-24 rounded bg-white/[0.04] mb-2" />
            <div className="h-4 w-32 rounded bg-white/[0.06]" />
          </div>
        </div>
      </div>

      {/* Action items */}
      <div className="mt-8">
        <div className="h-3 w-28 rounded bg-white/[0.04] mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#121318] border border-white/[0.04]">
              <div className="w-7 h-7 rounded-full bg-white/[0.06] flex-shrink-0" />
              <div className="flex-1 pt-1">
                <div className="h-4 w-[80%] rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt block */}
      <div className="mt-8">
        <div className="h-3 w-24 rounded bg-white/[0.04] mb-4" />
        <div className="rounded-xl border border-white/[0.04] bg-[#0B0C0F] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
            <div className="h-4 w-40 rounded bg-white/[0.06]" />
            <div className="h-7 w-24 rounded-lg bg-white/[0.04]" />
          </div>
          <div className="p-4 space-y-2">
            <div className="h-3 w-full rounded bg-white/[0.04]" />
            <div className="h-3 w-[95%] rounded bg-white/[0.04]" />
            <div className="h-3 w-[88%] rounded bg-white/[0.04]" />
            <div className="h-3 w-[70%] rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="mt-8">
        <div className="h-3 w-24 rounded bg-white/[0.04] mb-4" />
        <div className="flex gap-2">
          <div className="h-9 w-32 rounded-lg bg-white/[0.04]" />
          <div className="h-9 w-28 rounded-lg bg-white/[0.04]" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.04]">
        <div className="h-10 w-36 rounded-xl bg-white/[0.04]" />
        <div className="h-10 w-48 rounded-xl bg-amber-500/10" />
      </div>
    </div>
  );
};
