import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sitaLogo from "@/assets/sita-logo.jpeg";

const SplashLoader = ({ children }: { children: React.ReactNode }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          >
            <motion.img
              src={sitaLogo}
              alt="SITA OS"
              className="w-16 h-16 rounded-2xl"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

export default SplashLoader;
