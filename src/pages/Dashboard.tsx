import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Download, Lock, LogOut, Mail, Calendar, Tag, Users, 
  DollarSign, UserCheck, TrendingUp, Crown, Rocket, Send, 
  RefreshCw, CheckCircle, Clock, BarChart3, Sparkles, Eye,
  Workflow, FileText, Radio, Contact, Building2, Target, ListTodo, Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import EmailPreviewModal from "@/components/admin/EmailPreviewModal";
import WorkflowsTab from "@/components/admin/WorkflowsTab";
import TemplatesTab from "@/components/admin/TemplatesTab";
import BroadcastsTab from "@/components/admin/BroadcastsTab";
import EmailAnalyticsTab from "@/components/admin/EmailAnalyticsTab";
import ContactsTab from "@/components/admin/crm/ContactsTab";
import CompaniesTab from "@/components/admin/crm/CompaniesTab";
import DealsTab from "@/components/admin/crm/DealsTab";
import TasksTab from "@/components/admin/crm/TasksTab";
import CRMAnalyticsTab from "@/components/admin/crm/CRMAnalyticsTab";
import DonationsTab from "@/components/admin/DonationsTab";
import FundingRoundsTab from "@/components/admin/FundingRoundsTab";
import TierManagementTab from "@/components/admin/TierManagementTab";

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  interest: string | null;
  source: string | null;
  category: string | null;
  tier: string | null;
  amount: number | null;
  created_at: string;
}

interface DonorEntry {
  id: string;
  email: string;
  name: string;
  tier: string;
  amount: number;
  welcome_email_sent: boolean | null;
  email_sequence_step: number | null;
  created_at: string;
}

