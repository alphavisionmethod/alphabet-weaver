import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Save, Eye, Code, User, Mail, Crown, Calendar, Hash, Phone, Building,
  Link, Globe, ChevronDown, Copy, Check, Undo, Redo, Plus, Trash2, Sparkles, Edit2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id?: string;
  name: string;
  subject: string;
  html_content: string;
  category: string;
  tier_specific: string | null;
  is_active: boolean;
}

interface CustomVariable {
  id: string;
  key: string;
  label: string;
  example: string;
}

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editTemplate?: Template | null;
}

const STORAGE_KEY = "sita_custom_variables";

const DEFAULT_VARIABLES = [
  { key: "{{name}}", label: "Full Name", icon: User, example: "John Smith" },
  { key: "{{firstName}}", label: "First Name", icon: User, example: "John" },
  { key: "{{lastName}}", label: "Last Name", icon: User, example: "Smith" },
  { key: "{{email}}", label: "Email", icon: Mail, example: "john@example.com" },
  { key: "{{tier}}", label: "Tier", icon: Crown, example: "sovereign" },
  { key: "{{tierName}}", label: "Tier Name", icon: Crown, example: "Sovereign" },
  { key: "{{backerNumber}}", label: "Backer #", icon: Hash, example: "0042" },
  { key: "{{amount}}", label: "Amount", icon: Hash, example: "$500" },
  { key: "{{date}}", label: "Today's Date", icon: Calendar, example: "February 7, 2026" },
  { key: "{{year}}", label: "Current Year", icon: Calendar, example: "2026" },
  { key: "{{phone}}", label: "Phone", icon: Phone, example: "+1 555-123-4567" },
  { key: "{{company}}", label: "Company", icon: Building, example: "SITA" },
  { key: "{{companyEmail}}", label: "Company Email", icon: Mail, example: "hello@sita.ai" },
  { key: "{{companyPhone}}", label: "Company Phone", icon: Phone, example: "+1 800-SITA" },
  { key: "{{siteUrl}}", label: "Site URL", icon: Globe, example: "https://sita.ai" },
  { key: "{{unsubscribeUrl}}", label: "Unsubscribe URL", icon: Link, example: "#unsubscribe" },
  { key: "{{referralCode}}", label: "Referral Code", icon: Hash, example: "REF-JS42" },
  { key: "{{customerId}}", label: "Customer ID", icon: Hash, example: "CUST-00042" },
];

const CATEGORIES = [
  { value: "welcome", label: "Welcome" },
  { value: "update", label: "Product Update" },
  { value: "reminder", label: "Reminder" },
  { value: "nurture", label: "Nurture" },
  { value: "general", label: "General" },
];

const TIERS = [
  { value: null, label: "All Tiers" },
  { value: "operator", label: "Operator" },
  { value: "sovereign", label: "Sovereign" },
  { value: "governance", label: "Governance Board" },
];

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.2);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">SITA</h1>
              <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-transform: uppercase;">Sovereign Intelligence</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 600; color: #ffffff; line-height: 1.3;">
                Hello {{firstName}},
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.8);">
                Your email content goes here. Use the variable toolbar above to insert personalized content.
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.8);">
                Feel free to customize this template to match your needs.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);">
                    <a href="{{siteUrl}}" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      Visit SITA →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0 0 10px; font-size: 14px; color: rgba(255,255,255,0.6);">
                With gratitude,<br>
                <strong style="color: #ffffff;">The SITA Team</strong>
              </p>
              <p style="margin: 20px 0 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                © {{year}} SITA. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                <a href="{{unsubscribeUrl}}" style="color: rgba(255,255,255,0.4); text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Load custom variables from localStorage
const loadCustomVariables = (): CustomVariable[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save custom variables to localStorage
const saveCustomVariables = (variables: CustomVariable[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));
};

