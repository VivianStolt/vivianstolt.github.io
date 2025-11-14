import React from 'react';
import SliderSection from './SliderSection';
import HCDWheel from './HCDWheel';
import TextCarouselSection from './TextCarouselSection';
import X from '../assets/icons/X.svg';

export default function ProjectModal({ project, onClose }) {
  if (!project) return null;
  const img = project.cover || ((project.images && project.images[0]) || '');

  // close on Escape
  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose && onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="project-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target.classList && e.target.classList.contains('project-modal-overlay')) onClose && onClose(); }}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close visible" onClick={onClose} aria-label="Close">
          <img src={X} alt="Close" className="modal-close-icon" style={{ width: 24, height: 24 }}/>
        </button>
  <div className="modal-media" style={{ backgroundImage: img ? `url("${img}")` : undefined }} />
        <div className="modal-body">
          <div className="modal-meta">
            <h1>{project.title}</h1>
            <div className="modal-desc">
              <p>{project.description}</p>
            </div>
            <div className="modal-year">{project.year}</div>
            <div className="modal-tags">{(project.tags || []).map(t => <span key={t} className="chip">{t}</span>)}</div>
          </div>
          <div className="modal-extra">
            {/* Render optional sections declared in metadata (e.g. slider, galleries, rich text) */}
            {Array.isArray(project.sections) && project.sections.map((sec, i) => {
              if (sec.type === 'slider') return <SliderSection key={i} section={sec} project={project} />;
              if (sec.type === 'wheel') return <HCDWheel key={i} section={sec} project={project} />;
              if (sec.type === 'text-carousel') return <TextCarouselSection key={i} section={sec} project={project} />;
              // fallback: render raw JSON for unknown section types (editable later)
              return (<pre key={i} style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(sec, null, 2)}</pre>);
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
