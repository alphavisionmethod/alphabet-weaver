import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown } from "lucide-react";

interface ActionConfigPanelProps {
  actionType: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

interface Template {
  id: string;
  name: string;
  subject: string;
}

const DELAY_PRESETS = [
  { value: 0, label: "Immediately" },
  { value: 1, label: "1 hour" },
  { value: 6, label: "6 hours" },
  { value: 24, label: "1 day" },
  { value: 48, label: "2 days" },
  { value: 72, label: "3 days" },
  { value: 168, label: "7 days" },
  { value: 720, label: "30 days" },
];

const CONDITION_FIELDS = [
  { value: "email", label: "Email" },
  { value: "name", label: "Name" },
  { value: "tier", label: "Tier" },
  { value: "tag", label: "Tag" },
  { value: "source", label: "Source" },
];

const CONDITION_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does not contain" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
];

const ActionConfigPanel = ({ actionType, config, onChange }: ActionConfigPanelProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (actionType === "send_email") {
      fetchTemplates();
    }
  }, [actionType]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("email_templates" as any)
      .select("id, name, subject")
      .eq("is_active", true)
      .order("name");
    if (data) setTemplates(data as unknown as Template[]);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary transition-colors";
  const labelClass = "block text-xs text-muted-foreground mb-1";

  switch (actionType) {
    case "send_email":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Email Template</label>
            <div className="relative">
              <select
                value={config.template_id || ""}
                onChange={(e) => onChange({ ...config, template_id: e.target.value })}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Select a template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subject Override (optional)</label>
            <input
              type="text"
              value={config.subject_override || ""}
              onChange={(e) => onChange({ ...config, subject_override: e.target.value })}
              placeholder="Leave blank to use template subject"
              className={inputClass}
            />
          </div>
        </div>
      );

    case "wait_delay":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Delay Duration</label>
            <div className="relative">
              <select
                value={config.delay_hours ?? 24}
                onChange={(e) => onChange({ ...config, delay_hours: parseInt(e.target.value) })}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {DELAY_PRESETS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Or custom hours</label>
            <input
              type="number"
              min={0}
              value={config.delay_hours ?? 24}
              onChange={(e) => onChange({ ...config, delay_hours: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
        </div>
      );

    case "add_tag":
    case "remove_tag":
      return (
        <div>
          <label className={labelClass}>Tag Name</label>
          <input
            type="text"
            value={config.tag_name || ""}
            onChange={(e) => onChange({ ...config, tag_name: e.target.value })}
            placeholder="e.g., vip, engaged, churned"
            className={inputClass}
          />
        </div>
      );

    case "update_contact":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Field</label>
            <div className="relative">
              <select
                value={config.field || ""}
                onChange={(e) => onChange({ ...config, field: e.target.value })}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Select field...</option>
                <option value="name">Name</option>
                <option value="tier">Tier</option>
                <option value="category">Category</option>
                <option value="source">Source</option>
                <option value="interest">Interest</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelClass}>New Value</label>
            <input
              type="text"
              value={config.value || ""}
              onChange={(e) => onChange({ ...config, value: e.target.value })}
              placeholder="Enter new value"
              className={inputClass}
            />
          </div>
        </div>
      );

    case "if_else":
      return (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Define a condition. Contacts matching the condition follow the "Yes" branch, others follow "No".
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelClass}>Field</label>
              <div className="relative">
                <select
                  value={config.condition_field || ""}
                  onChange={(e) => onChange({ ...config, condition_field: e.target.value })}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Field...</option>
                  {CONDITION_FIELDS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Operator</label>
              <div className="relative">
                <select
                  value={config.condition_operator || ""}
                  onChange={(e) => onChange({ ...config, condition_operator: e.target.value })}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Op...</option>
                  {CONDITION_OPERATORS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Value</label>
              <input
                type="text"
                value={config.condition_value || ""}
                onChange={(e) => onChange({ ...config, condition_value: e.target.value })}
                placeholder="Value"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      );

    case "webhook":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Webhook URL</label>
            <input
              type="url"
              value={config.webhook_url || ""}
              onChange={(e) => onChange({ ...config, webhook_url: e.target.value })}
              placeholder="https://hooks.zapier.com/..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>HTTP Method</label>
            <div className="relative">
              <select
                value={config.method || "POST"}
                onChange={(e) => onChange({ ...config, method: e.target.value })}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Custom Body (JSON, optional)</label>
            <textarea
              value={config.body || ""}
              onChange={(e) => onChange({ ...config, body: e.target.value })}
              placeholder='{"key": "value"}'
              rows={3}
              className={`${inputClass} resize-none font-mono text-xs`}
            />
          </div>
        </div>
      );

    case "internal_notification":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Notification Email</label>
            <input
              type="email"
              value={config.notify_email || ""}
              onChange={(e) => onChange({ ...config, notify_email: e.target.value })}
              placeholder="admin@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Message</label>
            <textarea
              value={config.message || ""}
              onChange={(e) => onChange({ ...config, message: e.target.value })}
              placeholder="A new contact just..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      );

    default:
      return (
        <p className="text-xs text-muted-foreground">
          No configuration needed for this action.
        </p>
      );
  }
};

export default ActionConfigPanel;
