import { Check } from "lucide-react";
import type { Mission } from "@/lib/dummy-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { LabeledProgress } from "@/components/ui/progress-field";

export function MissionCard({ mission, index }: { mission: Mission; index?: number }) {
  return (
    <div className="glass-elevated rounded-[1.5rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {mission.completed ? (
              <span className="flex size-6 items-center justify-center rounded-full bg-success-soft text-success">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            ) : (
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {(index ?? 0) + 1}
              </span>
            )}
            <p className="font-semibold text-foreground">{mission.title}</p>
          </div>
          <p className="mt-2 pl-8 text-xs leading-5 text-muted-foreground">{mission.description}</p>
        </div>
        <StatusBadge tone={mission.completed ? "success" : "xp"}>+{mission.xp_reward}</StatusBadge>
      </div>
      <div className="mt-3 pl-8">
        <LabeledProgress
          value={(mission.progress / mission.target) * 100}
          indicatorClassName="bg-xp"
        />
      </div>
    </div>
  );
}
