import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, Clock, Plus, X, Save, Trash2, Calendar, AlertTriangle, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  contact_id: string | null;
  deal_id: string | null;
  assigned_to: string | null;
  created_at: string;
  contacts?: { first_name: string | null; email: string } | null;
}

const PRIORITIES = ["low", "medium", "high", "urgent"];
const TYPES = ["task", "call", "meeting", "follow_up", "email"];

const TasksTab = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "task", priority: "medium", due_date: "" });
  const { toast } = useToast();

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks" as any)
      .select("*, contacts(first_name, email)")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setTasks((data || []) as unknown as Task[]);
    setLoading(false);
  };

  const createTask = async () => {
    if (!form.title.trim()) { toast({ title: "Error", description: "Title required", variant: "destructive" }); return; }
    const { error } = await supabase.from("tasks" as any).insert({
      title: form.title,
      description: form.description || null,
      type: form.type,
      priority: form.priority,
      due_date: form.due_date || null,
    } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Task Created" });
    setForm({ title: "", description: "", type: "task", priority: "medium", due_date: "" });
    setShowCreate(false);
    fetchTasks();
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const { error } = await supabase.from("tasks" as any).update({
      status: newStatus,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    } as any).eq("id", task.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks" as any).delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
    toast({ title: "Deleted" });
  };

  const now = new Date();
  const isOverdue = (t: Task) => t.status !== "completed" && t.due_date && new Date(t.due_date) < now;

  const filtered = tasks.filter(t => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    if (filter === "overdue") return isOverdue(t);
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;
  const completedCount = tasks.filter(t => t.status === "completed").length;

  const priorityColors: Record<string, string> = {
    low: "text-muted-foreground",
    medium: "text-primary",
    high: "text-amber-500",
    urgent: "text-destructive",
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Tasks & Activities</h2>
          <p className="text-sm text-muted-foreground">{pendingCount} pending · {overdueCount} overdue · {completedCount} completed</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90">
          <Plus className="w-4 h-4" />Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {([["all", `All (${tasks.length})`], ["pending", `Pending (${pendingCount})`], ["overdue", `Overdue (${overdueCount})`], ["completed", `Done (${completedCount})`]] as const).map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === f ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Create */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">New Task</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title *" className="col-span-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary capitalize">
                  {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace("_", " ")}</option>)}
                </select>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary capitalize">
                  {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
                <input type="datetime-local" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary" />
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="col-span-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground outline-none focus:border-primary resize-none" />
              </div>
              <button onClick={createTask} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
                <Save className="w-4 h-4" />Create Task
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Tasks</h3>
            <p className="text-muted-foreground text-sm">All caught up!</p>
          </div>
        ) : (
          filtered.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-card/50 border border-border/50 rounded-xl p-4 hover:border-primary/20 transition-all group ${task.status === "completed" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0">
                  {task.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-accent" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
                    <Flag className={`w-3 h-3 ${priorityColors[task.priority]}`} />
                    {isOverdue(task) && <AlertTriangle className="w-3 h-3 text-destructive" />}
                  </div>
                  {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="capitalize px-2 py-0.5 rounded-full bg-secondary border border-border">{task.type.replace("_", " ")}</span>
                    {task.due_date && (
                      <span className={`flex items-center gap-1 ${isOverdue(task) ? "text-destructive" : ""}`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {task.contacts && (
                      <span>{task.contacts.first_name || task.contacts.email}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksTab;
