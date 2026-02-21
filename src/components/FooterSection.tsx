import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
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
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Logo and tagline */}
          <div className="flex items-center gap-4">
            <img 
              src={sitaLogo} 
              alt="SITA OS" 
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <span className="font-bold text-foreground">SITA OS</span>
              <p className="text-xs text-muted-foreground">Governed Execution OS</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} SITA OS. All rights reserved.
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link 
              to="/admin/login" 
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors opacity-30 hover:opacity-60"
              aria-label="Admin access"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterSection;
