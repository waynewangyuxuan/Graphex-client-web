import { DocumentIcon, LinkIcon, StarFilledIcon } from '@/components/icons';

interface StatsRowProps {
  entityCount: number;
  totalNodes: number;
  exploredPercent: number;
  dayStreak: number;
}

export function StatsRow({ entityCount, totalNodes, exploredPercent, dayStreak }: StatsRowProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <StatCard
        value={entityCount}
        label="Entities"
        icon={<DocumentIcon className="w-5 h-5 text-terra-500" />}
        iconBg="bg-terra-500/10"
        delay={0}
      />
      <StatCard
        value={totalNodes}
        label="Total Nodes"
        icon={<LinkIcon className="w-5 h-5 text-accent-500" />}
        iconBg="bg-accent-500/10"
        delay={0.05}
      />
      <ProgressCard percent={exploredPercent} delay={0.1} />
      <StreakCard streak={dayStreak} delay={0.15} />
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  delay: number;
}

function StatCard({ value, label, icon, iconBg, delay }: StatCardProps) {
  return (
    <div className="paper-card p-5 animate-fade-in" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[1.75rem] font-semibold text-sand-900 leading-none">{value}</div>
          <div className="text-[0.7rem] text-sand-600 uppercase tracking-widest mt-1.5">{label}</div>
        </div>
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ percent, delay }: { percent: number; delay: number }) {
  const dashOffset = 94.2 * (1 - percent / 100);

  return (
    <div className="paper-card p-5 animate-fade-in" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[1.75rem] font-semibold text-sand-900 leading-none">{percent}%</div>
          <div className="text-[0.7rem] text-sand-600 uppercase tracking-widest mt-1.5">Explored</div>
        </div>
        <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#E6D9C6" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#C96442"
            strokeWidth="3"
            strokeDasharray="94.2"
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

function StreakCard({ streak, delay }: { streak: number; delay: number }) {
  return (
    <div className="paper-card p-5 animate-fade-in" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[1.75rem] font-semibold text-sand-900 leading-none flex items-center gap-1">
            {streak}
            <StarFilledIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-[0.7rem] text-sand-600 uppercase tracking-widest mt-1.5">Day Streak</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <StarFilledIcon className="w-5 h-5 text-amber-500" />
        </div>
      </div>
    </div>
  );
}
