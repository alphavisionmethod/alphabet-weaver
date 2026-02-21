import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, Mail, Phone, Building2, Tag, Calendar, Plus,
  MessageSquare, Edit2, Save, Star, Clock, Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface Note {
  id: string;
  type: string;
  content: string;
  created_at: string;
  created_by: string | null;
}

interface Props {
  contact: Contact;
  onClose: () => void;
  onRefresh: () => void;
}

const ContactDetailPanel = ({ contact, onClose, onRefresh }: Props) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: contact.first_name || "",
    last_name: contact.last_name || "",
    phone: contact.phone || "",
    lifecycle_stage: contact.lifecycle_stage || "lead",
    lead_score: contact.lead_score || 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
    setEditing(false);
    setEditData({
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      phone: contact.phone || "",
      lifecycle_stage: contact.lifecycle_stage || "lead",
      lead_score: contact.lead_score || 0,
    });
  }, [contact.id]);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("contact_notes" as any)
      .select("*")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false });
    setNotes((data || []) as unknown as Note[]);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    const { error } = await supabase.from("contact_notes" as any).insert({
      contact_id: contact.id,
      type: "note",
      content: newNote,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNewNote("");
    fetchNotes();
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    const { error } = await supabase.from("contact_tags" as any).insert({
      contact_id: contact.id,
      tag: newTag.toLowerCase().trim(),
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNewTag("");
    onRefresh();
  };

  const removeTag = async (tag: string) => {
    await supabase.from("contact_tags" as any).delete().eq("contact_id", contact.id).eq("tag", tag);
    onRefresh();
  };

  const saveEdit = async () => {
    const { error } = await supabase.from("contacts" as any).update({
      first_name: editData.first_name || null,
      last_name: editData.last_name || null,
      phone: editData.phone || null,
      lifecycle_stage: editData.lifecycle_stage,
      lead_score: editData.lead_score,
    }).eq("id", contact.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setEditing(false);
    onRefresh();
    toast({ title: "Saved" });
  };

  const stageColors: Record<string, string> = {
    lead: "bg-primary/10 text-primary border-primary/20",
    subscriber: "bg-accent/10 text-accent border-accent/20",
    opportunity: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    customer: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    evangelist: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden h-fit max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold ring-1 ring-primary/20">
            {(contact.first_name || contact.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {contact.first_name || contact.last_name
                ? `${contact.first_name || ""} ${contact.last_name || ""}`.trim()
                : contact.email}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setEditing(!editing)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Edit / Info */}
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input value={editData.first_name} onChange={e => setEditData(p => ({ ...p, first_name: e.target.value }))} placeholder="First name" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
              <input value={editData.last_name} onChange={e => setEditData(p => ({ ...p, last_name: e.target.value }))} placeholder="Last name" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <input value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
            <select value={editData.lifecycle_stage} onChange={e => setEditData(p => ({ ...p, lifecycle_stage: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary capitalize">
              {["lead", "subscriber", "opportunity", "customer", "evangelist"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <div>
              <label className="text-xs text-muted-foreground">Lead Score</label>
              <input type="number" value={editData.lead_score} onChange={e => setEditData(p => ({ ...p, lead_score: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <button onClick={saveEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Stage</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full capitalize mt-1 border ${stageColors[contact.lifecycle_stage || "lead"]}`}>
                {contact.lifecycle_stage || "lead"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Lead Score</p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1 mt-1"><Star className="w-3 h-3 text-amber-500" />{contact.lead_score || 0}</p>
            </div>
            {contact.phone && (
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="text-sm text-foreground mt-1 capitalize">{contact.source || "manual"}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 col-span-2">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm text-foreground mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(contact.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {contact.contact_tags?.map(t => (
              <span key={t.tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                {t.tag}
                <button onClick={() => removeTag(t.tag)} className="hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} placeholder="Add tag..." className="flex-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground outline-none focus:border-primary" />
            <button onClick={addTag} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"><Plus className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Activity & Notes</p>
          <div className="flex gap-2 mb-3">
            <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Add a note..." className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
            <button onClick={addNote} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20">Add</button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No notes yet</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-sm text-foreground">{note.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailPanel;
