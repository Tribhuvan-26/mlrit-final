'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

type VideoLightboxProps = {
  open: boolean;
  onClose: () => void;
  src: string;
  poster?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
};

/**
 * Full-screen video modal — mastersunion.org-style. Click a trigger →
 * dark overlay fades in, video plays centered with rounded corners, and
 * the eyebrow / title / description sit beneath it. ESC and backdrop
 * click both close. Body scroll locks while open.
 */
export default function VideoLightbox({
  open,
  onClose,
  src,
  poster,
  title,
  eyebrow,
  description,
}: VideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Autoplay the video whenever we open the lightbox.
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      v?.pause();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[3000] bg-ink/95 backdrop-blur-md flex items-center justify-center px-4 md:px-10"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Video preview'}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl mx-auto flex flex-col"
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                {eyebrow && (
                  <div className="editorial-eyebrow !text-white/50 !text-[0.65rem]">
                    {eyebrow}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close video"
                className="inline-flex items-center gap-2 h-9 pl-4 pr-4 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 hover:text-white hover:bg-white/20 transition-all text-[0.82rem] font-medium tracking-[-0.005em]"
              >
                Close <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Video — shrinks to fit remaining height */}
            <div className="relative w-full rounded-[16px] md:rounded-[20px] overflow-hidden bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),0_12px_40px_-10px_rgba(232,93,4,0.14)] shrink min-h-0"
              style={{ aspectRatio: '16/9' }}
            >
              <video
                ref={videoRef}
                src={src}
                poster={poster}
                controls
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Title + CTA row below video */}
            <div className="mt-5 shrink-0 flex items-end justify-between gap-6">
              <div className="min-w-0">
                {title && (
                  <h3 className="font-display italic font-medium text-white leading-[1.12] tracking-[-0.02em] text-[clamp(1.1rem,2.2vw,1.6rem)]">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="mt-2 text-white/55 font-light leading-[1.6] text-[0.82rem] md:text-[0.88rem] max-w-[560px] line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
              <a
                href="/student-life/discover-mlr"
                onClick={onClose}
                className="shrink-0 inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-[0.82rem] font-medium tracking-[-0.01em] whitespace-nowrap group"
              >
                Campus Tour
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
