import { motion } from 'framer-motion';
import { useDemo } from '../../store';
import type { WorkflowId } from '../../types';

const WORKFLOW_ORDER: WorkflowId[] = ['revenue-leak', 'wire-transfer', 'board-briefing'];
const LABELS: Record<WorkflowId, string> = {
  'revenue-leak': 'Revenue',
  'wire-transfer': 'Wire',
  'board-briefing': 'Board',
};

export function SessionProgress() {
  const { workflows } = useDemo();
  const completed = WORKFLOW_ORDER.filter(id => workflows[id].receipts.length > 0).length;

  return (
    <div className="flex items-center gap-1.5">
      {WORKFLOW_ORDER.map(id => {
        const done = workflows[id].receipts.length > 0;
        const active = workflows[id].step !== 'idle' && !done;
        return (
          <div key={id} className="flex items-center gap-1" title={LABELS[id]}>
            <motion.div
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                done ? 'bg-emerald-400' : active ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              animate={active ? { scale: [1, 1.4, 1] } : {}}
              transition={active ? { duration: 1.2, repeat: Infinity } : {}}
            />
          </div>
        );
      })}
      <span className="text-[8px] text-muted-foreground font-mono ml-0.5">{completed}/3</span>
    </div>
  );
}
