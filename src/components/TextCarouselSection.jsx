import React, { useEffect, useState } from 'react';
import './TextCarouselSection.css';

// Reuse same helper logic as SliderSection to resolve filenames
function findImageUrl(project, filename) {
  const imgs = project.images || [];
  if (!filename) return imgs[0] || '';

  let found = imgs.find(i => i && i.includes(filename));
  if (found) return found;

  found = imgs.find(i => {
    try {
      return i && decodeURIComponent(i).includes(filename);
    } catch (e) {
      return false;
    }
  });
  if (found) return found;

  const base = filename.replace(/\.[^.]+$/, '');
  found = imgs.find(i => {
    const name = i.split('/').pop();
    const check = (name || '').replace(/\.[^.]+$/, '');
    return check === base;
  });
  if (found) return found;

  return imgs[0] || '';
}

export default function TextCarouselSection({ section = {}, project = {} }) {
  const images = (section.images || []).slice(0, 6); // limit to 6
  const textPosition = (section.textPosition || 'left'); // 'left' or 'right'
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return undefined; // no interval needed
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), section.intervalMs || 3000);
    return () => clearInterval(t);
  }, [images.length, section.intervalMs]);

  if (!section.text && images.length === 0) return null;

  // map images to resolved urls (using project's image list)
  const resolved = images.map(img => findImageUrl(project, img)).filter(Boolean);

  return (
    <div className="text-carousel-section">
      <div className={`text-carousel-inner ${textPosition === 'right' ? 'text-right' : 'text-left'}`}>
        <div className="text-carousel-text">
          {section.heading && <h3 className="tc-heading">{section.heading}</h3>}
          {section.text && (
            <div className="tc-text">
              {(
                // split on HTML <br> (with optional slash/space) or on double newlines
                section.text.split(/<br\s*\/?\>|\r?\n\r?\n/)
                  .map(s => s.trim())
                  .filter(Boolean)
              ).map((para, pi) => (
                <p key={pi}>{para}</p>
              ))}
            </div>
          )}
        </div>

        <div className="text-carousel-gallery" aria-hidden={resolved.length === 0}>
          {resolved.length === 0 ? null : (
            <div className="tc-slides">
              {resolved.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={section.images && section.images[i] ? section.images[i] : (project.title || '')}
                  className={`tc-slide ${i === idx ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
