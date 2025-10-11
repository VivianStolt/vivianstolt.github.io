import React, { useRef, useEffect, useState } from 'react';

// VideoBackground plays a single mp4 and maps frame ranges to sections.
// It expects the video at src/assets/videos/0001-1199.mp4. It uses a <video>
// element as the source and programmatically seeks to times that correspond
// to requested frames. It listens to which section is active (via IntersectionObserver)
// and either plays a loop range or scrubs through a given range tied to scroll.

import videoFile from '../assets/videos/0001-1199.mp4';
const VIDEO_PATH = videoFile;

// Frame ranges (1-indexed frames as specified by the user)
const FRAME_RANGES = {
  opening: [1, 48],
  intro_loop: [49, 198],
  intro_scrub: [199, 249],
  about_loop: [250, 399],
  about_scrub: [400, 450],
  projects_loop: [451, 600],
  projects_scrub: [601, 649],
  posts_loop: [650, 799],
  posts_scrub: [800, 848],
  events_loop: [849, 998],
  events_scrub: [999, 1049],
  contact_loop: [1050, 1199],
};

function framesToTime(frame, fps) {
  return (frame - 1) / fps; // frame 1 -> time 0
}

export default function VideoBackground() {
  const videoRef = useRef(null);
  const [fps, setFps] = useState(30); // fallback fps until we can compute
  const [duration, setDuration] = useState(null);
  const observerRef = useRef(null);
  const activeSectionRef = useRef('intro');
  const loopRef = useRef(null); // { startT, endT, direction }
  const rafIdRef = useRef(null);
  const lastTimeRef = useRef(null);
  const targetTimeRef = useRef(null);
  const smoothingRafRef = useRef(null);
  const openingDoneRef = useRef(false);

  // Ping-pong loop using requestAnimationFrame. We control video.currentTime
  // directly (video should be paused) to avoid jumpy seeks at loop boundaries.
  const startPingPong = (startFrame, endFrame, fpsArg) => {
    const vid = videoRef.current;
    if (!vid) return;
    const useFps = fpsArg || fps;
    const startT = framesToTime(startFrame, useFps);
    const endT = framesToTime(endFrame, useFps);
    loopRef.current = { startT, endT, direction: 1 };
    // ensure video is paused; we'll drive currentTime manually
    try { vid.pause(); } catch (e) {}
    vid.currentTime = startT;
    lastTimeRef.current = performance.now();
    // accumulate elapsed time and advance by whole-frame durations to match video fps
    const frameDuration = 1 / Math.max(1, useFps);
    let elapsed = 0;

    const tick = (now) => {
      if (!loopRef.current) return;
      const lr = loopRef.current;
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      elapsed += delta;

      // advance by whole frames only
      if (elapsed >= frameDuration) {
        const framesToAdvance = Math.floor(elapsed / frameDuration);
        elapsed -= framesToAdvance * frameDuration;

        let t = vid.currentTime + lr.direction * framesToAdvance * frameDuration;

        // handle ping-pong boundaries; if overshoot, reflect the time and flip direction
        if (t > lr.endT) {
          // compute overshoot and reflect
          const overshoot = t - lr.endT;
          t = lr.endT - overshoot;
          lr.direction = -1;
        } else if (t < lr.startT) {
          const overshoot = lr.startT - t;
          t = lr.startT + overshoot;
          lr.direction = 1;
        }

        try { vid.currentTime = Math.max(lr.startT, Math.min(lr.endT, t)); } catch (e) {}
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    // start RAF loop
    rafIdRef.current = requestAnimationFrame(tick);
  };

  const stopPingPong = () => {
    loopRef.current = null;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => {
      // estimate fps from total frames (1199) and duration
      const estimatedFps = 1199 / vid.duration;
      if (Number.isFinite(estimatedFps) && estimatedFps > 1 && estimatedFps < 120) {
        setFps(estimatedFps);
      }
      setDuration(vid.duration);

      // Start by playing the opening animation frames 1-48 once,
      // then transition to the intro loop (49-198).
      const openStart = framesToTime(FRAME_RANGES.opening[0], estimatedFps || fps);
      const openEnd = framesToTime(FRAME_RANGES.opening[1], estimatedFps || fps);

      vid.currentTime = openStart;
      vid.play().catch(() => {});

      const onOpenTime = () => {
        // when we reach or pass opening end, move to intro loop
        if (vid.currentTime >= openEnd) {
          vid.removeEventListener('timeupdate', onOpenTime);
          // transition to intro loop via playLoopRange
          // use a small timeout to ensure browser processed the seek
          setTimeout(() => {
            // mark opening as done so observer-driven loops can start
            openingDoneRef.current = true;
            // play intro loop (as ping-pong) using the estimated fps
            startPingPong(FRAME_RANGES.intro_loop[0], FRAME_RANGES.intro_loop[1], estimatedFps);
          }, 20);
        }
      };

      vid.addEventListener('timeupdate', onOpenTime);
    };

    vid.addEventListener('loadedmetadata', onLoaded);

    return () => vid.removeEventListener('loadedmetadata', onLoaded);
  }, []);

  // IntersectionObserver to detect which section is active and whether it's in a loop or scrub area.
  useEffect(() => {
    const sections = document.querySelectorAll('[data-vs-section]');
    if (!sections || sections.length === 0) return;

    const vid = videoRef.current;
    if (!vid) return;

    // use startPingPong / stopPingPong defined in outer scope

    const onIntersect = (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const key = entry.target.getAttribute('data-vs-section');
        activeSectionRef.current = key;

  // If opening animation hasn't finished yet, ignore loop entries.
  if (!openingDoneRef.current) return;

  // Decide if this is a loop area or a scrub spacer area by data attribute
        const mode = entry.target.getAttribute('data-vs-mode') || 'loop';
        const ranges = JSON.parse(entry.target.getAttribute('data-vs-ranges'));

        if (mode === 'loop') {
          stopPingPong();
          startPingPong(ranges[0], ranges[1]);
        } else if (mode === 'scrub') {
          // When entering a scrub area, cancel loops and smoothing and snap to the
          // correct scrub position immediately (based on viewport center). This
          // avoids showing leftover frames from the previous loop when scrolling up.
          stopPingPong();
          // cancel smoothing if active
          if (smoothingRafRef.current) {
            cancelAnimationFrame(smoothingRafRef.current);
            smoothingRafRef.current = null;
          }
          targetTimeRef.current = null;

          // compute progress for this element relative to viewport center
          try {
            const rect = entry.target.getBoundingClientRect();
            const viewportY = window.innerHeight / 2;
            const progress = Math.min(1, Math.max(0, (viewportY - rect.top) / rect.height));
            const startF = ranges[0] || 0;
            const endF = ranges[1] || startF;
            const targetFrame = Math.round(startF + (endF - startF) * progress);
            const t = framesToTime(targetFrame, fps);
            try { vid.pause(); } catch (e) {}
            try { vid.currentTime = t; } catch (e) {}
          } catch (e) {
            // fallback: snap to scrub start
            try { vid.currentTime = framesToTime(ranges[0], fps); } catch (e) {}
            try { vid.pause(); } catch (e) {}
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(onIntersect, {
      root: null,
      threshold: 0.6,
    });

    sections.forEach((s) => observerRef.current.observe(s));

    // Scroll handler to scrub within a scrub section
    const lastScrollYRef = { current: window.scrollY };
    const onScroll = () => {
      const currentY = window.scrollY;
      const scrollingUp = currentY < lastScrollYRef.current;
      lastScrollYRef.current = currentY;
      // Find all scrub elements and pick the one overlapping viewport center
      const scrubs = Array.from(document.querySelectorAll('[data-vs-mode="scrub"]'));
      const viewportY = window.innerHeight / 2;
      for (const el of scrubs) {
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportY && rect.bottom > viewportY) {
          // We're inside a scrub element — stop any ping-pong loops so scrub takes over
          stopPingPong();
          try {
            const ranges = JSON.parse(el.getAttribute('data-vs-ranges') || '[]');
            const startF = ranges[0] || 0;
            const endF = ranges[1] || startF;
            const progress = Math.min(1, Math.max(0, (viewportY - rect.top) / rect.height));
            const targetFrame = Math.round(startF + (endF - startF) * progress);
            const t = framesToTime(targetFrame, fps);

            // If user is scrolling up, snap immediately to avoid flashes from previous loop.
            if (scrollingUp) {
              try { vid.pause(); } catch (e) {}
              try { vid.currentTime = t; } catch (e) {}
              targetTimeRef.current = null;
              if (smoothingRafRef.current) {
                cancelAnimationFrame(smoothingRafRef.current);
                smoothingRafRef.current = null;
              }
            } else {
              // smoothing: set target time and let RAF loop approach it
              targetTimeRef.current = t;
              try { vid.pause(); } catch (e) {}

              if (!smoothingRafRef.current) {
                const smoothTick = () => {
                  const target = targetTimeRef.current;
                  if (target == null) {
                    smoothingRafRef.current = null;
                    return;
                  }
                  try {
                    const cur = vid.currentTime;
                    const diff = target - cur;
                    const absDiff = Math.abs(diff);
                    // snap if too far for responsiveness
                    if (absDiff > 0.5) {
                      vid.currentTime = target;
                      targetTimeRef.current = null;
                      smoothingRafRef.current = null;
                      return;
                    }
                    const alpha = 0.25; // smoothing factor, tuneable
                    const next = cur + diff * alpha;
                    vid.currentTime = next;
                    if (Math.abs(target - next) < 0.02) {
                      vid.currentTime = target;
                      targetTimeRef.current = null;
                      smoothingRafRef.current = null;
                      return;
                    }
                  } catch (e) {
                    targetTimeRef.current = null;
                    smoothingRafRef.current = null;
                    return;
                  }
                  smoothingRafRef.current = requestAnimationFrame(smoothTick);
                };
                smoothingRafRef.current = requestAnimationFrame(smoothTick);
              }
            }
          } catch (e) {
            // ignore malformed data attributes
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // initial call
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (observerRef.current) observerRef.current.disconnect();
      stopPingPong();
    };
  }, [fps]);

  return (
    <div className="video-bg-wrapper" aria-hidden>
      <video
        ref={videoRef}
        className="video-bg"
        src={VIDEO_PATH}
        playsInline
        muted
        loop={false}
        preload="metadata"
      />
      <div className="video-overlay" />
    </div>
  );
}
