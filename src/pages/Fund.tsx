import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Rocket, Crown, Gift, Star, Zap, Shield, Award, X, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const donationSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Please enter a valid email").max(255),
  amount: z.number().min(1, "Amount must be at least $1"),
  message: z.string().trim().max(500).optional(),
});

const ICON_MAP: Record<string, any> = {
  Heart, Rocket, Crown, Gift, Star, Zap, Shield, Award,
};

interface DonationTier {
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
}

const FALLBACK_TIERS: DonationTier[] = [
  {
    id: "fallback-1",
    tier_id: "supporter",
    name: "Supporter",
    amount: 25,
    description: "Back the mission and join the community",
    icon: "Heart",
    color: "#8B5CF6",
    perks: ["Name on supporters wall", "Early access updates", "Community badge"],
    is_open: false,
    popular: false,
    image_url: null,
    stripe_price_id: null,
    display_order: 1,
  },
  {
    id: "fallback-2",
    tier_id: "builder",
    name: "Builder",
    amount: 100,
    description: "Help shape the product roadmap",
    icon: "Rocket",
    color: "#D97706",
    perks: ["Everything in Supporter", "Priority feature requests", "Monthly founder updates", "Beta access"],
    is_open: false,
    popular: true,
    image_url: null,
    stripe_price_id: null,
    display_order: 2,
  },
  {
    id: "fallback-3",
    tier_id: "visionary",
    name: "Visionary",
    amount: 500,
    description: "Become a strategic partner in our journey",
    icon: "Crown",
    color: "#059669",
    perks: ["Everything in Builder", "1-on-1 strategy call", "Advisory board nomination", "Custom integration support"],
    is_open: false,
    popular: false,
    image_url: null,
    stripe_price_id: null,
    display_order: 3,
  },
];

