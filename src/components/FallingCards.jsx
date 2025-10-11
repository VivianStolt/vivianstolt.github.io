import React, { useEffect, useRef, useState } from 'react';
import '../styles/fallingCards.css';

// Load all images from the pics folder (Vite import)
const modules = import.meta.globEager('../assets/pics/*.{jpg,jpeg,png,webp}');
const imageList = Object.keys(modules).map((k) => modules[k].default);

/**
 * FallingCards
 * Props (all optional):
 * - count: max number of cards to show (default: all images found)
 * - xRange: [minVW, maxVW] horizontal offset in vw (default [-40,40])
 * - yRange: [minVH, maxVH] initial vertical offset in vh (default [0,60])
 * - speedRange: [min, max] multiplier for scroll speed (default [0.02,0.52])
 * - zRange: [minPx, maxPx] translateZ in px (default [-80,120])
 * - rotRange: [minDeg, maxDeg] rotation in degrees (default [-20,20])
 * - scaleRange: [min, max] initial scale (default [0.8,1.4])
 * - sizeRange: [minPx, maxPx] image width in px (default [120,320])
 * - hideBelow: number (px) to hide effect under a viewport width (default 800)
 */
export default function FallingCards({
  // Explicit configuration array is required for deterministic placement.
  // Example item: { src: 'my-pic.jpg' or 0 (index), x: 10, y: 5, z: 20, rot: 5, scale: 1, size: 220, speed: 0.08 }
  cardsConfig,
  hideBelow = 800,
  // How much depth affects speed: 0 = none, 1 = full mapping
  depthInfluence = 1.0,
  // Container perspective in pixels (optional). Set to 0 or undefined to disable.
  perspective = 800
}) {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const stateRef = useRef({ scrollY: 0, ticking: false, cards: [] });

  // Build a map of filename -> resolved module URL so we can resolve explicit src names
  const modulesMap = Object.keys(modules).reduce((acc, k) => {
    const name = k.split('/').pop();
    acc[name] = modules[k].default;
    return acc;
  }, {});

  const resolveSrc = (src) => {
    if (!src) return null;
    if (typeof src === 'number') return imageList[src] || null;
    if (typeof src === 'string') {
      const base = src.split('/').pop();
      if (modulesMap[base]) return modulesMap[base];
      const foundKey = Object.keys(modulesMap).find(k => k.toLowerCase().includes(base.toLowerCase()));
      if (foundKey) return modulesMap[foundKey];
      return src;
    }
    return null;
  };

  // Require explicit configuration
  if (!cardsConfig || !Array.isArray(cardsConfig) || cardsConfig.length === 0) {
    // Nothing to render without explicit config
    return null;
  }

  // Build initial cards synchronously so edits to cardsConfig re-render immediately
  const initialCards = cardsConfig.map((explicit) => ({
    src: resolveSrc(explicit.src) || null,
    x: typeof explicit.x === 'number' ? explicit.x : 0,
    y: typeof explicit.y === 'number' ? explicit.y : 0,
    speed: typeof explicit.speed === 'number' ? explicit.speed : 0.08,
    z: typeof explicit.z === 'number' ? explicit.z : 0,
    rot: typeof explicit.rot === 'number' ? explicit.rot : 0,
    // New 3D rotation params (degrees)
    rotX: typeof explicit.rotX === 'number' ? explicit.rotX : 0,
    rotY: typeof explicit.rotY === 'number' ? explicit.rotY : 0,
    scale: typeof explicit.scale === 'number' ? explicit.scale : 1,
    size: typeof explicit.size === 'number' ? explicit.size : 200
  }));

  const [cards, setCards] = useState(initialCards);

  // Entrance parameters (shared between render and effect)
  const START_Y = -100; // vh above viewport where cards start
  const STAGGER_MS = 480; // ms between each card drop
  const DURATION_MS = 5700; // ms animation duration per card

  useEffect(() => {
    // Update positions during scroll with depth-influenced speed
    const updatePositions = () => {
      const s = stateRef.current.scrollY || 0;
      const zs = (stateRef.current.cards && stateRef.current.cards.length)
        ? stateRef.current.cards.map(c => (typeof c.z === 'number' ? c.z : 0))
        : cards.map(c => (typeof c.z === 'number' ? c.z : 0));
      const zMin = Math.min(...zs);
      const zMax = Math.max(...zs);
      const zSpan = (zMax - zMin) || 1;
      const list = (stateRef.current.cards && stateRef.current.cards.length) ? stateRef.current.cards : cards;
      list.forEach((meta, i) => {
        const el = cardsRef.current[i];
        if (!el || !meta) return;
        const tDepth = Math.max(0, Math.min(1, (meta.z - zMin) / zSpan));
        const effectiveSpeed = meta.speed * (1 + tDepth * depthInfluence);
        // keep small scroll-based vertical parallax, but do NOT add lateral drift here
        const y = meta.y + (s * effectiveSpeed * 0.06);
        const transform = `translate3d(-50%, ${y}vh, ${meta.z}px) rotateX(${meta.rotX}deg) rotateY(${meta.rotY}deg) rotate(${meta.rot}deg) scale(${meta.scale})`;
        el.style.transform = transform;
      });
      stateRef.current.ticking = false;
    };

    let observer = null;
    const entranceTimers = [];

    // IntersectionObserver to trigger entrance animation once visible
    const startEntrance = () => {
      // ensure any previous timers are cleared
      entranceTimers.forEach(t => clearTimeout(t));
      cardsRef.current.forEach((el, i) => {
        const meta = cards[i];
        if (!el || !meta) return;
        const delay = i * STAGGER_MS + 20;
        // prepare entrance: set transition and opacity
        const t = setTimeout(() => {
          // Animate vertically from offscreen START_Y to meta.y without horizontal drift
          el.style.transition = `transform ${DURATION_MS}ms cubic-bezier(.2,.9,.2,1), opacity ${Math.round(DURATION_MS/2)}ms ease-out`;
          el.style.opacity = '1';
          const finalTransform = `translate3d(-50%, ${meta.y}vh, ${meta.z}px) rotateX(${meta.rotX}deg) rotateY(${meta.rotY}deg) rotate(${meta.rot}deg) scale(${meta.scale})`;
          el.style.transform = finalTransform;
        }, delay);
        entranceTimers.push(t);
      });

      // After entrance, enable scroll updates
  const totalTime = (cards.length - 1) * STAGGER_MS + DURATION_MS + 80;
      const enableTimer = setTimeout(() => {
        stateRef.current.scrollY = window.scrollY || window.pageYOffset;
        window.addEventListener('scroll', onScroll, { passive: true });
        // tick once to set initial parallax positions
        requestAnimationFrame(updatePositions);
      }, totalTime);
      entranceTimers.push(enableTimer);
    };

    // onScroll uses requestAnimationFrame to batch updates
    const onScroll = () => {
      stateRef.current.scrollY = window.scrollY || window.pageYOffset;
      if (!stateRef.current.ticking) {
        stateRef.current.ticking = true;
        requestAnimationFrame(updatePositions);
      }
    };

    // Setup observer on the container so entrance happens when section is visible
    if (containerRef.current) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startEntrance();
            if (observer) observer.disconnect();
            break;
          }
        }
      }, { threshold: 0.15 });
      observer.observe(containerRef.current);
    } else {
      // fallback: start immediately
      startEntrance();
    }

    return () => {
      if (observer) observer.disconnect();
      entranceTimers.forEach(t => clearTimeout(t));
      window.removeEventListener('scroll', onScroll);
    };
  }, [cards, hideBelow, depthInfluence]);

  // Keep stateRef.cards in sync with React state so updatePositions sees latest list
  useEffect(() => {
    stateRef.current.cards = cards;
    // set initial inline styles (left/top/width/transform) for each card element
    // compute z min/max for baseXDrift calculation
    const zs = (cards || []).map(c => (typeof c.z === 'number' ? c.z : 0));
    const zMin = zs.length ? Math.min(...zs) : 0;
    const zMax = zs.length ? Math.max(...zs) : 1;
  const zSpan = (zMax - zMin) || 1;

  cardsRef.current.forEach((el, i) => {
      const meta = cards[i];
      if (!el || !meta) return;
  const tDepth = Math.max(0, Math.min(1, (meta.z - zMin) / zSpan));
  const baseXDrift = Math.cos(i * 0.9 + 0.2) * 1.2 * (0.5 + tDepth * 0.7);
      el.style.left = `calc(50% + ${meta.x}vw)`;
      el.style.top = `${meta.y}vh`;
      el.style.width = `${meta.size}px`;
  el.style.transform = `translate3d(-50%, ${meta.y}vh, ${meta.z}px) rotateX(${meta.rotX}deg) rotateY(${meta.rotY}deg) rotate(${meta.rot}deg) translateX(${baseXDrift}vw) scale(${meta.scale})`;
      // Ensure DOM stacking follows depth: higher z -> higher zIndex. Add 1000 offset to keep positive.
      const computedZIndex = (typeof meta.z === 'number') ? Math.round(1000 + tDepth * 1000) : 1000 + i;
      el.style.zIndex = String(computedZIndex);
    });
  }, [cards]);

  return (
    <div
      className="falling-cards"
      ref={containerRef}
      aria-hidden="true"
      style={{
        display: (typeof window !== 'undefined' && window.innerWidth <= hideBelow) ? 'none' : undefined,
        perspective: perspective ? `${perspective}px` : undefined,
        WebkitPerspective: perspective ? `${perspective}px` : undefined,
        transformStyle: 'preserve-3d'
      }}
    >
      {(() => {
        const zs = (cards || []).map(c => (typeof c.z === 'number' ? c.z : 0));
        const zMin = zs.length ? Math.min(...zs) : 0;
        const zMax = zs.length ? Math.max(...zs) : 1;
        const zSpan = (zMax - zMin) || 1;
        return (cards || []).map((meta, i) => {
          const tDepth = Math.max(0, Math.min(1, (meta.z - zMin) / zSpan));
          const baseXDrift = Math.cos(i * 0.9 + 0.2) * 1.2 * (0.5 + tDepth * 0.7);
          return (
            <div
              key={i}
              className="falling-card"
              ref={(el) => (cardsRef.current[i] = el)}
              style={{ zIndex: 1 }}
            >
              {meta && meta.src ? (
                <img
                  src={meta.src}
                  alt={`decorative-${i}`}
                  style={{
                    width: '100%',
                    display: 'block',
                    borderRadius: 10,
                    transform: `translate3d(0,0,0)`,
                  }}
                />
              ) : null}
              {/* initial wrapper inline style to avoid flicker/stacking before effect runs */}
              <style dangerouslySetInnerHTML={{__html: `
                .falling-card:nth-child(${i+1}){ left: calc(50% + ${meta.x}vw); top: ${START_Y}vh; width: ${meta.size}px; transform: translate3d(-50%, ${START_Y}vh, ${meta.z}px) translateX(${baseXDrift}vw) rotateX(${meta.rotX}deg) rotateY(${meta.rotY}deg) rotate(${meta.rot}deg) scale(${meta.scale}); opacity:0; transition:none; }
              `}} />
            </div>
          );
        })
      })()}
    </div>
  );
}
