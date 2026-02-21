import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full glass-card flex items-center justify-center hover:border-primary/50 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Moon className="w-5 h-5 text-primary" />
        ) : (
          <Sun className="w-5 h-5 text-accent" />
        )}
      </motion.div>
      
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ${
        theme === "dark" ? "bg-primary/20" : "bg-accent/20"
      } opacity-0 group-hover:opacity-100`} />
    </motion.button>
  );
};

export default ThemeToggle;
