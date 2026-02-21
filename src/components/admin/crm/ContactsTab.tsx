import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Mail, Phone, Building2, Tag, Calendar,
  ChevronRight, MoreHorizontal, Users, Filter, Download,
  Edit2, Trash2, Eye, X, MessageSquare, Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContactDetailPanel from "./ContactDetailPanel";

interface Contact {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company_id: string | null;
  source: string | null;
  status: string | null;
  lifecycle_stage: string | null;
  lead_score: number | null;
  last_activity_at: string | null;
  created_at: string;
  companies?: { name: string } | null;
  contact_tags?: { tag: string }[];
}

const LIFECYCLE_STAGES = ["lead", "subscriber", "opportunity", "customer", "evangelist"];
const STATUSES = ["active", "inactive", "bounced", "unsubscribed"];

const ContactsTab = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContact, setNewContact] = useState({ email: "", first_name: "", last_name: "", phone: "", source: "manual" });
  const { toast } = useToast();

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts" as any)
        .select("*, companies(name), contact_tags(tag)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setContacts((data || []) as unknown as Contact[]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createContact = async () => {
    if (!newContact.email.trim()) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("contacts" as any).insert({
        email: newContact.email,
        first_name: newContact.first_name || null,
        last_name: newContact.last_name || null,
        phone: newContact.phone || null,
        source: newContact.source,
      } as any);
      if (error) throw error;
      toast({ title: "Contact Created", description: `${newContact.email} added.` });
      setNewContact({ email: "", first_name: "", last_name: "", phone: "", source: "manual" });
      setShowCreateForm(false);
      fetchContacts();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase.from("contacts" as any).delete().eq("id", id);
      if (error) throw error;
      setContacts(prev => prev.filter(c => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
      toast({ title: "Deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filtered = contacts.filter(c => {
    const matchesSearch = !search || 
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || c.lifecycle_stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const stageCounts = LIFECYCLE_STAGES.reduce((acc, s) => {
    acc[s] = contacts.filter(c => c.lifecycle_stage === s).length;
    return acc;
  }, {} as Record<string, number>);

  const stageColors: Record<string, string> = {
    lead: "bg-primary/10 text-primary",
    subscriber: "bg-accent/10 text-accent",
    opportunity: "bg-amber-500/10 text-amber-500",
    customer: "bg-emerald-500/10 text-emerald-500",
    evangelist: "bg-pink-500/10 text-pink-500",
  };

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
          <h2 className="text-xl font-semibold text-foreground">Contacts</h2>
          <p className="text-sm text-muted-foreground">{contacts.length} total contacts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Stage pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStageFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${stageFilter === "all" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          All ({contacts.length})
        </button>
        {LIFECYCLE_STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${stageFilter === stage ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            {stage} ({stageCounts[stage] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">New Contact</h3>
                <button onClick={() => setShowCreateForm(false)} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={newContact.first_name} onChange={e => setNewContact(p => ({ ...p, first_name: e.target.value }))} placeholder="First name" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <input type="text" value={newContact.last_name} onChange={e => setNewContact(p => ({ ...p, last_name: e.target.value }))} placeholder="Last name" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <input type="email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} placeholder="Email *" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <input type="tel" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <button onClick={createContact} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90">
                Create Contact
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact list + detail split */}
      <div className="flex gap-4">
        <div className={`space-y-2 ${selectedContact ? "w-1/2" : "w-full"} transition-all`}>
          {filtered.length === 0 ? (
            <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Contacts</h3>
              <p className="text-muted-foreground text-sm">Add your first contact to get started</p>
            </div>
          ) : (
            filtered.map(contact => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedContact(contact)}
                className={`bg-card/50 border rounded-xl p-4 cursor-pointer transition-all group hover:border-primary/20 ${
                  selectedContact?.id === contact.id ? "border-primary/40 ring-1 ring-primary/20" : "border-border/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-sm ring-1 ring-primary/20">
                      {(contact.first_name || contact.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {contact.first_name || contact.last_name
                          ? `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
                          : contact.email}
                      </p>
                      <p className="text-xs text-muted-foreground">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${stageColors[contact.lifecycle_stage || "lead"] || stageColors.lead}`}>
                      {contact.lifecycle_stage || "lead"}
                    </span>
                    {contact.companies && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {(contact.companies as any)?.name}
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteContact(contact.id); }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {contact.contact_tags && contact.contact_tags.length > 0 && (
                  <div className="flex gap-1 mt-2 ml-13">
                    {contact.contact_tags.slice(0, 3).map(t => (
                      <span key={t.tag} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        {t.tag}
                      </span>
                    ))}
                    {contact.contact_tags.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{contact.contact_tags.length - 3}</span>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedContact && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-1/2"
            >
              <ContactDetailPanel
                contact={selectedContact}
                onClose={() => setSelectedContact(null)}
                onRefresh={fetchContacts}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContactsTab;