const Fund = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tiers, setTiers] = useState<DonationTier[]>(FALLBACK_TIERS);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", amount: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeTier = tiers.find((t) => t.tier_id === selectedTier);

  // Fetch tiers from database, fall back to hardcoded
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data, error } = await supabase
          .from("donation_tiers")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0) {
          setTiers(data as unknown as DonationTier[]);
        }
      } catch {
        // Use fallback tiers
      }
      setLoadingTiers(false);
    };
    fetchTiers();
  }, []);

  // Handle Stripe success redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setSubmitted(true);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    const amount = activeTier?.is_open ? parseFloat(formData.amount) : activeTier?.amount || 0;
    const result = donationSchema.safeParse({
      name: formData.name || undefined,
      email: formData.email,
      amount,
      message: formData.message || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await supabase.from("donations").insert({
        name: formData.name || null,
        email: formData.email,
        amount,
        tier: selectedTier,
        message: formData.message || null,
      });

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          tier: selectedTier,
          amount,
          email: formData.email,
          name: formData.name,
          message: formData.message,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0B0812" }}>
      {/* Radial glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px]" style={{ background: "radial-gradient(ellipse, hsl(270 60% 40% / 0.08), transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px]" style={{ background: "radial-gradient(ellipse, hsl(38 95% 54% / 0.06), transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4" style={{ background: "hsl(38 95% 54% / 0.1)", color: "hsl(38 95% 54%)", border: "1px solid hsl(38 95% 54% / 0.2)" }}>
            FUND THE FUTURE
          </span>
          <h1 className="font-bold text-white mb-5" style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.1 }}>
            Help us build{" "}
            <span style={{ background: "linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              what's next
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-white/50" style={{ fontSize: 16 }}>
            Every contribution fuels the mission. Choose a tier or donate freely
          </p>
        </motion.div>

        {/* Tier Cards */}
        {loadingTiers ? (
          <div className="text-center py-20 text-white/40">Loading tiers...</div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${tiers.length >= 4 ? "lg:grid-cols-4" : tiers.length === 3 ? "lg:grid-cols-3" : ""} gap-5 mb-16`}>
            {tiers.map((tier, i) => {
              const Icon = ICON_MAP[tier.icon] || Heart;
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  onClick={() => {
                    setSelectedTier(tier.tier_id);
                    setSubmitted(false);
                    setErrors({});
                    setFormData({ name: "", email: "", amount: tier.is_open ? "" : String(tier.amount), message: "" });
                  }}
                  className="relative rounded-2xl cursor-pointer transition-all duration-300 flex flex-col group"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: selectedTier === tier.tier_id ? `1px solid ${tier.color}` : "1px solid rgba(255,255,255,0.08)",
                    padding: "28px 24px",
                    boxShadow: selectedTier === tier.tier_id ? `0 0 30px ${tier.color}33` : "none",
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 rounded-t-2xl" style={{ height: 2, background: `linear-gradient(90deg, ${tier.color}, hsl(38 95% 54%))` }} />
                  {tier.popular && (
                    <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase" style={{ background: "linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))", color: "#fff" }}>
                      POPULAR
                    </span>
                  )}
                  {tier.image_url && (
                    <img src={tier.image_url} alt={tier.name} className="w-full h-32 object-cover rounded-xl mb-4" />
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${tier.color}22` }}>
                    <Icon className="w-5 h-5" style={{ color: tier.color }} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">{tier.name}</h3>
                  {!tier.is_open && <p className="text-2xl font-bold text-white mb-2">${tier.amount}</p>}
                  <p className="text-white/50 text-sm mb-5">{tier.description}</p>
                  <ul className="space-y-2 flex-1 mb-6">
                    {tier.perks.map((perk, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: tier.color }} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <div className="py-2.5 rounded-xl text-center text-sm font-semibold transition-all" style={{ background: selectedTier === tier.tier_id ? tier.color : "transparent", border: selectedTier === tier.tier_id ? "none" : "1px solid rgba(255,255,255,0.15)", color: "#fff" }}>
                    {selectedTier === tier.tier_id ? "Selected" : "Select"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Donation Form Modal */}
        <AnimatePresence>
          {selectedTier && !submitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-md mx-auto rounded-2xl relative"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "32px" }}
            >
              <button onClick={() => setSelectedTier(null)} className="absolute top-4 right-4 text-white/40 hover:text-white/80"><X className="w-4 h-4" /></button>
              <h3 className="text-white font-semibold text-lg mb-1">Complete your {activeTier?.name} contribution</h3>
              <p className="text-white/40 text-sm mb-6">{activeTier?.is_open ? "Enter any amount" : `$${activeTier?.amount}`}</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Name (optional)</label>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Email *</label>
                  <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none" style={{ background: "rgba(255,255,255,0.06)", border: errors.email ? "1px solid hsl(0 70% 50%)" : "1px solid rgba(255,255,255,0.1)" }} placeholder="you@example.com" />
                  {errors.email && <p className="text-xs mt-1" style={{ color: "hsl(0 70% 50%)" }}>{errors.email}</p>}
                </div>
                {activeTier?.is_open && (
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Amount ($) *</label>
                    <input type="number" min="1" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none" style={{ background: "rgba(255,255,255,0.06)", border: errors.amount ? "1px solid hsl(0 70% 50%)" : "1px solid rgba(255,255,255,0.1)" }} placeholder="50" />
                    {errors.amount && <p className="text-xs mt-1" style={{ color: "hsl(0 70% 50%)" }}>{errors.amount}</p>}
                  </div>
                )}
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Message (optional)</label>
                  <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} placeholder="A message for the team..." />
                </div>
                {errors.form && <p className="text-xs" style={{ color: "hsl(0 70% 50%)" }}>{errors.form}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))" }}
                >
                  {isSubmitting ? "Redirecting to checkout..." : `Pay ${activeTier?.is_open ? (formData.amount ? `$${formData.amount}` : "") : `$${activeTier?.amount}`} with Stripe`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "48px 32px" }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "hsl(270 91% 55% / 0.15)" }}>
                <Heart className="w-7 h-7" style={{ color: "hsl(270 91% 55%)" }} />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Thank you for your support</h3>
              <p className="text-white/50 text-sm mb-6">Your contribution has been recorded. We'll be in touch soon</p>
              <button onClick={() => { setSelectedTier(null); setSubmitted(false); }} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                Make another contribution
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Fund;
