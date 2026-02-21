import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Plus, X, Save, Trash2, Calendar, User, Building2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DealStage {
  id: string;
  name: string;
  stage_order: number;
  color: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage_id: string;
  contact_id: string | null;
  probability: number;
  expected_close_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  contacts?: { first_name: string | null; last_name: string | null; email: string } | null;
}

const DealsTab = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<DealStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", value: "", stage_id: "", expected_close_date: "", notes: "" });
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [stagesRes, dealsRes] = await Promise.all([
      supabase.from("deal_stages" as any).select("*").order("stage_order"),
      supabase.from("deals" as any).select("*, contacts(first_name, last_name, email)").order("created_at", { ascending: false }),
    ]);
    if (stagesRes.error) toast({ title: "Error", description: stagesRes.error.message, variant: "destructive" });
    if (dealsRes.error) toast({ title: "Error", description: dealsRes.error.message, variant: "destructive" });
    setStages((stagesRes.data || []) as unknown as DealStage[]);
    setDeals((dealsRes.data || []) as unknown as Deal[]);
    setLoading(false);
  };

  const createDeal = async () => {
    if (!form.title.trim() || !form.stage_id) { toast({ title: "Error", description: "Title and stage required", variant: "destructive" }); return; }
    const { error } = await supabase.from("deals" as any).insert({
      title: form.title,
      value: parseFloat(form.value) || 0,
      stage_id: form.stage_id,
      expected_close_date: form.expected_close_date || null,
      notes: form.notes || null,
    } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deal Created" });
    setForm({ title: "", value: "", stage_id: "", expected_close_date: "", notes: "" });
    setShowCreate(false);
    fetchAll();
  };

  const moveDeal = async (dealId: string, newStageId: string) => {
    const stage = stages.find(s => s.id === newStageId);
    const updates: any = { stage_id: newStageId };
    if (stage?.name === "Won") { updates.status = "won"; updates.actual_close_date = new Date().toISOString().split("T")[0]; }
    if (stage?.name === "Lost") { updates.status = "lost"; updates.actual_close_date = new Date().toISOString().split("T")[0]; }

    const { error } = await supabase.from("deals" as any).update(updates).eq("id", dealId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    fetchAll();
  };

  const deleteDeal = async (id: string) => {
    await supabase.from("deals" as any).delete().eq("id", id);
    setDeals(prev => prev.filter(d => d.id !== id));
    toast({ title: "Deleted" });
  };

  const totalValue = deals.filter(d => d.status === "open").reduce((s, d) => s + (d.value || 0), 0);
  const wonValue = deals.filter(d => d.status === "won").reduce((s, d) => s + (d.value || 0), 0);

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Deal Pipeline</h2>
          <p className="text-sm text-muted-foreground">{deals.length} deals · ${totalValue.toLocaleString()} pipeline · ${wonValue.toLocaleString()} won</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90">
          <Plus className="w-4 h-4" />Add Deal
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">New Deal</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Deal title *" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="Value ($)" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <select value={form.stage_id} onChange={e => setForm(p => ({ ...p, stage_id: e.target.value }))} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary">
                  <option value="">Select stage *</option>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="date" value={form.expected_close_date} onChange={e => setForm(p => ({ ...p, expected_close_date: e.target.value }))} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <button onClick={createDeal} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
                <Save className="w-4 h-4" />Create Deal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban pipeline */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageDeals = deals.filter(d => d.stage_id === stage.id);
          const stageValue = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
          return (
            <div key={stage.id} className="min-w-[250px] flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-sm font-medium text-foreground">{stage.name}</span>
                  <span className="text-xs text-muted-foreground">({stageDeals.length})</span>
                </div>
                <span className="text-xs text-muted-foreground">${stageValue.toLocaleString()}</span>
              </div>
              <div
                className="space-y-2 min-h-[100px] p-2 rounded-xl bg-secondary/30 border border-border/50"
                onDragOver={(e: React.DragEvent) => e.preventDefault()}
                onDrop={(e: React.DragEvent) => {
                  e.preventDefault();
                  const dealId = e.dataTransfer.getData("dealId");
                  if (dealId) moveDeal(dealId, stage.id);
                }}
              >
                {stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e: React.DragEvent<HTMLDivElement>) => e.dataTransfer.setData("dealId", deal.id)}
                    className="bg-card border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{deal.title}</p>
                        <p className="text-lg font-bold text-foreground mt-1">${(deal.value || 0).toLocaleString()}</p>
                      </div>
                      <button onClick={() => deleteDeal(deal.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {deal.contacts && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {deal.contacts.first_name || deal.contacts.email}
                      </p>
                    )}
                    {deal.expected_close_date && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(deal.expected_close_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealsTab;
