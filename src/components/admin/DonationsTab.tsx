import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, DollarSign, CheckCircle, Clock, XCircle, Download, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Donation {
  id: string;
  name: string | null;
  email: string;
  amount: number;
  tier: string;
  message: string | null;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { icon: any; label: string; classes: string }> = {
  pending: { icon: Clock, label: "Pending", classes: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  approved: { icon: CheckCircle, label: "Approved", classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  rejected: { icon: XCircle, label: "Rejected", classes: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const tierColors: Record<string, string> = {
  supporter: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  builder: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  visionary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const DonationsTab = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDonations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("donations" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDonations(data as unknown as Donation[]);
    setLoading(false);
  };

  useEffect(() => { fetchDonations(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("donations" as any)
      .update({ status } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
      toast({ title: "Updated", description: `Donation marked as ${status}` });
    }
    setUpdatingId(null);
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Amount", "Tier", "Status", "Message", "Date"];
    const rows = donations.map((d) => [
      d.name || "", d.email, `$${d.amount}`, d.tier, d.status, d.message || "",
      new Date(d.created_at).toLocaleString(),
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `donations_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRaised = donations.filter((d) => d.status !== "rejected").reduce((s, d) => s + d.amount, 0);
  const approvedCount = donations.filter((d) => d.status === "approved").length;
  const pendingCount = donations.filter((d) => d.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">${totalRaised.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Contributions</p>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button onClick={fetchDonations} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contributor</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tier</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No donations yet</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {donations.map((d, i) => {
                    const StatusIcon = statusConfig[d.status]?.icon || Clock;
                    return (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 text-primary font-bold text-sm">
                              {(d.name || d.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-foreground font-medium block">{d.name || "Anonymous"}</span>
                              <span className="text-muted-foreground text-sm">{d.email}</span>
                              {d.message && <p className="text-muted-foreground/60 text-xs mt-0.5 max-w-[200px] truncate">{d.message}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${tierColors[d.tier] || tierColors.open}`}>
                            {d.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-foreground font-bold text-lg">${d.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[d.status]?.classes || statusConfig.pending.classes}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[d.status]?.label || d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {d.status !== "approved" && (
                              <button
                                onClick={() => updateStatus(d.id, "approved")}
                                disabled={updatingId === d.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {d.status !== "rejected" && (
                              <button
                                onClick={() => updateStatus(d.id, "rejected")}
                                disabled={updatingId === d.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonationsTab;