import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, Search, Globe, Users, Trash2, X, Edit2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
}

const CompaniesTab = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", domain: "", industry: "", size: "", website: "", phone: "", city: "", country: "", notes: "" });
  const { toast } = useToast();

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("companies" as any).select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setCompanies((data || []) as unknown as Company[]);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Error", description: "Name is required", variant: "destructive" }); return; }
    const payload = {
      name: form.name,
      domain: form.domain || null,
      industry: form.industry || null,
      size: form.size || null,
      website: form.website || null,
      phone: form.phone || null,
      city: form.city || null,
      country: form.country || null,
      notes: form.notes || null,
    };

    if (editingId) {
      const { error } = await supabase.from("companies" as any).update(payload as any).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated" });
    } else {
      const { error } = await supabase.from("companies" as any).insert(payload as any);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Company Created" });
    }
    resetForm();
    fetchCompanies();
  };

  const resetForm = () => {
    setForm({ name: "", domain: "", industry: "", size: "", website: "", phone: "", city: "", country: "", notes: "" });
    setShowCreate(false);
    setEditingId(null);
  };

  const editCompany = (c: Company) => {
    setForm({
      name: c.name, domain: c.domain || "", industry: c.industry || "",
      size: c.size || "", website: c.website || "", phone: c.phone || "",
      city: c.city || "", country: c.country || "", notes: c.notes || "",
    });
    setEditingId(c.id);
    setShowCreate(true);
  };

  const deleteCompany = async (id: string) => {
    const { error } = await supabase.from("companies" as any).delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setCompanies(prev => prev.filter(c => c.id !== id));
    toast({ title: "Deleted" });
  };

  const filtered = companies.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.domain?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Companies</h2>
          <p className="text-sm text-muted-foreground">{companies.length} companies</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" />Add Company
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary outline-none text-foreground text-sm placeholder:text-muted-foreground" />
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{editingId ? "Edit Company" : "New Company"}</h3>
                <button onClick={resetForm} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Company name *" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <input value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} placeholder="Domain" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <input value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} placeholder="Industry" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <select value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary">
                  <option value="">Company size</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-1000">201-1000</option>
                  <option value="1000+">1000+</option>
                </select>
                <input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="Website" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Country" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes" rows={2} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary resize-none" />
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
                <Save className="w-4 h-4" />{editingId ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Companies</h3>
            <p className="text-muted-foreground text-sm">Add your first company</p>
          </div>
        ) : (
          filtered.map(company => (
            <motion.div key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card/50 border border-border/50 rounded-xl p-4 hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{company.name}</p>
                    {company.domain && <p className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" />{company.domain}</p>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editCompany(company)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteCompany(company.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                {company.industry && <span className="px-2 py-0.5 rounded-full bg-secondary border border-border">{company.industry}</span>}
                {company.size && <span className="px-2 py-0.5 rounded-full bg-secondary border border-border">{company.size} employees</span>}
                {company.city && <span>{company.city}{company.country ? `, ${company.country}` : ""}</span>}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompaniesTab;
