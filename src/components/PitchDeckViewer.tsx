import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "pitch-decks";
const FILE_NAME = "pitch-deck.pdf";

const PitchDeckViewer = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkForPdf = async () => {
      const { data } = await supabase.storage.from(BUCKET).list("", { limit: 1, search: FILE_NAME });
      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(FILE_NAME);
        if (urlData?.publicUrl) {
          setPdfUrl(urlData.publicUrl);
        }
      }
      setLoading(false);
    };
    checkForPdf();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl mb-20 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "64px 32px" }}>
        <p className="text-white/30 text-sm">Loading...</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl mb-20 flex flex-col items-center justify-center text-center"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "64px 32px" }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "hsl(270 91% 55% / 0.12)" }}>
          <FileText className="w-7 h-7" style={{ color: "hsl(270 91% 55%)" }} />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Pitch Deck</h3>
        <p className="text-white/40 text-sm max-w-sm">Pitch deck PDF coming soon. Check back or talk to the founders for early access</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-20"
    >
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" style={{ color: "hsl(270 91% 55%)" }} />
            <h3 className="text-white font-semibold">Pitch Deck</h3>
          </div>
          <div className="flex items-center gap-2">
            <a href={pdfUrl} download className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.06)" }}>
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </a>
          </div>
        </div>
        <iframe
          src={`${pdfUrl}#toolbar=0`}
          className="w-full"
          style={{ height: "70vh", border: "none" }}
          title="Pitch Deck PDF"
        />
      </div>
    </motion.div>
  );
};

export default PitchDeckViewer;
