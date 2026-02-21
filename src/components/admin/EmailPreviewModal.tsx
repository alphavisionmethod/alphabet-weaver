import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Eye, Mail, Crown, Rocket, Users } from "lucide-react";
import { useState } from "react";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient?: {
    name: string;
    email: string;
    tier: string;
    backerNumber: number;
  };
  onSend: (recipient: { email: string; name: string; tier: string }) => void;
  isSending?: boolean;
}

// Tier colors and benefits matching the edge function
const tierConfig: Record<string, { color: string; gradient: string; icon: any; benefits: string[] }> = {
  operator: {
    color: "#9b87f5",
    gradient: "from-primary/80 to-primary/40",
    icon: Rocket,
    benefits: [
      "Early beta access to the platform",
      '"Founding Operator" badge on your profile',
      "Priority support queue",
      "Monthly product updates & roadmap previews",
    ],
  },
  sovereign: {
    color: "#d4af37",
    gradient: "from-accent to-gold",
    icon: Crown,
    benefits: [
      "Everything in Operator tier",
      "Lifetime Policy-Gate priority",
      "Private Discord access",
      "Direct line to the dev team",
      "Custom autonomy presets",
    ],
  },
  governance: {
    color: "#d4af37",
    gradient: "from-gold via-accent to-primary",
    icon: Users,
    benefits: [
      "Everything in Sovereign tier",
      "Your name engraved in the Genesis Receipt",
      "1-on-1 founder setup session",
      "Quarterly strategy calls",
      "Shape the product roadmap",
      "Lifetime founding status",
    ],
  },
};

const EmailPreviewModal = ({ isOpen, onClose, recipient, onSend, isSending }: EmailPreviewModalProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "html">("preview");
  
  if (!recipient) return null;
  
  const config = tierConfig[recipient.tier] || tierConfig.operator;
  const TierIcon = config.icon;
  const tierName = recipient.tier.charAt(0).toUpperCase() + recipient.tier.slice(1);
  const firstName = recipient.name.split(" ")[0];
  const backerNumberFormatted = String(recipient.backerNumber).padStart(4, "0");
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                  <Mail className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Email Preview</h2>
                  <p className="text-sm text-muted-foreground">
                    Welcome email for {recipient.name} ({recipient.email})
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 p-4 border-b border-border bg-secondary/30">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "preview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Eye className="w-4 h-4" />
                Visual Preview
              </button>
              <button
                onClick={() => setActiveTab("html")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "html"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {"</>"}
                Raw HTML
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "preview" ? (
                <div className="bg-[#050505] rounded-xl p-8 border border-border">
                  {/* Email Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">SITA</h1>
                    <p className="text-xs tracking-widest uppercase mt-2" style={{ color: config.color }}>
                      Sovereign Intelligent Task Agent
                    </p>
                  </div>

                  {/* Welcome Message */}
                  <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-border/30 rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Welcome to the Governance Revolution, {firstName}! 🎉
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      You've officially joined an elite group of visionaries backing the future of AI-powered autonomy. 
                      As <strong style={{ color: config.color }}>{tierName} Backer #{backerNumberFormatted}</strong>, 
                      you're not just an early adopter—you're a founding architect.
                    </p>

                    {/* Benefits Box */}
                    <div className="bg-[#0a0a0a] border rounded-xl p-6 mb-6" style={{ borderColor: `${config.color}40` }}>
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: config.color }}>
                        Your {tierName} Benefits
                      </h3>
                      <ul className="space-y-3">
                        {config.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                            <span style={{ color: config.color }}>✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Next Steps */}
                    <h3 className="text-lg font-bold text-white mb-4">What Happens Next?</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                      <li>You'll receive payment instructions within 24 hours</li>
                      <li>Once confirmed, your Founding Member status is permanently locked in</li>
                      <li>Beta access invites will be sent in the order backers joined</li>
                      {recipient.tier === "governance" && (
                        <li>We'll reach out to schedule your 1-on-1 founder session</li>
                      )}
                    </ol>
                  </div>

                  {/* Certificate Preview */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white text-center mb-4">Your Founding Member Certificate</h3>
                    <div 
                      className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-2xl p-8 text-center"
                      style={{ border: `2px solid ${config.color}` }}
                    >
                      <div className="border-b pb-4 mb-6" style={{ borderColor: `${config.color}40` }}>
                        <h4 className="text-xs tracking-widest uppercase" style={{ color: config.color }}>
                          Certificate of Founding Membership
                        </h4>
                      </div>
                      
                      <p className="text-muted-foreground text-sm">This certifies that</p>
                      <h2 className="text-2xl font-bold text-white my-4">{recipient.name}</h2>
                      <p className="text-muted-foreground text-sm">is a verified</p>
                      
                      <div 
                        className="inline-block px-8 py-3 rounded-lg my-4"
                        style={{ background: `linear-gradient(90deg, ${config.color}20, ${config.color}40, ${config.color}20)` }}
                      >
                        <h3 className="text-xl font-bold uppercase tracking-wider" style={{ color: config.color }}>
                          {tierName} Backer
                        </h3>
                      </div>
                      
                      <p className="text-muted-foreground/60 text-xs">
                        Founding Member #{backerNumberFormatted}
                      </p>
                      
                      <div className="border-t pt-4 mt-6" style={{ borderColor: `${config.color}40` }}>
                        <p className="text-muted-foreground/60 text-xs">Issued on {date}</p>
                        <p className="text-sm italic mt-2" style={{ color: config.color }}>
                          SITA – Sovereign Intelligent Task Agent
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center border-t border-border/30 pt-6">
                    <p className="text-muted-foreground/60 text-xs">
                      Questions? Reply to this email or reach us at hello@sita.ai
                    </p>
                    <p className="text-muted-foreground/40 text-xs mt-4">
                      © {new Date().getFullYear()} SITA. All rights reserved.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-border overflow-x-auto">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
{`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <h1 style="color: #fff; font-size: 28px; margin: 0;">SITA</h1>
              <p style="color: ${config.color}; font-size: 12px; letter-spacing: 2px; margin: 8px 0 0; text-transform: uppercase;">Sovereign Intelligent Task Agent</p>
            </td>
          </tr>
          
          <!-- Welcome Message -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #111 100%); border: 1px solid #222; border-radius: 16px; padding: 40px;">
              <h2 style="color: #fff; font-size: 24px; margin: 0 0 16px;">Welcome to the Governance Revolution, ${firstName}! 🎉</h2>
              <p style="color: #aaa; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                You've officially joined an elite group of visionaries backing the future of AI-powered autonomy. 
                As <strong style="color: ${config.color};">${tierName} Backer #${backerNumberFormatted}</strong>, 
                you're not just an early adopter—you're a founding architect.
              </p>
              ...
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-secondary/30">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Subject:</span> 🎉 Welcome to SITA, Founding {tierName} #{backerNumberFormatted}!
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSend({ email: recipient.email, name: recipient.name, tier: recipient.tier })}
                  disabled={isSending}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailPreviewModal;
