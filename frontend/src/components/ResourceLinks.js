import { ExternalLink, Link as LinkIcon } from "lucide-react";

export const ResourceLinks = ({ resources }) => {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <LinkIcon className="w-4 h-4 text-zinc-500" />
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em]">Resources</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {resources.map((resource, i) => (
          <a
            key={i}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`resource-link-${i}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] text-sm text-zinc-200 hover:bg-amber-500/[0.08] hover:border-amber-500/30 transition-all duration-150"
          >
            {resource.label}
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        ))}
      </div>
    </div>
  );
};
