import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send, Users, Crown, Briefcase, Clock, CheckCircle, AlertCircle, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  subject: string;
  category: string;
}

interface QueuedEmail {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  status: string;
  scheduled_at: string;
  sent_at: string | null;
  email_templates?: {
    name: string;
  };
}

const BroadcastsTab = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recentBroadcasts, setRecentBroadcasts] = useState<QueuedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<"all" | "donors" | "waitlist" | "investors">("all");
  const [selectedTier, setSelectedTier] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active templates
      const { data: tempData, error: tempError } = await supabase
        .from("email_templates" as any)
        .select("id, name, subject, category")
        .eq("is_active", true)
        .order("name");

      if (tempError) throw tempError;
      setTemplates((tempData || []) as unknown as Template[]);

      // Fetch recent broadcast emails from queue
      const { data: queueData, error: queueError } = await supabase
        .from("email_queue" as any)
        .select(`
          id, recipient_email, recipient_name, status, scheduled_at, sent_at,
          email_templates (name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (queueError) throw queueError;
      setRecentBroadcasts((queueData || []) as unknown as QueuedEmail[]);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Select a Template",
        description: "Please select an email template to send.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("send-broadcast", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          templateId: selectedTemplate,
          audience: selectedAudience,
          tierFilter: selectedTier || undefined,
          scheduleAt: scheduleDate || undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Broadcast Queued! 🚀",
        description: `${data.queued} emails have been queued for delivery.`,
      });

      // Reset form and refresh
      setSelectedTemplate("");
      setSelectedTier("");
      setScheduleDate("");
      await fetchData();
    } catch (error: any) {
      console.error("Broadcast error:", error);
      toast({
        title: "Broadcast Failed",
        description: error.message || "Failed to queue broadcast.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case "donors":
        return <Crown className="w-4 h-4" />;
      case "investors":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            <CheckCircle className="w-3 h-3" />
            Sent
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
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
      {/* Send Broadcast Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 border border-border/50 rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6">Send Broadcast</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
            >
              <option value="">Select a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>

          {/* Audience Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Audience</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "all", label: "All", icon: Users },
                { value: "donors", label: "Backers", icon: Crown },
                { value: "waitlist", label: "Waitlist", icon: Users },
                { value: "investors", label: "Investors", icon: Briefcase },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedAudience(option.value as typeof selectedAudience)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                    selectedAudience === option.value
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-secondary/50 border-border hover:border-primary/20"
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tier Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tier Filter (Optional)</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
            >
              <option value="">All Tiers</option>
              <option value="governance">Governance</option>
              <option value="sovereign">Sovereign</option>
              <option value="operator">Operator</option>
            </select>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Schedule (Optional)</label>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
            />
            <p className="text-xs text-muted-foreground">Leave empty to send immediately</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={sendBroadcast}
            disabled={sending || !selectedTemplate}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50"
          >
            {sending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Broadcast
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Recent Broadcasts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Queue</h3>
        <div className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden">
          {recentBroadcasts.length === 0 ? (
            <div className="p-8 text-center">
              <Send className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No recent broadcasts</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentBroadcasts.slice(0, 10).map((email) => (
                <div key={email.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                      {email.recipient_name?.charAt(0) || email.recipient_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {email.recipient_name || email.recipient_email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {email.email_templates?.name || "Unknown template"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(email.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(email.scheduled_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastsTab;
