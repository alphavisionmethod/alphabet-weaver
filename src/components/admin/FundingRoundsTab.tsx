import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Save, RefreshCw, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FundingRound {
  id: string;
  phase_name: string;
  target_amount: number;
  current_amount: number;
  status: string;
  description: string | null;
  fund_allocation: Record<string, number> | null;
  display_order: number;
}

const statusOptions = ["active", "upcoming", "completed"];

const FundingRoundsTab = () => {
  const [rounds, setRounds] = useState<FundingRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRounds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("funding_rounds" as any)
      .select("*")
      .order("display_order" as any);
    if (data) setRounds(data as unknown as FundingRound[]);
    setLoading(false);
  };

  useEffect(() => { fetchRounds(); }, []);

  const updateField = (id: string, field: keyof FundingRound, value: any) => {
    setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const saveRound = async (round: FundingRound) => {
    setSavingId(round.id);
    const { error } = await supabase
      .from("funding_rounds" as any)
      .update({
        phase_name: round.phase_name,
        target_amount: round.target_amount,
        current_amount: round.current_amount,
        status: round.status,
        description: round.description,
      } as any)
      .eq("id", round.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: `${round.phase_name} updated successfully` });
    }
    setSavingId(null);
  };

  const formatCurrency = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading funding rounds...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Funding Rounds</h3>
          <p className="text-sm text-muted-foreground">Edit targets, amounts raised, and phase statuses</p>
        </div>
        <button onClick={fetchRounds} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-4">
        {rounds.map((round, i) => {
          const progress = round.target_amount > 0 ? Math.min((round.current_amount / round.target_amount) * 100, 100) : 0;
          return (
            <motion.div
              key={round.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border/50 bg-card/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{round.phase_name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(round.current_amount)} / {formatCurrency(round.target_amount)} ({progress.toFixed(0)}%)</p>
                  </div>
                </div>
                <button
                  onClick={() => saveRound(round)}
                  disabled={savingId === round.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingId === round.id ? "Saving..." : "Save"}
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-secondary mb-5">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${progress}%` }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Phase Name</label>
                  <input
                    value={round.phase_name}
                    onChange={(e) => updateField(round.id, "phase_name", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Target Amount ($)</label>
                  <input
                    type="number"
                    value={round.target_amount}
                    onChange={(e) => updateField(round.id, "target_amount", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Current Amount ($)</label>
                  <input
                    type="number"
                    value={round.current_amount}
                    onChange={(e) => updateField(round.id, "current_amount", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
                  <select
                    value={round.status}
                    onChange={(e) => updateField(round.id, "status", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50 transition-colors"
                  >
                    {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
                <textarea
                  value={round.description || ""}
                  onChange={(e) => updateField(round.id, "description", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FundingRoundsTab;