import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, Mail, Eye, Crown, Rocket, Users, FileText, Copy, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TemplateEditorModal from "./TemplateEditorModal";
import { PRESET_TEMPLATES } from "./presetTemplates";

interface Template {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  category: string;
  tier_specific: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TemplatesTab = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates" as any)
        .select("*")
        .order("category")
        .order("name");

      if (error) throw error;
      setTemplates((data || []) as unknown as Template[]);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "welcome":
        return <Crown className="w-4 h-4" />;
      case "update":
        return <Rocket className="w-4 h-4" />;
      case "reminder":
        return <Mail className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "welcome":
        return "bg-gold/10 text-gold border-gold/20";
      case "update":
        return "bg-accent/10 text-accent border-accent/20";
      case "reminder":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("email_templates" as any)
        .update({ is_active: !isActive } as any)
        .eq("id", id);

      if (error) throw error;

      setTemplates(prev =>
        prev.map(t => t.id === id ? { ...t, is_active: !isActive } : t)
      );

      toast({
        title: isActive ? "Template Disabled" : "Template Enabled",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const duplicateTemplate = async (template: Template) => {
    try {
      const { error } = await supabase
        .from("email_templates" as any)
        .insert({
          name: `${template.name} (Copy)`,
          subject: template.subject,
          html_content: template.html_content,
          category: template.category,
          tier_specific: template.tier_specific,
          is_active: false,
        } as any);

      if (error) throw error;

      await fetchTemplates();
      toast({ title: "Template Duplicated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Email Templates</h2>
          <p className="text-sm text-muted-foreground">
            Reusable email templates for your campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              try {
                for (const preset of PRESET_TEMPLATES) {
                  const { data: existing } = await supabase
                    .from("email_templates" as any)
                    .select("id")
                    .eq("name", preset.name)
                    .maybeSingle();

                  if (!existing) {
                    const { error } = await supabase
                      .from("email_templates" as any)
                      .insert(preset);
                    if (error) throw error;
                  }
                }
                await fetchTemplates();
                toast({ title: "Preset Templates Added", description: "Default SITA templates have been seeded." });
              } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 text-primary font-medium hover:bg-primary/10 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Seed Defaults
          </button>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowEditor(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Templates by Category */}
      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Templates Yet</h3>
          <p className="text-muted-foreground text-sm">
            Create your first email template to start building campaigns
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                {getCategoryIcon(category)}
                {category} Templates
              </h3>
              <div className="grid gap-4">
                <AnimatePresence>
                  {categoryTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-card/50 border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-foreground">{template.name}</h4>
                            {template.tier_specific && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 capitalize">
                                {template.tier_specific}
                              </span>
                            )}
                            {!template.is_active && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                Disabled
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Subject: {template.subject}
                          </p>
                          <p className="text-xs text-muted-foreground/60">
                            Updated {new Date(template.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowPreview(true);
                            }}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateTemplate(template)}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTemplate(template);
                              setShowEditor(true);
                            }}
                            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.subject}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                <div
                  className="bg-white rounded-lg"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.html_content }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Editor Modal */}
      <TemplateEditorModal
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
        onSave={fetchTemplates}
        editTemplate={editingTemplate}
      />
    </div>
  );
};

export default TemplatesTab;
