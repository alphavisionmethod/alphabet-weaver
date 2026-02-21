import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SovereignBackerSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section
      id="request-access"
      ref={ref}
      className="relative overflow-hidden"
      style={{ background: "#0B0812", paddingTop: 128, paddingBottom: 128 }}
    >
      {/* Top divider */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "60%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)",
        }}
      />

      {/* Subtle radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, hsl(270 60% 40% / 0.06), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto px-6" style={{ maxWidth: 1040 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 mb-4">
            FINAL STEP
          </span>
          <h2
            className="font-semibold text-white mb-5"
            style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.15 }}
          >
            Request access
          </h2>
          <p
            className="max-w-xl mx-auto"
            style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)" }}
          >
            Choose beta or partner access. Every request is reviewed. Invite-only.
          </p>
        </motion.div>

        {/* Two mini cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto"
          style={{ maxWidth: 800, marginTop: 48 }}
        >
          {/* Beta card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "36px 32px",
            }}
          >
            {/* Gradient top border */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: 2,
                background:
                  "linear-gradient(90deg, hsl(270 91% 55%), hsl(38 95% 54%))",
              }}
            />
            <h3
              className="font-semibold text-white mb-2"
              style={{ fontSize: "19px" }}
            >
              Founding Members (Beta)
            </h3>
            <p
              className="mb-5"
              style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}
            >
              Be among the first to run SITA — and shape what ships.
            </p>

            {/* Bullets */}
            <ul className="space-y-2.5 mb-8 flex-1" style={{ paddingLeft: 0, listStyle: "none" }}>
              {[
                "Private beta access (rolling cohorts)",
                "Founder-led onboarding + direct feedback",
                "Early pricing locked when plans launch",
              ].map((bullet, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                  style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.3)" }}
                  />
                  {bullet}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/fund")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all"
              style={{
                fontSize: "14px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                e.currentTarget.style.boxShadow = "0 0 20px hsl(270 91% 55% / 0.15), 0 0 30px hsl(38 95% 54% / 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Fund Our Project
              <ArrowRight className="w-4 h-4" />
            </button>
            {/* Invisible spacer to match right card height */}
            <p className="text-center mt-3" style={{ fontSize: "12px", color: "transparent" }} aria-hidden="true">&nbsp;</p>
          </motion.div>

          {/* Partners card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="relative rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "36px 32px",
            }}
          >
            {/* Gradient top border */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: 2,
                background:
                  "linear-gradient(90deg, hsl(270 91% 55%), hsl(38 95% 54%))",
              }}
            />
            <h3
              className="font-semibold text-white mb-2"
              style={{ fontSize: "19px" }}
            >
              Partners (Capital + Strategic)
            </h3>
            <p
              className="mb-5"
              style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}
            >
              Fund the build. Shape the roadmap. Founder access.
            </p>

            {/* Bullets */}
            <ul className="space-y-2.5 mb-8 flex-1" style={{ paddingLeft: 0, listStyle: "none" }}>
              {[
                "Monthly demos + build updates",
                "Direct line to founders + priority requests",
                "Early access to roadmap + governance model",
              ].map((bullet, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                  style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.3)" }}
                  />
                  {bullet}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/pitch")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{
                fontSize: "14px",
                background:
                  "linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))",
                border: "none",
                color: "#fff",
              }}
            >
              Talk to the founders
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/investor")}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all"
              style={{
                fontSize: "13px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              See Investor Demo
            </button>
            <p
              className="text-center mt-3"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}
            >
              For angels & strategic partners
            </p>
            <p
              className="text-center mt-1"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}
            >
              Conversations open
            </p>
          </motion.div>
        </div>

        {/* Microcopy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
          style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: 32 }}
        >
          No spam. Invite-only. Governance first.
        </motion.p>
      </div>
    </section>
  );
};

export default SovereignBackerSection;
