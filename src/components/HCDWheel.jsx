import React from 'react';
import './HCDWheel.css';

import ContextIcon from '../assets/icons/context.svg';
import UserNeedsIcon from '../assets/icons/userneeds.svg';
import DesignIcon from '../assets/icons/design.svg';
import EvalIcon from '../assets/icons/evaluation.svg';
import ArrowIcon from '../assets/icons/arrow-hcd.svg';

export default function HCDWheel({ section = {} }) {
  const center = section.center || {};
  const items = section.items || [];

  // map keys to imports
  const iconMap = {
    context: ContextIcon,
    userneeds: UserNeedsIcon,
    design: DesignIcon,
    evaluation: EvalIcon,
    arrows: ArrowIcon,
  };

  // short labels for the outer items
  const labelMap = {
    context: 'Context',
    userneeds: 'User needs',
    design: 'Design',
    evaluation: 'Evaluation',
  };

  const [active, setActive] = React.useState('center');

  const getActiveContent = () => {
    if (active === 'center') return { title: center.title, text: center.text };
    const found = items.find(i => i.key === active);
    return found ? { title: found.title, text: found.text } : { title: center.title, text: center.text };
  };

  const activeContent = getActiveContent();

  // visibility + pulse hint state: when the section appears in the viewport
  const rootRef = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  const [pulseActive, setPulseActive] = React.useState(false);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      // fallback: trigger immediately
      setInView(true);
      setPulseActive(true);
      const t = setTimeout(() => setPulseActive(false), 3500);
      return () => clearTimeout(t);
    }

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      setPulseActive(true);
      const t = setTimeout(() => setPulseActive(false), 3500);
      return () => clearTimeout(t);
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setInView(true);
          setPulseActive(true);
          // stop observing after first reveal
          obs.unobserve(el);
          setTimeout(() => setPulseActive(false), 3500);
        }
      });
    }, { threshold: 0.25 });

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={`hcd-wheel-section ${inView ? 'in-view' : ''}`}>
      {section.heading && <h2 className="hcd-wheel-heading">{section.heading}</h2>}
      <div className="hcd-wheel-wrap">
        <div className="hcd-wheel">
          {/* big center circle (clickable) with arrows icon moved inside */}
          {(() => {
            const arrowsItem = items.find(i => i.key === 'arrows');
            return (
              <button
                className={`hcd-center ${active === 'center' ? 'active' : ''} ${pulseActive ? 'pulse' : ''}`}
                onClick={() => setActive('center')}
                aria-pressed={active === 'center'}
                style={pulseActive ? { animationDelay: '0ms' } : undefined}
              >
                <div className={`hcd-center-inner`}>
                  <div className="hcd-center-title">{center.title}</div>
                  {arrowsItem && (
                    <img src={iconMap.arrows} alt={arrowsItem.title} className="hcd-center-arrows" />
                  )}
                </div>
              </button>
            );
          })()}

          {/* positioned item buttons - we position by order: top, right, bottom, left, extra (arrows) */}
          {items.filter(i => i.key !== 'arrows').map((it, index) => (
            <button
              key={it.key}
              className={`hcd-item hcd-item-${it.key} ${active === it.key ? 'active' : ''} ${pulseActive ? 'pulse' : ''}`}
              onClick={() => setActive(it.key)}
              aria-pressed={active === it.key}
              title={it.title}
              style={pulseActive ? { animationDelay: `${index * 120}ms` } : undefined}
            >
              <div className={`hcd-item-inner`}>
                {iconMap[it.key] && (
                  <img src={iconMap[it.key]} alt={it.title} className="hcd-item-icon" />
                )}
                <span className="hcd-item-label">{labelMap[it.key] || it.title}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="hcd-wheel-text">
          <h3 className="hcd-wheel-text-title">{activeContent.title}</h3>
          <p className="hcd-wheel-text-body">{activeContent.text}</p>
        </div>
      </div>
    </div>
  );
}
