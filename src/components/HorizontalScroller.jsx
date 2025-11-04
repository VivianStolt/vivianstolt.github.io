import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Arrow from './Arrow';

/**
 * HorizontalScroller
 * - wraps content that may overflow horizontally
 * - shows left/right Arrow controls when content is scrollable
 * - arrows scroll by a configurable step (defaults to 70% of visible width)
 */
export default function HorizontalScroller({ children, innerClassName = '', outerClassName = '', step = 0.7 }) {
  const innerRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = innerRef.current;
    if (!el) return setIsOverflowing(false);
    setIsOverflowing(el.scrollWidth > el.clientWidth + 1);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = innerRef.current;
    if (!el) return;

    // ResizeObserver to catch content/size changes
    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => checkOverflow());
      ro.observe(el);
      // observe children container as well in case items change width
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    }

    // also respond to window resizes
    window.addEventListener('resize', checkOverflow);

    const updateScrollState = () => {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    };

    // update on scroll
    el.addEventListener('scroll', updateScrollState, { passive: true });
    // run once to set initial state
    updateScrollState();

    return () => {
      window.removeEventListener('resize', checkOverflow);
      if (ro) {
        try { ro.disconnect(); } catch (e) {}
      }
      try { el.removeEventListener('scroll', updateScrollState); } catch (e) {}
    };
  }, [checkOverflow]);

  const scrollByDirection = (dir) => {
    const el = innerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * step);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className={`scroll-wrapper ${outerClassName || ''}`.trim()}>
      {isOverflowing && (
        <button className="black-circle scroll-arrow left" onClick={() => scrollByDirection('left')} aria-label="Scroll left" disabled={!canScrollLeft} aria-disabled={!canScrollLeft}>
          <Arrow direction="left" size={28} ariaHidden={false} />
        </button>
      )}

      <div className={`scroll-inner ${innerClassName || ''}`.trim()} ref={innerRef} tabIndex={0}>
        {children}
      </div>

      {isOverflowing && (
        <button className="black-circle scroll-arrow right" onClick={() => scrollByDirection('right')} aria-label="Scroll right" disabled={!canScrollRight} aria-disabled={!canScrollRight}>
          <Arrow direction="right" size={28} ariaHidden={false} />
        </button>
      )}
    </div>
  );
}

HorizontalScroller.propTypes = {
  children: PropTypes.node,
  innerClassName: PropTypes.string,
  outerClassName: PropTypes.string,
  step: PropTypes.number
};