const TemplateEditorModal = ({ isOpen, onClose, onSave, editTemplate }: TemplateEditorModalProps) => {
  const [template, setTemplate] = useState<Template>({
    name: "",
    subject: "",
    html_content: DEFAULT_HTML,
    category: "general",
    tier_specific: null,
    is_active: true,
  });
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [saving, setSaving] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [customVariables, setCustomVariables] = useState<CustomVariable[]>(loadCustomVariables);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newVariable, setNewVariable] = useState({ key: "", label: "", example: "" });
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCustomVariables(loadCustomVariables());
      if (editTemplate) {
        setTemplate(editTemplate);
      } else {
        setTemplate({
          name: "",
          subject: "",
          html_content: DEFAULT_HTML,
          category: "general",
          tier_specific: null,
          is_active: true,
        });
      }
    }
  }, [isOpen, editTemplate]);

  const addCustomVariable = () => {
    if (!newVariable.key.trim() || !newVariable.label.trim()) {
      toast({
        title: "Error",
        description: "Variable key and label are required",
        variant: "destructive",
      });
      return;
    }

    const key = newVariable.key.startsWith("{{") ? newVariable.key : `{{${newVariable.key}}}`;
    const formattedKey = key.replace(/[{}]/g, "").replace(/\s/g, "");
    const finalKey = `{{${formattedKey}}}`;

    // Check for duplicates
    const allKeys = [...DEFAULT_VARIABLES.map(v => v.key), ...customVariables.map(v => v.key)];
    if (allKeys.includes(finalKey)) {
      toast({
        title: "Error",
        description: "This variable already exists",
        variant: "destructive",
      });
      return;
    }

    const newVar: CustomVariable = {
      id: Date.now().toString(),
      key: finalKey,
      label: newVariable.label,
      example: newVariable.example || `[${newVariable.label}]`,
    };

    const updatedVars = [...customVariables, newVar];
    setCustomVariables(updatedVars);
    saveCustomVariables(updatedVars);
    setNewVariable({ key: "", label: "", example: "" });
    setShowAddCustom(false);

    toast({
      title: "Variable Added",
      description: `Custom variable ${finalKey} created successfully`,
    });
  };

  const updateCustomVariable = (id: string, updates: Partial<CustomVariable>) => {
    const updatedVars = customVariables.map(v => 
      v.id === id ? { ...v, ...updates } : v
    );
    setCustomVariables(updatedVars);
    saveCustomVariables(updatedVars);
    setEditingVariable(null);
  };

  const deleteCustomVariable = (id: string) => {
    const updatedVars = customVariables.filter(v => v.id !== id);
    setCustomVariables(updatedVars);
    saveCustomVariables(updatedVars);
    toast({
      title: "Variable Deleted",
      description: "Custom variable removed successfully",
    });
  };

  const insertVariable = (variable: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = template.html_content;
    
    const newText = text.substring(0, start) + variable + text.substring(end);
    setTemplate(prev => ({ ...prev, html_content: newText }));
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleSave = async () => {
    if (!template.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    if (!template.subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email subject",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (template.id) {
        const { error } = await supabase
          .from("email_templates" as any)
          .update({
            name: template.name,
            subject: template.subject,
            html_content: template.html_content,
            category: template.category,
            tier_specific: template.tier_specific,
            is_active: template.is_active,
          } as any)
          .eq("id", template.id!);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("email_templates" as any)
          .insert({
            name: template.name,
            subject: template.subject,
            html_content: template.html_content,
            category: template.category,
            tier_specific: template.tier_specific,
            is_active: template.is_active,
          } as any);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Template "${template.name}" saved successfully`,
      });

      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Preview with sample data
  const getPreviewHtml = () => {
    let html = template.html_content;
    
    const sampleData: Record<string, string> = {
      "{{name}}": "John Smith",
      "{{firstName}}": "John",
      "{{lastName}}": "Smith",
      "{{email}}": "john@example.com",
      "{{tier}}": "sovereign",
      "{{tierName}}": "Sovereign",
      "{{backerNumber}}": "0042",
      "{{amount}}": "$500",
      "{{date}}": new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      "{{year}}": new Date().getFullYear().toString(),
      "{{phone}}": "+1 555-123-4567",
      "{{company}}": "SITA",
      "{{companyEmail}}": "hello@sita.ai",
      "{{companyPhone}}": "+1 800-SITA",
      "{{siteUrl}}": "https://sita.ai",
      "{{unsubscribeUrl}}": "#",
      "{{subject}}": template.subject || "Email Subject",
      "{{referralCode}}": "REF-JS42",
      "{{customerId}}": "CUST-00042",
    };

    // Add custom variables with their example values
    customVariables.forEach(v => {
      sampleData[v.key] = v.example;
    });

    for (const [key, value] of Object.entries(sampleData)) {
      html = html.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value);
    }

    return html;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">
              {editTemplate ? "Edit Template" : "Create Template"}
            </h2>
            <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "code"
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "preview"
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Settings & Variables */}
          <div className="w-80 border-r border-border overflow-y-auto p-4 space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Template Settings
              </h3>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Backer Welcome - Sovereign"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={template.subject}
                  onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Welcome to SITA, {{firstName}}!"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm placeholder:text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={template.category}
                      onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none transition-all text-foreground text-sm appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tier
                  </label>
                  <div className="relative">
                    <select
                      value={template.tier_specific || ""}
                      onChange={(e) => setTemplate(prev => ({ 
                        ...prev, 
                        tier_specific: e.target.value || null 
                      }))}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none transition-all text-foreground text-sm appearance-none cursor-pointer"
                    >
                      {TIERS.map((tier) => (
                        <option key={tier.value || "all"} value={tier.value || ""}>
                          {tier.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* System Variables */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                System Variables
              </h3>
              <p className="text-xs text-muted-foreground">
                Click to insert at cursor, or copy to clipboard
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {DEFAULT_VARIABLES.map((variable) => {
                  const Icon = variable.icon;
                  return (
                    <div
                      key={variable.key}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                    >
                      <button
                        onClick={() => insertVariable(variable.key)}
                        className="flex items-center gap-2 text-left flex-1"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{variable.label}</p>
                          <p className="text-xs text-muted-foreground font-mono">{variable.key}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => copyVariable(variable.key)}
                        className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-card transition-all"
                        title="Copy to clipboard"
                      >
                        {copiedVar === variable.key ? (
                          <Check className="w-3.5 h-3.5 text-accent" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Variables */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Custom Variables
                </h3>
                <button
                  onClick={() => setShowAddCustom(!showAddCustom)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New
                </button>
              </div>

              {/* Add Custom Variable Form */}
              <AnimatePresence>
                {showAddCustom && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-primary mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="font-medium">Create Custom Variable</span>
                      </div>
                      <input
                        type="text"
                        value={newVariable.key}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="Variable key (e.g., customField)"
                        className="w-full px-2.5 py-1.5 rounded-md bg-background border border-border focus:border-primary outline-none text-xs text-foreground placeholder:text-muted-foreground"
                      />
                      <input
                        type="text"
                        value={newVariable.label}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="Display label (e.g., Custom Field)"
                        className="w-full px-2.5 py-1.5 rounded-md bg-background border border-border focus:border-primary outline-none text-xs text-foreground placeholder:text-muted-foreground"
                      />
                      <input
                        type="text"
                        value={newVariable.example}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, example: e.target.value }))}
                        placeholder="Example value (optional)"
                        className="w-full px-2.5 py-1.5 rounded-md bg-background border border-border focus:border-primary outline-none text-xs text-foreground placeholder:text-muted-foreground"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            setShowAddCustom(false);
                            setNewVariable({ key: "", label: "", example: "" });
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-secondary transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addCustomVariable}
                          className="flex-1 px-2 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-colors"
                        >
                          Add Variable
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom Variables List */}
              <div className="space-y-1.5">
                {customVariables.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">
                    No custom variables yet. Click "Add New" to create one.
                  </p>
                ) : (
                  customVariables.map((variable) => (
                    <div
                      key={variable.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors group"
                    >
                      {editingVariable === variable.id ? (
                        <div className="flex-1 space-y-1.5">
                          <input
                            type="text"
                            value={variable.label}
                            onChange={(e) => updateCustomVariable(variable.id, { label: e.target.value })}
                            className="w-full px-2 py-1 rounded-md bg-background border border-border focus:border-primary outline-none text-xs text-foreground"
                          />
                          <input
                            type="text"
                            value={variable.example}
                            onChange={(e) => updateCustomVariable(variable.id, { example: e.target.value })}
                            placeholder="Example value"
                            className="w-full px-2 py-1 rounded-md bg-background border border-border focus:border-primary outline-none text-xs text-foreground"
                          />
                          <button
                            onClick={() => setEditingVariable(null)}
                            className="text-xs text-primary hover:underline"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => insertVariable(variable.key)}
                            className="flex items-center gap-2 text-left flex-1"
                          >
                            <Sparkles className="w-4 h-4 text-accent" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{variable.label}</p>
                              <p className="text-xs text-muted-foreground font-mono">{variable.key}</p>
                            </div>
                          </button>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => copyVariable(variable.key)}
                              className="p-1.5 rounded hover:bg-card transition-all"
                              title="Copy to clipboard"
                            >
                              {copiedVar === variable.key ? (
                                <Check className="w-3.5 h-3.5 text-accent" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingVariable(variable.id)}
                              className="p-1.5 rounded hover:bg-card transition-all"
                              title="Edit variable"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => deleteCustomVariable(variable.id)}
                              className="p-1.5 rounded hover:bg-destructive/20 transition-all"
                              title="Delete variable"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-sm font-medium text-foreground">Active</span>
              <button
                onClick={() => setTemplate(prev => ({ ...prev, is_active: !prev.is_active }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  template.is_active ? "bg-accent" : "bg-muted"
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  template.is_active ? "left-5" : "left-0.5"
                }`} />
              </button>
            </div>
          </div>

          {/* Main Editor/Preview Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {viewMode === "code" ? (
              <textarea
                ref={textareaRef}
                value={template.html_content}
                onChange={(e) => setTemplate(prev => ({ ...prev, html_content: e.target.value }))}
                className="flex-1 p-4 bg-background text-foreground font-mono text-sm resize-none outline-none border-0"
                placeholder="Enter your HTML email template..."
                spellCheck={false}
              />
            ) : (
              <div className="flex-1 overflow-auto bg-muted p-8">
                <div className="max-w-2xl mx-auto">
                  <div
                    className="bg-background rounded-lg shadow-xl [&_*]:!text-[revert]"
                    dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-border hover:bg-secondary transition-colors text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !template.name || !template.subject}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemplateEditorModal;
