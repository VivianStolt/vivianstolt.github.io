import React, { useMemo, useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import HorizontalScroller from './HorizontalScroller';
import ProjectModal from './ProjectModal';
import NewToOld from '../assets/icons/NewToOld.svg';
import OldToNew from '../assets/icons/OldToNew.svg';
import X from '../assets/icons/X.svg';

const CATEGORIES = [
  { key: null, label: 'All', matchTags: [] },
  { key: 'problem', label: 'Problem Solving & Research', matchTags: ['problem','research','ux-research','user-research'] },
  { key: 'ui', label: 'UI Design & Prototypes', matchTags: ['ui design','ui','design'] },
  { key: 'frontend', label: 'Frontend Development', matchTags: ['frontend','javascript','js','css','html'] }
];

export default function Gallery({ projects = [], initialCategory = null, onClose }) {
  // selectedCategories: Set of category keys to show. Empty = show all
  const [selectedCategories, setSelectedCategories] = useState(() => {
    return initialCategory ? new Set([initialCategory]) : new Set();
  });
  // tagFilters: array of tags user added via the search box
  const [tagFilters, setTagFilters] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selected, setSelected] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // or 'oldest'

  const tags = useMemo(() => {
    const set = new Set();
    projects.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return Array.from(set);
  }, [projects]);
  // Build a set of allowed category tags (matchTags) from selected category keys.
  const allowedCategoryTags = useMemo(() => {
    if (!selectedCategories || selectedCategories.size === 0) return null;
    const s = new Set();
    CATEGORIES.forEach(c => {
      if (c.key && selectedCategories.has(c.key) && Array.isArray(c.matchTags)) {
        c.matchTags.forEach(t => s.add(String(t).toLowerCase()));
      }
    });
    return s;
  }, [selectedCategories]);

  const filtered = projects.filter(p => {
    const pTags = (p.tags || []).map(t => String(t).toLowerCase());
    // category filtering: if any category selected, require project to match at least one of the category's matchTags
    if (allowedCategoryTags && allowedCategoryTags.size > 0) {
      const hasCat = pTags.some(t => allowedCategoryTags.has(t));
      if (!hasCat) return false;
    }
    // tag filters: require all added tags to be present
    if (tagFilters.length > 0) {
      const ok = tagFilters.every(tf => pTags.includes(String(tf).toLowerCase()));
      if (!ok) return false;
    }
    return true;
  });

  // sort by year if available
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const ay = Number(a.year) || 0;
      const by = Number(b.year) || 0;
      return sortOrder === 'newest' ? (by - ay) : (ay - by);
    });
    return copy;
  }, [filtered, sortOrder]);

  // close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (selected) setSelected(null);
        else onClose && onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, onClose]);

  return (
    <div className="gallery-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target.classList && e.target.classList.contains('gallery-overlay')) onClose && onClose(); }}>
      <div className="gallery-shell" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-header">
          <h3>Gallery</h3>
          <div className="filters-row">
            <div className="gallery-controls">

              {CATEGORIES.filter(c => c.key !== null).map(c => (
                <button
                  key={String(c.key)}
                  className={`chip ${selectedCategories.has(c.key) ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategories(prev => {
                      const next = new Set(prev);
                      if (next.has(c.key)) next.delete(c.key);
                      else next.add(c.key);
                      return next;
                    });
                  }}
                >{c.label}</button>
              ))}


                <button
                  className="chip sort-btn"
                  title={sortOrder === 'newest' ? 'Sort newest to oldest' : 'Sort oldest to newest'}
                  onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <img src={sortOrder === 'newest' ? NewToOld : OldToNew} alt="sort icon" style={{ width: 30, height: 30 }} />
                </button>
                <button className="close-btn visible" onClick={onClose} aria-label="Close gallery">
                  <img src={X} alt="Close" className="modal-close-icon" style={{ width: 24, height: 24 }}/>
                </button>

            </div>
      

            <div className="tag-filters" style={{ marginTop: '0.6rem' }}>
              <span>Add tags</span>
              <input
                aria-label="Search tags"
                className="search-input"
                placeholder="Type tag and press Enter"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const v = String(searchValue || '').trim().toLowerCase();
                    if (!v) return;
                    setTagFilters(prev => prev.includes(v) ? prev : [...prev, v]);
                    setSearchValue('');
                  }
                }}
              />
              {tagFilters.length === 0 && <span className="muted" style={{ marginLeft: '0.5rem' }}></span>}
              <div className="tag-seq">
              {tagFilters.map(t => (
                <span key={t} className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  {t}
                  <button aria-label={`Remove ${t}`} onClick={() => setTagFilters(prev => prev.filter(x => x !== t))} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                </span>
              ))}
              </div>
            </div>
          </div>
        </div>

        <HorizontalScroller innerClassName="gallery-grid" outerClassName="gallery-container">
          {sorted.map(p => (
            <div key={p.slug} className="gallery-item" onClick={() => setSelected(p)}>
              <ProjectCard project={p} large={false} />
            </div>
          ))}
          {sorted.length === 0 && (<div className="empty">No projects found for selected filters.</div>)}
        </HorizontalScroller>
      </div>

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
