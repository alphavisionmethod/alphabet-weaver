import { motion } from "framer-motion";
import {
  Mail, Clock, Tag, X, UserCog, GitBranch, Webhook,
  Bell, Trash2, ChevronDown, ChevronUp, GripVertical
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ActionConfigPanel from "./ActionConfigPanel";

export interface ActionType {
  value: string;
  label: string;
  icon: React.ElementType;
  category: string;
  color: string;
}

export const ACTION_TYPES: ActionType[] = [
  { value: "send_email", label: "Send Email", icon: Mail, category: "Communication", color: "text-primary" },
  { value: "wait_delay", label: "Wait / Delay", icon: Clock, category: "Logic", color: "text-accent" },
  { value: "add_tag", label: "Add Tag", icon: Tag, category: "CRM", color: "text-accent" },
  { value: "remove_tag", label: "Remove Tag", icon: X, category: "CRM", color: "text-destructive" },
  { value: "update_contact", label: "Update Contact", icon: UserCog, category: "CRM", color: "text-primary" },
  { value: "if_else", label: "If / Else", icon: GitBranch, category: "Logic", color: "text-accent" },
  { value: "webhook", label: "Webhook", icon: Webhook, category: "Integration", color: "text-primary" },
  { value: "internal_notification", label: "Internal Notification", icon: Bell, category: "Integration", color: "text-accent" },
];

export interface WorkflowAction {
  id: string;
  action_type: string;
  action_order: number;
  action_config: any;
  parent_action_id?: string | null;
  branch?: string | null;
}

interface ActionCardProps {
  action: WorkflowAction;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (config: Record<string, any>) => void;
  onDelete: () => void;
  isLast: boolean;
}

const ActionCard = ({ action, index, isExpanded, onToggle, onUpdate, onDelete, isLast }: ActionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const actionMeta = ACTION_TYPES.find(a => a.value === action.action_type);
  if (!actionMeta) return null;

  const Icon = actionMeta.icon;

  const getSummary = (): string => {
    const c = action.action_config;
    switch (action.action_type) {
      case "send_email": return c.template_id ? "Template selected" : "No template selected";
      case "wait_delay": {
        const h = c.delay_hours ?? 0;
        if (h === 0) return "Immediately";
        if (h < 24) return `${h} hour${h > 1 ? "s" : ""}`;
        return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? "s" : ""}`;
      }
      case "add_tag":
      case "remove_tag": return c.tag_name || "No tag set";
      case "update_contact": return c.field ? `${c.field} → ${c.value || "..."}` : "Not configured";
      case "if_else": return c.condition_field ? `${c.condition_field} ${c.condition_operator} ${c.condition_value || ""}` : "No condition set";
      case "webhook": return c.webhook_url ? new URL(c.webhook_url).hostname : "No URL set";
      case "internal_notification": return c.notify_email || "No email set";
      default: return "";
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center pt-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isExpanded ? "bg-primary/20 text-primary ring-2 ring-primary/30" : "bg-muted text-muted-foreground"
        }`}>
          {index + 1}
        </div>
        {!isLast && <div className="w-0.5 flex-1 min-h-[16px] bg-border mt-1" />}
      </div>

      {/* Card */}
      <motion.div
        layout
        className={`flex-1 rounded-xl border transition-all mb-2 ${
          isExpanded ? "border-primary/30 bg-card shadow-lg" : "border-border bg-card/50"
        }`}
      >
        <div
          onClick={onToggle}
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/30 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <button
              {...attributes}
              {...listeners}
              className="p-1 rounded hover:bg-secondary cursor-grab active:cursor-grabbing text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-secondary ${actionMeta.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{actionMeta.label}</p>
              <p className="text-xs text-muted-foreground">{getSummary()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 pb-3 border-t border-border/50 pt-3"
          >
            <ActionConfigPanel
              actionType={action.action_type}
              config={action.action_config}
              onChange={onUpdate}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ActionCard;
