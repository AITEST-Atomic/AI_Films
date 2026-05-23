import { Menu, X, Film } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";

export const MobileHeader = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  steps,
  progress,
  currentLevel,
  nextBadge,
  onStepClick,
  directorLevels
}) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B0C0F] border-b border-white/[0.06] px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium text-zinc-100" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AFM Workshop
          </span>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-white/5" data-testid="mobile-menu-button">
              {mobileMenuOpen ? <X className="w-5 h-5 text-zinc-300" /> : <Menu className="w-5 h-5 text-zinc-300" />}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-[#0B0C0F] border-r border-white/[0.08]">
            <Sidebar
              steps={steps}
              progress={progress}
              currentLevel={currentLevel}
              nextBadge={nextBadge}
              onStepClick={(order) => {
                onStepClick(order);
                setMobileMenuOpen(false);
              }}
              directorLevels={directorLevels}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
