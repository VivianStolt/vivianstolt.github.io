import React, { useEffect, useState } from 'react';
import { loadProjects } from '../services/projects';
import ProjectCard from './ProjectCard';
import Arrow from './Arrow';
import Gallery from './Gallery';
import HorizontalScroller from './HorizontalScroller';
import ProjectModal from './ProjectModal';
import '../styles/projects.css';
import '../styles/globals.css';

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  // which category's inline carousel is expanded (null = all collapsed)
  const [openedCategory, setOpenedCategory] = useState(null);

  useEffect(() => {
    let mounted = true;
    loadProjects().then(data => {
      if (mounted) setProjects(data);
    }).catch(err => {
      console.error('Failed to load projects', err);
    });
    return () => { mounted = false; };
  }, []);

  const categories = [
    {
      key: 'problem',
      label: 'Problem Solving & UX Research',
      description: 'Understanding user needs and problem solving. Facilitating workshops, conducting research, and applying insights to guide UI and product innovation.',
      matchTags: ['problem','research', 'ux-research', 'user-research']
    },
    {
      key: 'ui',
      label: 'UI Design & Prototypes',
      description: 'Designing user interfaces and interactive prototypes that balance visual clarity, usability, and product goals — from wireframes to high-fidelity designs by using Figma.',
      matchTags: ['ui design']
    },
    {
      key: 'frontend',
      label: 'Frontend Development',
      description: 'Building responsive, accessible user interfaces with HTML, CSS, and JavaScript — turning ideas and designs into working digital experiences.',
      matchTags: ['frontend', 'javascript', 'js', 'css', 'html']
    }
  ];

  function openGallery(categoryKey = null) {
    setActiveCategory(categoryKey);
    setGalleryOpen(true);
  }

  function toggleCategory(catKey) {
    setOpenedCategory(prev => (prev === catKey ? null : catKey));
  }

  return (
    <div className="vs-inner column align-left large-gap">
        <h1>From Idea to Interface – My Skillset</h1>

        <div className="projects-categories">
          {categories.map(cat => {
            // Normalize tags to lowercase and see if any tag matches the category's synonyms
            const filtered = projects.filter(p => {
              const tags = (p.tags || []).map(t => String(t).toLowerCase());
              return tags.some(t => (cat.matchTags || []).includes(t));
            });
            const isOpen = openedCategory === cat.key;
            return (
              <div className={`projects-category ${isOpen ? 'open' : ''}`} key={cat.key}>
                <div className="liquidGlass-effect radius-keski" aria-hidden="true"></div>
                <div className="category-bar semi-gap">
                  <div className="category-info column small-gap">
                    <h2>{cat.label}</h2>
                    {cat.description && (
                      <p className="category-desc">{cat.description}</p>
                    )}
                  </div>
                  <div className="category-actions">
                    {/* Arrow toggles inline carousel */}
                    <button className="see-more-btn arrow-toggle" onClick={() => toggleCategory(cat.key)} aria-expanded={isOpen} aria-controls={`carousel-${cat.key}`} aria-label={isOpen ? 'Collapse category' : 'Expand category'}>
                      <Arrow direction={isOpen ? 'up' : 'down'} size={28} ariaHidden={false} />
                    </button>
                    {/* NOTE: moved "SEE MORE" into the inline carousel controls so it's on the same row as arrows */}
                  </div>
                </div>
                {isOpen && (
                  <>
                    <HorizontalScroller innerClassName="gallery-grid" outerClassName="gallery-container">
                      {filtered.slice(0, 3).map((p, i) => (
                        <div className="gallery-item" key={p.slug || i}>
                          {/* Clicking a card in the inline category opens the project's modal directly */}
                          <ProjectCard project={p} onClick={() => setSelectedProject(p)} />
                        </div>
                      ))}
                    </HorizontalScroller>
                    <div className="projects-footer">
                      <button className="btn btn--primary see-more-btn" onClick={() => openGallery(cat.key)}>SEE MORE</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Fallback small gallery access if nothing selected */}
        <div className="projects-footer">
          <button className="btn btn--primary see-more-btn" onClick={() => openGallery(null)}>SEE ALL PROJECTS</button>
        </div>

        {galleryOpen && (
          <Gallery
            projects={projects}
            initialCategory={activeCategory}
            onClose={() => setGalleryOpen(false)}
          />
        )}

        {/* Project modal for direct card opening in the sections */}
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </div>
  );
}
