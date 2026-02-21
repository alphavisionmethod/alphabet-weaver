import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Lock, Mail, ArrowRight } from "lucide-react";
import sitaLogo from "@/assets/sita-logo.jpeg";

const FooterSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer ref={ref} className="relative py-16 px-6 md:px-8 border-t border-border">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8"
        >
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src={sitaLogo} alt="SITA OS" className="w-10 h-10 rounded-lg" />
              <div>
                <span className="font-bold text-foreground">SITA OS</span>
                <p className="text-xs text-muted-foreground">Governed Execution OS</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Nothing acts without permission. Every action leaves a receipt.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-foreground mb-1">Links</span>
            <Link to="/fund" className="text-muted-foreground hover:text-foreground transition-colors">Fund Our Project</Link>
            <Link to="/sandbox" className="text-muted-foreground hover:text-foreground transition-colors">Live Demo</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-semibold text-foreground mb-1">Connect</span>
            <a href="mailto:founders@sitaos.com" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" /> founders@sitaos.com
            </a>
            <div className="flex items-center gap-3 mt-2">
              <a href="https://x.com/sitaos" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors" aria-label="X / Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com/company/sitaos" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SITA OS. All rights reserved.</p>
          <Link 
            to="/admin/login" 
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors opacity-30 hover:opacity-60"
            aria-label="Admin access"
          >
            <Lock className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
