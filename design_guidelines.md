{
  "design_system_name": "AI Film Maker's Workflow — The Videopreneur's OS",
  "brand_attributes": [
    "cinematic",
    "professional workshop",
    "high-contrast",
    "warm amber guidance",
    "tool-like (OS / control room)",
    "rewarding progression"
  ],
  "visual_personality": {
    "style_fusion": [
      "Cinematic control-room dashboard (dark navy/black, subtle bloom)",
      "Swiss-style hierarchy (tight typographic grid, clear labels)",
      "Bento card layout for step content",
      "Subtle glass/metal surfaces (no heavy gradients; use glow + noise instead)"
    ],
    "do_not": [
      "No centered app container layouts",
      "No purple accents (except Finale collab buttons where magenta is explicitly required)",
      "No saturated gradients covering large areas",
      "No 'transition: all'"
    ]
  },
  "typography": {
    "google_fonts": {
      "heading": {
        "family": "Space Grotesk",
        "weights": ["500", "600", "700"],
        "usage": "All headings, sidebar brand, step titles"
      },
      "body": {
        "family": "IBM Plex Sans",
        "weights": ["400", "500", "600"],
        "usage": "Body copy, labels, buttons"
      },
      "mono": {
        "family": "IBM Plex Mono",
        "weights": ["400", "500"],
        "usage": "AI prompt code blocks"
      }
    },
    "scale_tailwind": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-muted-foreground",
      "step_title": "text-2xl md:text-3xl font-semibold tracking-tight",
      "section_title": "text-lg font-semibold",
      "body": "text-sm md:text-base leading-relaxed",
      "small": "text-xs text-muted-foreground"
    },
    "letter_spacing": {
      "labels": "tracking-wide",
      "brand": "tracking-tight"
    }
  },
  "color_system": {
    "notes": [
      "Must match original: dark navy/black base (#0f0f10-ish)",
      "Amber/orange is the primary accent for progress, active states, numbered items",
      "Finale collab buttons may use magenta/pink gradient but keep it confined to the button surface only"
    ],
    "tokens_css_variables": {
      "base": {
        "--bg-0": "#0B0C0F",
        "--bg-1": "#0F0F10",
        "--panel": "#121318",
        "--panel-2": "#171923",
        "--text": "#F3F4F6",
        "--text-muted": "#A1A1AA",
        "--border": "rgba(255,255,255,0.08)",
        "--border-strong": "rgba(245,158,11,0.22)",
        "--shadow": "0 18px 60px rgba(0,0,0,0.55)",
        "--shadow-soft": "0 10px 30px rgba(0,0,0,0.35)"
      },
      "accent_amber": {
        "--accent": "#F59E0B",
        "--accent-2": "#FDBA74",
        "--accent-ink": "#1A1206",
        "--accent-glow": "rgba(245,158,11,0.35)",
        "--accent-glow-soft": "rgba(245,158,11,0.18)"
      },
      "status": {
        "--success": "#22C55E",
        "--warning": "#F59E0B",
        "--danger": "#EF4444",
        "--info": "#38BDF8"
      },
      "finale_magenta": {
        "--finale-pink": "#EC4899",
        "--finale-magenta": "#D946EF",
        "--finale-ink": "#120611"
      },
      "focus": {
        "--ring": "rgba(245,158,11,0.55)"
      }
    },
    "tailwind_mapping_guidance": {
      "backgrounds": ["bg-[#0f0f10]", "bg-[#121318]", "bg-[#171923]"],
      "text": ["text-zinc-100", "text-zinc-300", "text-zinc-400"],
      "borders": ["border-white/10", "border-amber-500/20"],
      "accent": ["text-amber-400", "bg-amber-500", "ring-amber-400/50"]
    }
  },
  "gradients_and_texture": {
    "gradient_restriction_rule": {
      "prohibited": [
        "blue-500 to purple-600",
        "purple-500 to pink-500",
        "green-500 to blue-500",
        "red to pink"
      ],
      "rules": [
        "Never let gradients cover more than 20% of the viewport",
        "Never apply gradients to text-heavy reading areas",
        "Never use gradients on small UI elements (<100px width)",
        "Never stack multiple gradient layers in the same viewport"
      ],
      "allowed": [
        "Hero header background wash (very subtle)",
        "Decorative overlays (noise + vignette)",
        "Finale collab CTA buttons only (magenta/pink)"
      ]
    },
    "recommended_background_treatment": {
      "approach": "Use solid dark base + vignette + subtle noise overlay for cinematic feel.",
      "css_snippet": "/* Add to index.css */\n.bg-cinema {\n  background: radial-gradient(1200px 600px at 20% 0%, rgba(245,158,11,0.10), transparent 55%),\n              radial-gradient(900px 500px at 80% 20%, rgba(56,189,248,0.06), transparent 60%),\n              linear-gradient(180deg, #0B0C0F 0%, #0F0F10 55%, #0B0C0F 100%);\n}\n.noise-overlay {\n  position: relative;\n}\n.noise-overlay:before {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\"0.12\"/></svg>');\n  mix-blend-mode: overlay;\n  opacity: 0.35;\n}\n.vignette:after {\n  content: \"\";\n  position: absolute;\n  inset: -1px;\n  pointer-events: none;\n  background: radial-gradient(1200px 700px at 50% 10%, transparent 40%, rgba(0,0,0,0.55) 100%);\n}\n"
    }
  },
  "layout_and_grid": {
    "app_shell": {
      "sidebar_width": "w-[280px]",
      "structure": "Fixed left sidebar + scrollable main content. Main content uses max-w-[1100px] but NOT centered globally; align to left with comfortable padding.",
      "main_padding": "px-4 sm:px-6 lg:px-10 py-6",
      "content_grid": "Use a 12-col grid for desktop sections; collapse to single column on mobile. Prefer bento: 8/4 split for badge + progress widgets when available."
    },
    "responsive": {
      "mobile": "Sidebar becomes Sheet/Drawer (shadcn Sheet) triggered by a top-left menu button.",
      "desktop": "Sidebar fixed with its own ScrollArea; main content scrolls independently."
    }
  },
  "components": {
    "component_path": {
      "navigation": {
        "sidebar_scroll": "/app/frontend/src/components/ui/scroll-area.jsx",
        "sheet_mobile_sidebar": "/app/frontend/src/components/ui/sheet.jsx",
        "separator": "/app/frontend/src/components/ui/separator.jsx",
        "tooltip": "/app/frontend/src/components/ui/tooltip.jsx"
      },
      "content": {
        "card": "/app/frontend/src/components/ui/card.jsx",
        "badge": "/app/frontend/src/components/ui/badge.jsx",
        "button": "/app/frontend/src/components/ui/button.jsx",
        "progress": "/app/frontend/src/components/ui/progress.jsx",
        "tabs_optional": "/app/frontend/src/components/ui/tabs.jsx",
        "accordion_optional": "/app/frontend/src/components/ui/accordion.jsx",
        "dialog": "/app/frontend/src/components/ui/alert-dialog.jsx",
        "sonner_toast": "/app/frontend/src/components/ui/sonner.jsx"
      },
      "forms": {
        "radio_group_step1": "/app/frontend/src/components/ui/radio-group.jsx",
        "checkbox": "/app/frontend/src/components/ui/checkbox.jsx",
        "textarea": "/app/frontend/src/components/ui/textarea.jsx"
      }
    },
    "custom_components_to_create": [
      {
        "name": "SidebarCurriculum",
        "purpose": "Branding, director level, progress, 8-step list with active state + completion check, reset button",
        "notes": "Use ScrollArea for step list; each step row is a Button variant=ghost with left accent bar when active."
      },
      {
        "name": "StepHeader",
        "purpose": "Step title, description, step counter (X/8), progress bar"
      },
      {
        "name": "BadgeUnlockCard",
        "purpose": "Shows badge name, lock/unlock icon, unlock animation, and short reward copy"
      },
      {
        "name": "ActionItems",
        "purpose": "Numbered list with orange circular indicators; each item can be checked off"
      },
      {
        "name": "PromptBlock",
        "purpose": "Monospace code block with Copy button + toast"
      },
      {
        "name": "ResourceLinks",
        "purpose": "External links list with subtle hover underline + external icon"
      },
      {
        "name": "FinaleConfetti",
        "purpose": "Confetti overlay + congratulations hero + video embed + bonus section"
      }
    ]
  },
  "component_styles": {
    "sidebar": {
      "container": "bg-[#0B0C0F] border-r border-white/10",
      "brand_block": "px-4 py-5",
      "brand_title": "font-[Space_Grotesk] text-sm uppercase tracking-[0.18em] text-zinc-300",
      "brand_subtitle": "mt-2 text-xl font-semibold text-zinc-100",
      "director_level_chip": "mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-200",
      "step_item": {
        "base": "group w-full justify-start gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5",
        "active": "bg-white/5 text-zinc-100 ring-1 ring-amber-500/20",
        "left_accent": "before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-amber-400",
        "completed_icon": "text-amber-400",
        "locked_icon": "text-zinc-600"
      },
      "reset_button": "mt-4 w-full justify-center"
    },
    "cards": {
      "base": "bg-[#121318] border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
      "glow_border": "hover:border-amber-500/20 hover:shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_18px_60px_rgba(0,0,0,0.55)]",
      "header": "pb-2",
      "title": "text-zinc-100",
      "desc": "text-zinc-400"
    },
    "buttons": {
      "shape": "rounded-xl",
      "primary": "bg-amber-500 text-black hover:bg-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/50",
      "secondary": "bg-white/5 text-zinc-100 hover:bg-white/8 border border-white/10",
      "ghost": "bg-transparent text-zinc-200 hover:bg-white/5",
      "finale_collab": "bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-[#120611] hover:opacity-95"
    },
    "progress": {
      "track": "bg-white/10",
      "indicator": "bg-amber-400"
    },
    "action_items": {
      "number_dot": "flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-black text-xs font-semibold shadow-[0_0_0_1px_rgba(245,158,11,0.25)]",
      "row": "flex gap-3 py-2",
      "text": "text-zinc-200"
    },
    "prompt_block": {
      "container": "relative rounded-xl border border-amber-500/15 bg-[#0B0C0F] p-4",
      "code": "font-mono text-xs md:text-sm text-zinc-100 whitespace-pre-wrap",
      "copy_button": "absolute right-3 top-3"
    },
    "resource_link": {
      "row": "flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/8",
      "title": "text-sm text-zinc-100",
      "meta": "text-xs text-zinc-400"
    }
  },
  "micro_interactions_and_motion": {
    "library": {
      "recommended": "framer-motion",
      "install": "npm i framer-motion",
      "usage": "Use for step transitions, badge unlock pop, subtle hover lift on cards."
    },
    "principles": [
      "Use 120–180ms for hover transitions; 220–320ms for page/step transitions",
      "Prefer opacity + translateY (4–10px) entrance animations",
      "Buttons: press scale 0.98 on tap",
      "Cards: hover lift translateY(-2px) + border glow (no transform transitions globally)"
    ],
    "confetti": {
      "library": "canvas-confetti",
      "install": "npm i canvas-confetti",
      "trigger": "On entering Step 8 (Finale) and only once per completion; respect prefers-reduced-motion."
    },
    "scroll": {
      "sidebar": "ScrollArea with subtle top/bottom fade masks",
      "main": "Keep main content scroll; avoid nested scroll traps except sidebar"
    }
  },
  "accessibility": {
    "contrast": [
      "Body text must be zinc-200/300 on #0f0f10+ backgrounds",
      "Amber text on dark must be used for accents only; avoid long paragraphs in amber"
    ],
    "focus": [
      "All interactive elements must have visible focus ring using --ring",
      "Use focus-visible styles; do not remove outlines"
    ],
    "reduced_motion": [
      "Wrap confetti and large animations behind prefers-reduced-motion checks",
      "Provide non-animated fallback states"
    ]
  },
  "data_testid_conventions": {
    "rule": "All interactive and key informational elements MUST include data-testid.",
    "naming": "kebab-case describing role",
    "examples": [
      "data-testid=\"sidebar-reset-progress-button\"",
      "data-testid=\"curriculum-step-3-button\"",
      "data-testid=\"step-progress-bar\"",
      "data-testid=\"prompt-copy-button\"",
      "data-testid=\"finale-video-embed\"",
      "data-testid=\"complete-and-continue-button\""
    ]
  },
  "images": {
    "image_urls": [
      {
        "category": "finale-hero-background",
        "description": "Subtle cinematic bokeh background used only in Finale hero header area (max 20% viewport height). Apply as low-opacity overlay.",
        "url": "https://images.pexels.com/photos/3717292/pexels-photo-3717292.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      },
      {
        "category": "finale-bonus-section",
        "description": "Optional image for bonus/collab section card background (very subtle, blurred).",
        "url": "https://images.pexels.com/photos/7234386/pexels-photo-7234386.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      },
      {
        "category": "sidebar-brand-texture",
        "description": "Optional tiny texture overlay (use as blurred background image behind brand block at 10–15% opacity).",
        "url": "https://images.unsplash.com/photo-1525783826280-5a6e928544c3?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      }
    ]
  },
  "implementation_notes_react_js": {
    "file_type": "Project uses .js (not .tsx). Keep components in .jsx/.js and avoid TS types.",
    "routing": "Single page with internal step state or react-router; animate step content swap with Framer Motion.",
    "clipboard": "Use navigator.clipboard.writeText(prompt) and show Sonner toast.",
    "icons": "Use lucide-react icons (already typical with shadcn). Avoid emoji icons."
  },
  "instructions_to_main_agent": [
    "Update /app/frontend/src/index.css :root and .dark tokens to match the cinematic palette above; set default to dark by applying class 'dark' on html/body/root.",
    "Remove any centered layout defaults from App.css; App.css currently has .App-header centering—do not use that pattern for the dashboard.",
    "Build an AppShell: fixed sidebar (280px) + main content. On mobile, sidebar becomes Sheet.",
    "Use shadcn Card for all content blocks; apply subtle amber border glow on hover.",
    "Implement curriculum list with active state + completion indicator; show progress (X/8 + Progress component).",
    "Step content: StepHeader + BadgeUnlockCard + ActionItems + PromptBlock (copy) + ResourceLinks + navigation buttons.",
    "Finale: trigger confetti (canvas-confetti) once; include YouTube embed; include bonus collab CTA with magenta gradient button only.",
    "Add data-testid to every interactive element and key info text (progress label, director level, badge status).",
    "Do not use gradients except subtle background wash and Finale collab button surface; keep gradient area under 20% viewport."
  ],
  "references": {
    "inspiration_links": [
      "https://dribbble.com/shots/16097888-Dark-Theme-for-Project-Management-Dashboard-Animation",
      "https://dribbble.com/search/sidebar-steps",
      "https://dribbble.com/search/ui-step-by-step"
    ]
  },
  "general_ui_ux_design_guidelines": [
    "You must not apply universal transition. Eg: transition: all. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms",
    "You must not center align the app container, ie do not add .App { text-align: center; } in the css file. This disrupts the human natural reading flow of text",
    "NEVER: use AI assistant Emoji characters like 🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use FontAwesome cdn or lucid-react library already installed in the package.json",
    "GRADIENT RESTRICTION RULE",
    "NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element. Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc",
    "NEVER use dark gradients for logo, testimonial, footer etc",
    "NEVER let gradients cover more than 20% of the viewport.",
    "NEVER apply gradients to text-heavy content or reading areas.",
    "NEVER use gradients on small UI elements (<100px width).",
    "NEVER stack multiple gradient layers in the same viewport.",
    "ENFORCEMENT RULE:",
    "Id gradient area exceeds 20% of viewport OR affects readability, THEN use solid colors",
    "How and where to use:",
    "Section backgrounds (not content backgrounds)",
    "Hero section header content. Eg: dark to light to dark color",
    "Decorative overlays and accent elements only",
    "Hero section with 2-3 mild color",
    "Gradients creation can be done for any angle say horizontal, vertical or diagonal",
    "For AI chat, voice application, do not use purple color. Use color like light green, ocean blue, peach orange etc",
    "Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead.",
    "Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.",
    "Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.",
    "Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly",
    "Component Reuse:",
    "Prioritize using pre-existing components from src/components/ui when applicable",
    "Create new components that match the style and conventions of existing components when needed",
    "Examine existing components to understand the project's component patterns before creating new ones",
    "IMPORTANT: Do not use HTML based component like dropdown, calendar, toast etc. You MUST always use /app/frontend/src/components/ui/ only as a primary components as these are modern and stylish component",
    "Best Practices:",
    "Use Shadcn/UI as the primary component library for consistency and accessibility",
    "Import path: ./components/[component-name]",
    "Export Conventions:",
    "Components MUST use named exports (export const ComponentName = ...)",
    "Pages MUST use default exports (export default function PageName() {...})",
    "Toasts:",
    "Use sonner for toasts",
    "Sonner component are located in /app/src/components/ui/sonner.tsx",
    "Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
  ]
}
