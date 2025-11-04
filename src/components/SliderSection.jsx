import React, { useState } from 'react';

// Helper: find image URL from project's images array by filename
function findImageUrl(project, filename) {
  const imgs = project.images || [];
  if (!filename) return imgs[0] || '';

  // Try exact include first
  let found = imgs.find(i => i && i.includes(filename));
  if (found) return found;

  // Try decoding the URL (spaces may be encoded as %20)
  found = imgs.find(i => {
    try {
      return i && decodeURIComponent(i).includes(filename);
    } catch (e) {
      return false;
    }
  });
  if (found) return found;

  // Try matching by basename (filename without extension)
  const base = filename.replace(/\.[^.]+$/, '');
  found = imgs.find(i => {
    const name = i.split('/').pop();
    const check = (name || '').replace(/\.[^.]+$/, '');
    return check === base;
  });
  if (found) return found;

  // fallback to first image
  return imgs[0] || '';
}

export default function SliderSection({ section = {}, project = {} }) {
  const slides = section.slides || [];
  const [index, setIndex] = useState(0);

  if (slides.length === 0) return null;

  const prev = () => setIndex(i => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex(i => (i + 1) % slides.length);

  const s = slides[index];
  const imageUrl = findImageUrl(project, s.image);

  // Debug: if image was explicitly requested but not found, log a helpful message
  if (s.image && !imageUrl) {
    // eslint-disable-next-line no-console
    console.debug('SliderSection: requested image not found in project.images', s.image, project.slug, project.images);
  }

  return (
    <div className="slider-section">
      <div className="slider-inner">
        <div className="slider-left">
          {s.title && <h3 className="slider-title">{s.title}</h3>}
          {s.text && <div className="slider-text"><p>{s.text}</p></div>}
        </div>

        <div className="slider-right">
          {imageUrl ? (
            <img src={imageUrl} alt={s.title || project.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
          ) : null}
        </div>
      </div>

      <div className="slider-controls">
        <button className="nav-btn" onClick={prev} aria-label="previous">‹</button>
        <div className="pager">{index + 1} / {slides.length}</div>
        <button className="nav-btn" onClick={next} aria-label="next">›</button>
      </div>
    </div>
  );
}
