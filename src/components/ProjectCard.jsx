import React, { useRef, useEffect } from 'react';

export default function ProjectCard({ project = {}, large = false, onClick }) {
  // prefer resolved cover URL from metadata (projects.js resolves cover to a bundled URL),
  // fall back to the first image in `images` if cover is not present
  const img = project.cover || ((project.images && project.images[0]) || '');
  const year = project.year || '';
  const title = project.title || project.slug || 'Untitled';
  const desc = project.description || '';
  // prepare tags for marquee: use the original tags array and render it twice
  // (we'll duplicate the sequence in the DOM rather than appending the first item)
  const seqTags = (project.tags && project.tags.length) ? [...project.tags] : [];

  // refs for measuring and controlling marquee animation so the loop is seamless
  const trackRef = useRef(null);
  const seqRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const track = trackRef.current;
      const seq = seqRef.current;
      if (!track || !seq) return;
  const seqWidth = Math.ceil(seq.getBoundingClientRect().width);
      // set marquee distance as negative pixel value (exact measured width)
      track.style.setProperty('--marquee-distance', `-${seqWidth}px`);
      // compute duration from a pixels-per-second speed so longer lists take longer
      const pxPerSec = 20; // tuning: higher => faster scroll
      const duration = Math.max(6, Math.round((seqWidth / pxPerSec) * 10) / 10);
      track.style.setProperty('--marquee-duration', `${duration}s`);
    };

    update();
    window.addEventListener('resize', update);
    // some font-load/layout changes may happen after load — try another update shortly
    const t = setTimeout(update, 250);
    return () => {
      window.removeEventListener('resize', update);
      clearTimeout(t);
    };
  }, [project.tags]);

  return (
    <div className={`hex-card ${large ? 'large' : ''}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : -1}>
  {/* wrap URL in quotes like ProjectModal to handle spaces/encoded chars reliably */}
  <div className="hex-inner" style={{ backgroundImage: img ? `url("${img}")` : undefined }}>
        <div className="hex-year">{year}</div>
        <div className="hex-bottom">
          <div className="hex-title">{title}</div>
          <div className="hex-desc">{desc}</div>
          {project.tags && project.tags.length > 0 && (
            <div className="hex-tags">
              <div className="tag-marquee">
                <div className="tag-track" ref={trackRef}>
                  <div className="tag-seq" ref={seqRef}>
                    {seqTags.map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                  <div className="tag-seq" aria-hidden="true">
                    {seqTags.map((t, i) => <span key={`2-${i}`} className="tag">{t}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
