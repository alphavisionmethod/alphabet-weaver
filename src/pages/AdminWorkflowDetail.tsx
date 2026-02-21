import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Clock, Mail, Play, Pause, Eye, EyeOff,
  Plus, Trash2, ChevronDown, Variable
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  id?: string;
  step_order: number;
  delay_minutes: number;
  subject_template: string;
  body_template: string;
  from_name: string;
  from_email: string;
  conditions: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  version: number;
  status: string;
  audience_type: string;
  is_system: boolean;
}

const VARIABLES = [
  "{{first_name}}", "{{email}}", "{{perk_tier}}", "{{donation_amount_total}}",
  "{{investor_fund}}", "{{utm_source}}", "{{backer_number}}", "{{year}}"
];

const DELAY_PRESETS = [
  { value: 0, label: "Immediately" },
  { value: 60, label: "1 hour" },
  { value: 360, label: "6 hours" },
  { value: 1440, label: "1 day" },
  { value: 2880, label: "2 days" },
  { value: 4320, label: "3 days" },
  { value: 7200, label: "5 days" },
  { value: 10080, label: "7 days" },
  { value: 20160, label: "14 days" },
  { value: 43200, label: "30 days" },
];

const AdminWorkflowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState({
    first_name: "John", email: "john@example.com", perk_tier: "sovereign",
    donation_amount_total: "$500", investor_fund: "Meridian Capital",
    utm_source: "landing_page", backer_number: "0042", year: "2026",
  });

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const [tmplRes, stepsRes] = await Promise.all([
      (supabase.from as any)("workflow_templates").select("*").eq("id", id!).single(),
      (supabase.from as any)("workflow_steps").select("*").eq("template_id", id!).order("step_order"),
    ]);

    if (tmplRes.error) {
      toast({ title: "Error", description: tmplRes.error.message, variant: "destructive" });
      navigate("/admin/workflows");
      return;
    }

    setTemplate(tmplRes.data as unknown as WorkflowTemplate);
    setSteps((stepsRes.data || []) as unknown as WorkflowStep[]);
    if (stepsRes.data?.length) setSelectedStep(0);
    setLoading(false);
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      step_order: steps.length + 1,
      delay_minutes: steps.length === 0 ? 0 : 1440,
      subject_template: "New Email Subject",
      body_template: "Write your email content here...",
      from_name: "SITA OS",
      from_email: "hello@sitaos.com",
      conditions: {},
    };
    setSteps(prev => [...prev, newStep]);
    setSelectedStep(steps.length);
  };

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_order: i + 1 })));
    setSelectedStep(null);
  };

  const updateStep = (idx: number, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const saveAll = async () => {
    if (!template) return;
    setSaving(true);

    // Delete existing steps and re-insert
    await (supabase.from as any)("workflow_steps").delete().eq("template_id", template.id);

    const stepsToInsert = steps.map(s => ({
      template_id: template.id,
      step_order: s.step_order,
      delay_minutes: s.delay_minutes,
      subject_template: s.subject_template,
      body_template: s.body_template,
      from_name: s.from_name,
      from_email: s.from_email,
      conditions: s.conditions,
    }));

    const { error } = await (supabase.from as any)("workflow_steps").insert(stepsToInsert);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await (supabase.from as any)("events").insert({
        event_type: "TEMPLATE_UPDATED" as any,
        payload: { workflow_key: template.key, steps_count: steps.length },
      });
      toast({ title: "Saved", description: "Workflow steps updated successfully" });
      fetchData();
    }
    setSaving(false);
  };

  const renderPreview = (text: string) => {
    let result = text;
    Object.entries(previewData).forEach(([key, val]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
    });
    return result;
  };

  if (loading || !template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const activeStep = selectedStep !== null ? steps[selectedStep] : null;

  return (
    <div className="flex flex-col -m-6 lg:-m-8" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Inline header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/workflows")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold">{template.name}</h1>
            <p className="text-[10px] text-muted-foreground">v{template.version} · {template.key}</p>
          </div>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Steps list */}
        <div className="w-72 border-r border-border/30 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Steps</span>
            <button onClick={addStep} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-primary">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedStep(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedStep === idx
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/30 hover:border-primary/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-primary">Step {step.step_order}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {DELAY_PRESETS.find(d => d.value === step.delay_minutes)?.label || `${step.delay_minutes}m`}
                </span>
              </div>
              <p className="text-xs text-foreground truncate">{step.subject_template}</p>
            </button>
          ))}

          {steps.length === 0 && (
            <div className="text-center py-8">
              <Mail className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No steps yet</p>
              <button onClick={addStep} className="mt-2 text-xs text-primary hover:underline">
                Add first step
              </button>
            </div>
          )}
        </div>

        {/* Right: Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeStep ? (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Step {activeStep.step_order}</h2>
                <button
                  onClick={() => removeStep(selectedStep!)}
                  className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Delay */}
              <div>
                <label className="block text-sm font-medium mb-2">Delay</label>
                <select
                  value={activeStep.delay_minutes}
                  onChange={e => updateStep(selectedStep!, { delay_minutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground outline-none focus:border-primary transition-colors"
                >
                  {DELAY_PRESETS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={activeStep.subject_template}
                  onChange={e => updateStep(selectedStep!, { subject_template: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground outline-none focus:border-primary transition-colors"
                />
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Preview: {renderPreview(activeStep.subject_template)}
                </p>
              </div>

              {/* Variables */}
              <div>
                <label className="block text-sm font-medium mb-2">Insert Variable</label>
                <div className="flex flex-wrap gap-2">
                  {VARIABLES.map(v => (
                    <button
                      key={v}
                      onClick={() => {
                        updateStep(selectedStep!, {
                          body_template: activeStep.body_template + ` ${v}`
                        });
                      }}
                      className="px-2 py-1 rounded-lg bg-secondary/50 border border-border text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium mb-2">Body</label>
                <textarea
                  value={activeStep.body_template}
                  onChange={e => updateStep(selectedStep!, { body_template: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground outline-none focus:border-primary transition-colors resize-y font-mono text-sm"
                />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium mb-2">Preview</label>
                <div className="bg-card border border-border/40 rounded-xl p-6">
                  <p className="text-xs text-muted-foreground mb-2">Subject: <strong>{renderPreview(activeStep.subject_template)}</strong></p>
                  <div className="border-t border-border/30 pt-4 text-sm text-foreground whitespace-pre-wrap">
                    {renderPreview(activeStep.body_template)}
                  </div>
                </div>
              </div>

              {/* From */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">From Name</label>
                  <input
                    type="text"
                    value={activeStep.from_name}
                    onChange={e => updateStep(selectedStep!, { from_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">From Email</label>
                  <input
                    type="text"
                    value={activeStep.from_email}
                    onChange={e => updateStep(selectedStep!, { from_email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Mail className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">Select a step to edit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWorkflowDetail;
