import { useState, useEffect } from "react";
import { Save, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BrandTheme {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  logo_url: string | null;
  derived_from_logo: boolean;
  is_active: boolean;
}

const AdminBrand = () => {
  const [theme, setTheme] = useState<BrandTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchTheme(); }, []);

  const fetchTheme = async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)("brand_themes")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (data) {
      setTheme(data as unknown as BrandTheme);
    } else {
      const { data: created } = await (supabase.from as any)("brand_themes").insert({
        name: "Default",
        primary_color: "#7C3AED",
        secondary_color: "#1E293B",
        accent_color: "#F59E0B",
        background_color: "#0A0A0A",
        text_color: "#E5E7EB",
        is_active: true,
      }).select().single();
      if (created) setTheme(created as unknown as BrandTheme);
    }
    setLoading(false);
  };

  const saveTheme = async () => {
    if (!theme) return;
    setSaving(true);
    const { error } = await (supabase.from as any)("brand_themes")
      .update({
        name: theme.name,
        primary_color: theme.primary_color,
        secondary_color: theme.secondary_color,
        accent_color: theme.accent_color,
        background_color: theme.background_color,
        text_color: theme.text_color,
      })
      .eq("id", theme.id);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Theme Saved" });
    setSaving(false);
  };

  if (loading || !theme) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const colorFields = [
    { key: "primary_color", label: "Primary" },
    { key: "secondary_color", label: "Secondary" },
    { key: "accent_color", label: "Accent" },
    { key: "background_color", label: "Background" },
    { key: "text_color", label: "Text" },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brand Theme</h1>
          <p className="text-sm text-muted-foreground mt-1">Customize your brand colors.</p>
        </div>
        <button
          onClick={saveTheme}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Color pickers */}
      <div className="bg-card/50 border border-border/30 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {colorFields.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme[key]}
                  onChange={e => setTheme(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={theme[key]}
                  onChange={e => setTheme(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-xs font-mono text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-card/50 border border-border/30 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Preview</h2>
        <div
          className="rounded-xl p-6 space-y-4"
          style={{ backgroundColor: theme.background_color, color: theme.text_color }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: theme.primary_color }} />
            <div>
              <h3 className="font-bold" style={{ color: theme.text_color }}>SITA OS</h3>
              <p className="text-sm" style={{ color: theme.text_color, opacity: 0.6 }}>Governed AI Infrastructure</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: theme.primary_color }}>
              Primary Button
            </button>
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: theme.accent_color }}>
              Accent Button
            </button>
            <div className="px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: theme.secondary_color, color: theme.text_color }}>
              Secondary
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBrand;
