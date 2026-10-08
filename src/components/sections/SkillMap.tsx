"use client";
import { useMemo, useState } from "react";
import { skillGroups, skillLinks, skills, type SkillGroupId } from "@/data/skills";
import { projects } from "@/data/projects";
import TransitionLink from "@/components/ui/TransitionLink";
import Icon, { type IconName } from "@/components/ui/Icon";

const groupIcon: Record<SkillGroupId, IconName> = {
  frontend: "code",
  backend: "server",
  data: "database",
  ai: "brain",
  tools: "tool",
};

/**
 * Skill ecosystem: technologies grouped by area. Hovering (or tapping) a
 * technology lights up the technologies it connects with across all groups,
 * dims the rest, and shows which projects used it.
 */
export default function SkillMap() {
  const [filter, setFilter] = useState<SkillGroupId | "all">("all");
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hover ?? pinned;

  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    skills.forEach((s) => m.set(s.id, new Set()));
    skillLinks.forEach(([a, b]) => { m.get(a)!.add(b); m.get(b)!.add(a); });
    return m;
  }, []);

  const related = active ? neighbors.get(active)! : null;
  const activeSkill = active ? skills.find((s) => s.id === active) : null;
  const usedIn = active ? projects.filter((p) => p.stack.includes(active)) : [];
  const groups = filter === "all" ? skillGroups : skillGroups.filter((g) => g.id === filter);

  return (
    <div>
      {/* filters */}
      <div data-reveal role="tablist" aria-label="Filter technologies" className="mb-6 flex flex-wrap gap-2">
        {[{ id: "all" as const, label: "All" }, ...skillGroups.map((g) => ({ id: g.id, label: g.label }))].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={filter === t.id}
            onClick={() => setFilter(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              filter === t.id ? "text-white shadow-[0_8px_24px_-8px_rgb(255_46_61/0.8)]" : "border border-line bg-white/[0.03] text-paper-2 hover:text-paper"
            }`}
            style={filter === t.id ? { background: "var(--grad)" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* insight bar */}
      <div data-reveal aria-live="polite" className="card mb-6 flex min-h-[4.5rem] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
        {activeSkill ? (
          <>
            <p className="text-lg font-bold text-paper">{activeSkill.label}</p>
            {related && related.size > 0 && (
              <p className="text-sm text-mute">
                Works with <span className="text-paper-2">{[...related].map((id) => skills.find((s) => s.id === id)!.label).join(", ")}</span>
              </p>
            )}
            <p className="text-sm text-mute">
              {usedIn.length ? (
                <>
                  Used in{" "}
                  {usedIn.map((p, i) => (
                    <span key={p.slug}>
                      <TransitionLink href={`/work/${p.slug}`} transitionLabel={p.title} className="font-medium text-signal hover:underline">{p.title}</TransitionLink>
                      {i < usedIn.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </>
              ) : (
                "Part of my wider toolkit"
              )}
            </p>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-mute">
            <Icon name="sparkles" size={16} className="text-signal" />
            Hover or tap a technology to see what it connects with and where I’ve used it.
          </p>
        )}
      </div>

      {/* groups */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.id} data-reveal className="card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet/15 text-violet">
                <Icon name={groupIcon[g.id]} />
              </span>
              <div>
                <h3 className="font-bold text-paper">{g.label}</h3>
                <p className="text-xs text-mute">{g.blurb}</p>
              </div>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {skills.filter((s) => s.group === g.id).map((s) => {
                const isActive = active === s.id;
                const isRelated = related?.has(s.id);
                const dim = active && !isActive && !isRelated;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-pressed={pinned === s.id}
                      onMouseEnter={() => setHover(s.id)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(s.id)}
                      onBlur={() => setHover(null)}
                      onClick={() => setPinned((p) => (p === s.id ? null : s.id))}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "scale-105 border-transparent text-white shadow-[0_6px_20px_-6px_rgb(255_46_61/0.8)]"
                          : isRelated
                            ? "border-signal/60 bg-signal/10 text-signal"
                            : "border-line-strong bg-white/[0.03] text-paper-2 hover:text-paper"
                      } ${dim ? "opacity-35" : ""}`}
                      style={isActive ? { background: "var(--grad)" } : undefined}
                    >
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
