import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, UserPlus, Calendar, Tag, Mail, MousePointerClick,
  Hand, MessageSquareReply, ArrowRightLeft, Search
} from "lucide-react";

export interface TriggerType {
  value: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

export const TRIGGER_TYPES: TriggerType[] = [
  { value: "form_submission", label: "Form Submission", description: "When someone submits the waitlist or contact form", icon: FileText, category: "Contact" },
  { value: "contact_created", label: "Contact Created", description: "When a new backer or waitlist entry is added", icon: UserPlus, category: "Contact" },
  { value: "tag_added", label: "Tag Added", description: "When a tag is applied to a contact", icon: Tag, category: "Contact" },
  { value: "appointment_booked", label: "Appointment Booked", description: "When a contact books an appointment", icon: Calendar, category: "Appointment" },
  { value: "email_opened", label: "Email Opened", description: "When a recipient opens an email", icon: Mail, category: "Communication" },
  { value: "link_clicked", label: "Link Clicked", description: "When a recipient clicks a link in an email", icon: MousePointerClick, category: "Communication" },
  { value: "contact_replied", label: "Contact Replied", description: "When a contact replies to a message", icon: MessageSquareReply, category: "Communication" },
  { value: "pipeline_stage_changed", label: "Pipeline Stage Changed", description: "When a contact moves to a different pipeline stage", icon: ArrowRightLeft, category: "Pipeline" },
  { value: "manual", label: "Manual Trigger", description: "Admin triggers on selected contacts", icon: Hand, category: "Other" },
];

const CATEGORIES = ["Contact", "Appointment", "Communication", "Pipeline", "Other"];

interface TriggerSelectorProps {
  selected: string | null;
  onSelect: (triggerType: string) => void;
  triggerConfig: Record<string, any>;
  onConfigChange: (config: Record<string, any>) => void;
}

const TriggerSelector = ({ selected, onSelect, triggerConfig, onConfigChange }: TriggerSelectorProps) => {
  const [search, setSearch] = useState("");

  const filteredTriggers = TRIGGER_TYPES.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const groupedTriggers = CATEGORIES.map(cat => ({
    category: cat,
    triggers: filteredTriggers.filter(t => t.category === cat),
  })).filter(g => g.triggers.length > 0);

  const selectedTrigger = TRIGGER_TYPES.find(t => t.value === selected);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search triggers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Grouped triggers */}
      <div className="space-y-4">
        {groupedTriggers.map(group => (
          <div key={group.category}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.category}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {group.triggers.map(trigger => {
                const Icon = trigger.icon;
                const isSelected = selected === trigger.value;
                return (
                  <motion.button
                    key={trigger.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelect(trigger.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border bg-secondary/50 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm leading-tight">{trigger.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{trigger.description}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Trigger Config */}
      {selectedTrigger && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border pt-4 space-y-3"
        >
          <p className="text-sm font-medium text-foreground">
            Configure: {selectedTrigger.label}
          </p>
          {selected === "form_submission" && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Form Name (optional)</label>
              <input
                type="text"
                value={triggerConfig.form_name || ""}
                onChange={(e) => onConfigChange({ ...triggerConfig, form_name: e.target.value })}
                placeholder="e.g., waitlist, contact"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          )}
          {selected === "tag_added" && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Tag Name</label>
              <input
                type="text"
                value={triggerConfig.tag_name || ""}
                onChange={(e) => onConfigChange({ ...triggerConfig, tag_name: e.target.value })}
                placeholder="e.g., vip, interested"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          )}
          {selected === "email_opened" && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Email Template (optional)</label>
              <input
                type="text"
                value={triggerConfig.template_name || ""}
                onChange={(e) => onConfigChange({ ...triggerConfig, template_name: e.target.value })}
                placeholder="Any email (leave blank for all)"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          )}
          {(selected === "manual" || selected === "contact_created" || selected === "appointment_booked" || selected === "contact_replied" || selected === "pipeline_stage_changed" || selected === "link_clicked") && (
            <p className="text-xs text-muted-foreground">
              No additional configuration needed for this trigger.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TriggerSelector;
