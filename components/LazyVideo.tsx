'use client';

import { useEffect, useRef } from 'react';

/**
 * Muted background video that starts loading only when it nears the viewport
 * and pauses when it leaves. A plain `autoPlay` video downloads at page load
 * even when it sits far below the fold; these are 5-25 MB each.
 *
 * Pass the usual <video> props; `autoPlay` is handled here.
 */
export default function LazyVideo({
  autoPlay: _autoPlay,
  preload: _preload,
  ...props
}: React.VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return <video ref={ref} preload="none" muted playsInline {...props} />;
}
