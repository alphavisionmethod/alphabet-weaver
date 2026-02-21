import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  images?: { src: string; alt: string }[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

const ImageLightbox = ({ 
  isOpen, 
  onClose, 
  src, 
  alt, 
  images = [], 
  currentIndex = 0,
  onNavigate 
}: ImageLightboxProps) => {
  const [dragDirection, setDragDirection] = useState<number>(0);
  
  const hasMultipleImages = images.length > 1;
  const displaySrc = hasMultipleImages ? images[currentIndex]?.src : src;
  const displayAlt = hasMultipleImages ? images[currentIndex]?.alt : alt;

  const goToPrevious = useCallback(() => {
    if (hasMultipleImages && onNavigate) {
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      onNavigate(newIndex);
    }
  }, [currentIndex, hasMultipleImages, images.length, onNavigate]);

  const goToNext = useCallback(() => {
    if (hasMultipleImages && onNavigate) {
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      onNavigate(newIndex);
    }
  }, [currentIndex, hasMultipleImages, images.length, onNavigate]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      goToPrevious();
    } else if (info.offset.x < -threshold) {
      goToNext();
    }
    setDragDirection(0);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragDirection(info.offset.x);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>

          {/* Navigation arrows - desktop only */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-muted/50 hover:bg-muted transition-colors hidden sm:block"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-muted/50 hover:bg-muted transition-colors hidden sm:block"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </>
          )}

          {/* Image with swipe support */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: dragDirection * 0.3 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            drag={hasMultipleImages ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="relative z-10 max-w-5xl w-full max-h-[85vh] cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="glass-card p-2 sm:p-3 rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-glow-combined)" }}
            >
              <img
                src={displaySrc}
                alt={displayAlt}
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl select-none pointer-events-none"
                draggable={false}
              />
            </div>
            
            {/* Caption and indicators */}
            <div className="text-center mt-4">
              <p className="text-muted-foreground text-sm">
                {displayAlt}
              </p>
              
              {/* Dot indicators for multiple images */}
              {hasMultipleImages && (
                <div className="flex justify-center gap-2 mt-3">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? "bg-primary w-6" 
                          : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {/* Swipe hint on mobile */}
              {hasMultipleImages && (
                <p className="text-muted-foreground/60 text-xs mt-2 sm:hidden">
                  Swipe left or right to navigate
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;