// Stat card component
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  trend, 
  variant = "primary",
  subValue
}: { 
  icon: any; 
  value: string | number; 
  label: string; 
  trend?: string;
  variant?: "primary" | "accent" | "gold";
  subValue?: string;
}) => {
  const variantStyles = {
    primary: "bg-primary/10 ring-primary/20 text-primary",
    accent: "bg-accent/10 ring-accent/20 text-accent",
    gold: "bg-gold/10 ring-gold/20 text-gold",
  };
  
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-5 group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ring-1 ${variantStyles[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {subValue && <p className="text-xs text-muted-foreground/60 mt-0.5">{subValue}</p>}
          </div>
        </div>
      {trend && (
        <span className="flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </span>
      )}
      </div>
    </motion.div>
  );
};

// Tier badge component
const TierBadge = ({ tier }: { tier: string }) => {
  const styles: Record<string, string> = {
    governance: "bg-gradient-to-r from-gold/20 to-gold/10 text-gold border-gold/30",
    sovereign: "bg-gradient-to-r from-accent/20 to-accent/10 text-accent border-accent/30",
    operator: "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30",
  };
  
  const icons: Record<string, any> = {
    governance: Crown,
    sovereign: Crown,
    operator: Rocket,
  };
  
  const Icon = icons[tier] || Rocket;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${styles[tier] || styles.operator}`}>
      <Icon className="w-3 h-3" />
      {tier}
    </span>
  );
};

// Email status badge
const EmailStatusBadge = ({ sent, step }: { sent: boolean | null; step: number | null }) => {
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
        <CheckCircle className="w-3 h-3" />
        Email Sent {step && step > 1 ? `(Step ${step})` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
};

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [donorEntries, setDonorEntries] = useState<DonorEntry[]>([]);
  const [filteredWaitlist, setFilteredWaitlist] = useState<WaitlistEntry[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<DonorEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterInterest, setFilterInterest] = useState<string>("all");
  const [adminEmail, setAdminEmail] = useState("");
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [selectedDonorForEmail, setSelectedDonorForEmail] = useState<{
    id: string;
    name: string;
    email: string;
    tier: string;
    backerNumber: number;
  } | null>(null);
  const [sendingSingleEmail, setSendingSingleEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase.functions.invoke("check-admin", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!error && data?.isAdmin) {
          setIsAuthenticated(true);
          setAdminEmail(data.email || "");
          await fetchData(session.access_token);
        }
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.session) {
        const { data: adminData, error: adminError } = await supabase.functions.invoke("check-admin", {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });

        if (adminError || !adminData?.isAdmin) {
          await supabase.auth.signOut();
          throw new Error("You don't have admin access");
        }

        setIsAuthenticated(true);
        setAdminEmail(adminData.email || "");
        await fetchData(data.session.access_token);
        toast({ title: "Welcome back!", description: "Successfully signed in to admin dashboard." });
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setWaitlistEntries([]);
    setDonorEntries([]);
    setAdminEmail("");
    toast({ title: "Signed out", description: "You've been logged out successfully." });
  };

  const fetchData = async (token: string) => {
    try {
      const { data: waitlistData, error: waitlistError } = await supabase.functions.invoke("get-waitlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!waitlistError && waitlistData?.data) {
        setWaitlistEntries(waitlistData.data);
        setFilteredWaitlist(waitlistData.data);
      }

      const { data: donorsData, error: donorsError } = await supabase.functions.invoke("get-donors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!donorsError && donorsData?.data) {
        setDonorEntries(donorsData.data);
        setFilteredDonors(donorsData.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const triggerWelcomeEmails = async () => {
    setSendingEmails(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("send-backer-welcome", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      toast({
        title: "Emails Sent! 🎉",
        description: data.results?.length 
          ? `Successfully sent ${data.results.filter((r: any) => r.status === "sent").length} welcome emails.`
          : "No pending emails to send.",
      });

      // Refresh data
      await fetchData(session.access_token);
    } catch (err: any) {
      console.error("Email error:", err);
      toast({
        title: "Email Failed",
        description: err.message || "Failed to send welcome emails.",
        variant: "destructive",
      });
    } finally {
      setSendingEmails(false);
    }
  };

  const refreshData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchData(session.access_token);
      toast({ title: "Data Refreshed", description: "Latest data loaded." });
    }
  };

  useEffect(() => {
    let filtered = waitlistEntries;

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.interest?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterInterest !== "all") {
      filtered = filtered.filter((entry) => entry.interest === filterInterest);
    }

    setFilteredWaitlist(filtered);

    let filteredDonorsList = donorEntries;
    if (searchQuery) {
      filteredDonorsList = filteredDonorsList.filter(
        (entry) =>
          entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredDonors(filteredDonorsList);
  }, [searchQuery, filterInterest, waitlistEntries, donorEntries]);

  const exportToCSV = (type: "waitlist" | "donors") => {
    const data = type === "waitlist" ? filteredWaitlist : filteredDonors;
    const headers = type === "waitlist" 
      ? ["Email", "Name", "Interest", "Source", "Category", "Date"]
      : ["Email", "Name", "Tier", "Amount", "Email Sent", "Date"];
    
    const rows = data.map((entry: any) => 
      type === "waitlist"
        ? [entry.email, entry.name || "", entry.interest || "general", entry.source || "", entry.category || "", new Date(entry.created_at).toLocaleString()]
        : [entry.email, entry.name, entry.tier, `$${entry.amount}`, entry.welcome_email_sent ? "Yes" : "No", new Date(entry.created_at).toLocaleString()]
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row: string[]) => row.join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `sita_${type}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Complete", description: `${type} data exported to CSV.` });
  };

  const openEmailPreview = (donor: DonorEntry, index: number) => {
    setSelectedDonorForEmail({
      id: donor.id,
      name: donor.name,
      email: donor.email,
      tier: donor.tier,
      backerNumber: index + 1,
    });
    setEmailPreviewOpen(true);
  };

  const sendSingleEmail = async (recipient: { email: string; name: string; tier: string }) => {
    if (!selectedDonorForEmail) return;
    
    setSendingSingleEmail(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("send-single-email", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          email: recipient.email,
          name: recipient.name,
          tier: recipient.tier,
          donorId: selectedDonorForEmail.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Sent! 🎉",
        description: `Welcome email sent to ${recipient.name}.`,
      });

      setEmailPreviewOpen(false);
      setSelectedDonorForEmail(null);

      // Refresh data
      await fetchData(session.access_token);
    } catch (err: any) {
      console.error("Send email error:", err);
      toast({
        title: "Email Failed",
        description: err.message || "Failed to send email. Make sure RESEND_API_KEY is configured.",
        variant: "destructive",
      });
    } finally {
      setSendingSingleEmail(false);
    }
  };

  const uniqueInterests = [...new Set(waitlistEntries.map((e) => e.interest).filter(Boolean))];

  // Calculate stats
  const totalDonations = donorEntries.reduce((sum, d) => sum + d.amount, 0);
  const investorCount = waitlistEntries.filter((e) => e.category === "investor").length;
  const pendingEmails = donorEntries.filter((d) => !d.welcome_email_sent).length;
  const tierBreakdown = {
    governance: donorEntries.filter((d) => d.tier === "governance").length,
    sovereign: donorEntries.filter((d) => d.tier === "sovereign").length,
    operator: donorEntries.filter((d) => d.tier === "operator").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px]" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-50" />
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4 ring-1 ring-primary/20">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Sign in to manage your SITA community
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm bg-destructive/10 px-4 py-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}
              
              <button
                type="submit"
                disabled={authLoading}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-foreground">SITA Command Center</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">Admin</span>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {adminEmail}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.header>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={Users}
              value={waitlistEntries.length}
              label="Total Waitlist"
              subValue={`${investorCount} investors`}
              variant="primary"
            />
            <StatCard
              icon={UserCheck}
              value={donorEntries.length}
              label="Founding Backers"
              subValue={`${tierBreakdown.governance}G / ${tierBreakdown.sovereign}S / ${tierBreakdown.operator}O`}
              variant="accent"
            />
            <StatCard
              icon={DollarSign}
              value={`$${totalDonations.toLocaleString()}`}
              label="Total Raised"
              trend={totalDonations > 0 ? "+$" + totalDonations.toLocaleString() : undefined}
              variant="gold"
            />
            <StatCard
              icon={Mail}
              value={pendingEmails}
              label="Pending Emails"
              variant="primary"
            />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <button
              onClick={triggerWelcomeEmails}
              disabled={sendingEmails || pendingEmails === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {sendingEmails ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Welcome Emails {pendingEmails > 0 && `(${pendingEmails})`}
            </button>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="mb-6 bg-secondary/50 p-1 rounded-xl flex-wrap">
              <TabsTrigger value="contacts" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <Contact className="w-4 h-4" />
                Contacts
              </TabsTrigger>
              <TabsTrigger value="companies" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <Building2 className="w-4 h-4" />
                Companies
              </TabsTrigger>
              <TabsTrigger value="deals" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <Target className="w-4 h-4" />
                Deals
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <ListTodo className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="donations" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <Heart className="w-4 h-4" />
                Donations
              </TabsTrigger>
              <TabsTrigger value="tiers" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <DollarSign className="w-4 h-4" />
                Tiers
              </TabsTrigger>
              <TabsTrigger value="funding-rounds" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <TrendingUp className="w-4 h-4" />
                Funding
              </TabsTrigger>
              <TabsTrigger value="donors" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <Crown className="w-4 h-4" />
                Backers ({donorEntries.length})
              </TabsTrigger>
              <TabsTrigger value="waitlist" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <Users className="w-4 h-4" />
                Waitlist ({waitlistEntries.length})
              </TabsTrigger>
              <TabsTrigger value="workflows" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <Workflow className="w-4 h-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <FileText className="w-4 h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="broadcasts" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <Radio className="w-4 h-4" />
                Broadcasts
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 rounded-lg data-[state=active]:bg-card">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Search & Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 mb-6"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email or name..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <select
                value={filterInterest}
                onChange={(e) => setFilterInterest(e.target.value)}
                className="px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary/50 outline-none transition-all text-foreground min-w-[150px]"
              >
                <option value="all">All Interests</option>
                <option value="general">General</option>
                {uniqueInterests.map((interest) => (
                  <option key={interest} value={interest || ""}>
                    {interest}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* CRM Tabs */}
            <TabsContent value="contacts"><ContactsTab /></TabsContent>
            <TabsContent value="companies"><CompaniesTab /></TabsContent>
            <TabsContent value="deals"><DealsTab /></TabsContent>
            <TabsContent value="tasks"><TasksTab /></TabsContent>

            <TabsContent value="donations"><DonationsTab /></TabsContent>
            <TabsContent value="tiers"><TierManagementTab /></TabsContent>
            <TabsContent value="funding-rounds"><FundingRoundsTab /></TabsContent>

            {/* Donors Tab */}
            <TabsContent value="donors">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => exportToCSV("donors")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/30">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Backer</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tier</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredDonors.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-16 text-center">
                              <Crown className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                              <p className="text-muted-foreground">No backers yet</p>
                              <p className="text-muted-foreground/60 text-sm">They'll appear here once they sign up</p>
                            </td>
                          </tr>
                        ) : (
                          filteredDonors.map((entry, index) => (
                            <motion.tr
                              key={entry.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.02 }}
                              className="border-b border-border/30 hover:bg-secondary/30 transition-colors group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-accent/20 flex items-center justify-center ring-1 ring-gold/20 text-gold font-bold text-sm">
                                    {entry.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-foreground font-medium block">{entry.name}</span>
                                    <span className="text-muted-foreground text-sm">{entry.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <TierBadge tier={entry.tier} />
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-foreground font-bold text-lg">${entry.amount.toLocaleString()}</span>
                              </td>
                              <td className="px-6 py-4">
                                <EmailStatusBadge sent={entry.welcome_email_sent} step={entry.email_sequence_step} />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(entry.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => openEmailPreview(entry, index)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Preview Email
                                </button>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </TabsContent>

            {/* Waitlist Tab */}
            <TabsContent value="waitlist">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => exportToCSV("waitlist")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/30">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interest</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredWaitlist.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-16 text-center">
                              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                              <p className="text-muted-foreground">No entries found</p>
                            </td>
                          </tr>
                        ) : (
                          filteredWaitlist.map((entry, index) => (
                            <motion.tr
                              key={entry.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.02 }}
                              className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                    <Mail className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <span className="text-foreground font-medium block">{entry.email}</span>
                                    {entry.name && <span className="text-muted-foreground text-sm">{entry.name}</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                                  {entry.interest || "general"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                  entry.category === "investor" 
                                    ? "bg-gold/10 text-gold border-gold/20" 
                                    : entry.category === "backer"
                                      ? "bg-primary/10 text-primary border-primary/20"
                                      : "bg-muted text-muted-foreground border-border"
                                }`}>
                                  {entry.category || "waitlist"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground text-sm">
                                {entry.source || "direct"}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(entry.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </TabsContent>

            {/* Workflows Tab */}
            <TabsContent value="workflows">
              <WorkflowsTab />
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates">
              <TemplatesTab />
            </TabsContent>

            {/* Broadcasts Tab */}
            <TabsContent value="broadcasts">
              <BroadcastsTab />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-8">
                <CRMAnalyticsTab />
                <EmailAnalyticsTab />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={emailPreviewOpen}
        onClose={() => {
          setEmailPreviewOpen(false);
          setSelectedDonorForEmail(null);
        }}
        recipient={selectedDonorForEmail || undefined}
        onSend={sendSingleEmail}
        isSending={sendingSingleEmail}
      />
    </div>
  );
};

export default Dashboard;
