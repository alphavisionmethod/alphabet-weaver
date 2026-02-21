import { motion } from "framer-motion";
import { Zap, ArrowDown, GitBranch, Clock, Mail, Tag, X, UserCog, Webhook, Bell, CheckCircle } from "lucide-react";
import { TRIGGER_TYPES } from "./TriggerSelector";
import { ACTION_TYPES, WorkflowAction } from "./ActionCard";

interface WorkflowFlowDiagramProps {
  triggerType: string | null;
  triggerConfig: Record<string, any>;
  actions: WorkflowAction[];
}

const WorkflowFlowDiagram = ({ triggerType, triggerConfig, actions }: WorkflowFlowDiagramProps) => {
  const triggerMeta = TRIGGER_TYPES.find(t => t.value === triggerType);

  // Build tree structure for if/else branching
  const buildTree = () => {
    const rootActions = actions.filter(a => !a.parent_action_id && !a.branch);
    return rootActions;
  };

  const getActionChildren = (parentId: string, branch: string) => {
    return actions.filter(a => a.parent_action_id === parentId && a.branch === branch);
  };

  const renderNode = (
    icon: React.ElementType,
    label: string,
    subtitle: string,
    variant: "trigger" | "action" | "condition" | "end",
    delay: number
  ) => {
    const Icon = icon;
    const styles = {
      trigger: "bg-primary/10 border-primary/30 ring-primary/20",
      action: "bg-card border-border ring-border/50",
      condition: "bg-accent/10 border-accent/30 ring-accent/20",
      end: "bg-accent/10 border-accent/30 ring-accent/20",
    };
    const iconStyles = {
      trigger: "bg-primary/20 text-primary",
      action: "bg-secondary text-foreground",
      condition: "bg-accent/20 text-accent",
      end: "bg-accent/20 text-accent",
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay * 0.08 }}
        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border ring-1 ${styles[variant]} min-w-[200px] max-w-[260px]`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconStyles[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
      </motion.div>
    );
  };

  const renderArrow = (delay: number, label?: string) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay * 0.08 }}
      className="flex flex-col items-center py-1"
    >
      <div className="w-0.5 h-4 bg-border" />
      {label && (
        <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border my-0.5">
          {label}
        </span>
      )}
      <ArrowDown className="w-3 h-3 text-muted-foreground" />
    </motion.div>
  );

  const getActionSummary = (action: WorkflowAction): string => {
    const c = action.action_config;
    switch (action.action_type) {
      case "send_email": return c.template_id ? "Send template" : "Configure email";
      case "wait_delay": {
        const h = c.delay_hours ?? 0;
        if (h === 0) return "No delay";
        if (h < 24) return `Wait ${h}h`;
        return `Wait ${Math.floor(h / 24)}d`;
      }
      case "add_tag": return c.tag_name ? `Tag: ${c.tag_name}` : "Set tag";
      case "remove_tag": return c.tag_name ? `Remove: ${c.tag_name}` : "Set tag";
      case "update_contact": return c.field || "Configure";
      case "if_else": return c.condition_field ? `${c.condition_field} ${c.condition_operator || "="} ${c.condition_value || "?"}` : "Set condition";
      case "webhook": return c.webhook_url ? new URL(c.webhook_url).hostname : "Set URL";
      case "internal_notification": return c.notify_email || "Set email";
      default: return "";
    }
  };

  const renderAction = (action: WorkflowAction, index: number) => {
    const meta = ACTION_TYPES.find(a => a.value === action.action_type);
    if (!meta) return null;

    if (action.action_type === "if_else") {
      const yesChildren = getActionChildren(action.id, "yes");
      const noChildren = getActionChildren(action.id, "no");

      return (
        <div key={action.id} className="flex flex-col items-center">
          {renderArrow(index)}
          {renderNode(meta.icon, meta.label, getActionSummary(action), "condition", index)}

          {/* Branches */}
          <div className="flex gap-8 mt-1">
            {/* Yes branch */}
            <div className="flex flex-col items-center">
              {renderArrow(index + 0.5, "YES")}
              {yesChildren.length > 0 ? (
                yesChildren.map((child, ci) => {
                  const childMeta = ACTION_TYPES.find(a => a.value === child.action_type);
                  if (!childMeta) return null;
                  return (
                    <div key={child.id} className="flex flex-col items-center">
                      {ci > 0 && renderArrow(index + ci + 1)}
                      {renderNode(childMeta.icon, childMeta.label, getActionSummary(child), "action", index + ci + 1)}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                  No actions
                </div>
              )}
            </div>

            {/* No branch */}
            <div className="flex flex-col items-center">
              {renderArrow(index + 0.5, "NO")}
              {noChildren.length > 0 ? (
                noChildren.map((child, ci) => {
                  const childMeta = ACTION_TYPES.find(a => a.value === child.action_type);
                  if (!childMeta) return null;
                  return (
                    <div key={child.id} className="flex flex-col items-center">
                      {ci > 0 && renderArrow(index + ci + 1)}
                      {renderNode(childMeta.icon, childMeta.label, getActionSummary(child), "action", index + ci + 1)}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                  No actions
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={action.id} className="flex flex-col items-center">
        {renderArrow(index)}
        {renderNode(meta.icon, meta.label, getActionSummary(action), "action", index)}
      </div>
    );
  };

  const rootActions = buildTree();

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-6 overflow-auto">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Flow Preview</p>

      <div className="flex flex-col items-center min-w-fit">
        {/* Trigger node */}
        {triggerMeta ? (
          renderNode(triggerMeta.icon, triggerMeta.label, "Trigger", "trigger", 0)
        ) : (
          <div className="px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            No trigger selected
          </div>
        )}

        {/* Actions */}
        {rootActions.map((action, idx) => renderAction(action, idx + 1))}

        {/* End node */}
        {rootActions.length > 0 && (
          <>
            {renderArrow(rootActions.length + 1)}
            {renderNode(CheckCircle, "End", "Workflow complete", "end", rootActions.length + 2)}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkflowFlowDiagram;
