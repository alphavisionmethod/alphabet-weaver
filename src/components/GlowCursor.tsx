import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailParticle {
  id: number;
  x: number;
  y: number;
}

const GlowCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailParticle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let particleId = 0;
    let lastTime = 0;
    const minInterval = 50; // Minimum ms between particles

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Only add particles at intervals to avoid too many
      if (now - lastTime > minInterval) {
        lastTime = now;
        const newParticle: TrailParticle = {
          id: particleId++,
          x: e.clientX,
          y: e.clientY,
        };

        setTrail((prev) => [...prev.slice(-15), newParticle]);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Clean up old particles
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail((prev) => prev.slice(-10));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Main cursor glow */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-screen"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 500 }}
      >
        <div
          className="w-8 h-8 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(38 95% 54% / 0.4), transparent)",
            boxShadow: "0 0 20px hsl(38 95% 54% / 0.3)",
          }}
        />
      </motion.div>

      {/* Trail particles */}
      <AnimatePresence>
        {trail.map((particle, index) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 0, scale: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed pointer-events-none z-[9998] mix-blend-screen"
            style={{
              left: particle.x - 4,
              top: particle.y - 4,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(38 95% 60% / ${0.3 - index * 0.02}), transparent)`,
                boxShadow: `0 0 10px hsl(38 95% 60% / ${0.2 - index * 0.01})`,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
};

export default GlowCursor;
