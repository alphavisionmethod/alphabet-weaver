import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Save, X, GripVertical, Eye, EyeOff,
  Heart, Rocket, Crown, Gift, Star, Zap, Shield, Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, any> = {
  Heart, Rocket, Crown, Gift, Star, Zap, Shield, Award,
};

interface Tier {
  id: string;
  tier_id: string;
  name: string;
  amount: number;
  description: string;
  icon: string;
  color: string;
  perks: string[];
  is_open: boolean;
  popular: boolean;
  image_url: string | null;
  stripe_price_id: string | null;
  display_order: number;
  is_active: boolean;
}

const emptyTier: Omit<Tier, "id"> = {
  tier_id: "",
  name: "",
  amount: 0,
  description: "",
  icon: "Heart",
  color: "hsl(270 91% 55%)",
  perks: [""],
  is_open: false,
  popular: false,
  image_url: null,
  stripe_price_id: null,
  display_order: 0,
  is_active: true,
};

const TierManagementTab = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<Tier, "id">>(emptyTier);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchTiers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("donation_tiers" as any)
      .select("*")
      .order("display_order", { ascending: true });
    if (!error && data) setTiers(data as unknown as Tier[]);
    setLoading(false);
  };

  useEffect(() => { fetchTiers(); }, []);

  const startEdit = (tier: Tier) => {
    setEditing(tier.id);
    setCreating(false);
    setFormData({ ...tier });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setFormData({ ...emptyTier, display_order: tiers.length, tier_id: `tier-${Date.now()}` });
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
  };

  const saveTier = async () => {
    if (!formData.name || !formData.tier_id) {
      toast({ title: "Error", description: "Name and Tier ID are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const cleanPerks = formData.perks.filter((p) => p.trim() !== "");

    if (creating) {
      const { error } = await supabase.from("donation_tiers" as any).insert({
        ...formData,
        perks: cleanPerks,
      } as any);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Created", description: `${formData.name} tier created` });
      }
    } else if (editing) {
      const { error } = await supabase
        .from("donation_tiers" as any)
        .update({ ...formData, perks: cleanPerks } as any)
        .eq("id", editing);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Updated", description: `${formData.name} tier updated` });
      }
    }

    setSaving(false);
    cancel();
    fetchTiers();
  };

  const deleteTier = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" tier? This cannot be undone.`)) return;
    const { error } = await supabase.from("donation_tiers" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `${name} tier removed` });
      fetchTiers();
    }
  };

  const toggleActive = async (tier: Tier) => {
    await supabase
      .from("donation_tiers" as any)
      .update({ is_active: !tier.is_active } as any)
      .eq("id", tier.id);
    fetchTiers();
  };

  const updatePerk = (index: number, value: string) => {
    const newPerks = [...formData.perks];
    newPerks[index] = value;
    setFormData({ ...formData, perks: newPerks });
  };

  const addPerk = () => setFormData({ ...formData, perks: [...formData.perks, ""] });
  const removePerk = (index: number) => {
    const newPerks = formData.perks.filter((_, i) => i !== index);
    setFormData({ ...formData, perks: newPerks.length ? newPerks : [""] });
  };

  const isEditorOpen = editing !== null || creating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Contribution Tiers</h2>
          <p className="text-sm text-muted-foreground">Manage tiers displayed on the /fund page</p>
        </div>
        <button
          onClick={startCreate}
          disabled={isEditorOpen}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Tier
        </button>
      </div>

      {/* Editor */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-border/50 bg-card/80 overflow-hidden"
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{creating ? "New Tier" : "Edit Tier"}</h3>
                <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tier ID (unique slug)</label>
                  <input
                    value={formData.tier_id}
                    onChange={(e) => setFormData({ ...formData, tier_id: e.target.value })}
                    disabled={!creating}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50 disabled:opacity-50"
                    placeholder="e.g. supporter"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    placeholder="e.g. Supporter"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount ($)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Stripe Price ID</label>
                  <input
                    value={formData.stripe_price_id || ""}
                    onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    placeholder="price_xxx (leave empty for custom amount)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                  <input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    placeholder="Short description"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(ICON_MAP).map((iconName) => {
                      const Icon = ICON_MAP[iconName];
                      return (
                        <button
                          key={iconName}
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                            formData.icon === iconName
                              ? "bg-primary/20 border-primary/50 text-primary"
                              : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Color (HSL)</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg border border-border" style={{ background: formData.color }} />
                    <input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50"
                      placeholder="hsl(270 91% 55%)"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Image URL (optional)</label>
                  <input
                    value={formData.image_url || ""}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={formData.is_open} onChange={(e) => setFormData({ ...formData, is_open: e.target.checked })} className="rounded" />
                  Open Amount (custom $)
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={formData.popular} onChange={(e) => setFormData({ ...formData, popular: e.target.checked })} className="rounded" />
                  Popular Badge
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
                  Active
                </label>
              </div>

              {/* Perks */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Perks</label>
                <div className="space-y-2">
                  {formData.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={perk}
                        onChange={(e) => updatePerk(i, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50"
                        placeholder="Perk description"
                      />
                      <button onClick={() => removePerk(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addPerk} className="text-xs text-primary hover:text-primary/80 font-medium">+ Add perk</button>
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={cancel} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border">Cancel</button>
                <button
                  onClick={saveTier}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading tiers...</div>
        ) : tiers.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No tiers yet. Create your first one!</p>
          </div>
        ) : (
          tiers.map((tier) => {
            const Icon = ICON_MAP[tier.icon] || Heart;
            return (
              <motion.div
                key={tier.id}
                layout
                className={`rounded-xl border p-4 flex items-center gap-4 transition-all ${
                  tier.is_active ? "border-border/50 bg-card/50" : "border-border/30 bg-card/20 opacity-60"
                }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${tier.color}22` }}>
                  <Icon className="w-5 h-5" style={{ color: tier.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{tier.name}</span>
                    {tier.popular && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary">POPULAR</span>
                    )}
                    {tier.is_open && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent">OPEN</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{tier.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-foreground">{tier.is_open ? "Custom" : `$${tier.amount}`}</p>
                  <p className="text-xs text-muted-foreground">{tier.perks.length} perks</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(tier)}
                    className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                    title={tier.is_active ? "Deactivate" : "Activate"}
                  >
                    {tier.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(tier)}
                    disabled={isEditorOpen}
                    className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTier(tier.id, tier.name)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TierManagementTab;
