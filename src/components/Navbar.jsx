import React, { useState } from 'react';
import './Navbar.css';
import Logo from '../assets/icons/logo.svg';
import Arrow from './Arrow';

const SECTIONS = [
  { id: 'about', label: 'ABOUT' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'posts', label: 'POSTS' },
  { id: 'events', label: 'EVENTS' },
  { id: 'contact', label: 'CONTACT' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e) => {
    e.preventDefault();
    setIsOpen((s) => !s);
  };

  const handleNavClick = (sectionId) => (e) => {
    e.preventDefault();
    const el = document.querySelector(`[data-vs-section="${sectionId}"]`);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (isOpen) setIsOpen(false);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`site-nav ${isOpen ? 'open' : ''}`} aria-label="Primary">
      <div className="site-nav-inner container-dark">
        <div className="liquidGlass-effect radius-keski" aria-hidden="true"></div>

        {/* Mobile header: shows on small screens and toggles menu */}
        <button className="mobile-header" onClick={handleToggle} aria-expanded={isOpen} aria-controls="mobile-nav-list">
          <div className="brand">
            <img src={Logo} alt="Logo" />
          </div>
          <div className="chev">
            <Arrow direction={isOpen ? 'up' : 'down'} size={28} ariaHidden={false} />
          </div>
        </button>

        <button className="nav-logo" onClick={handleLogoClick} aria-label="Go to top">
          <img src={Logo} alt="Site logo" />
        </button>

        <ul id="mobile-nav-list" className={`nav-list ${isOpen ? 'mobile-open' : ''}`}>
          {SECTIONS.map((s) => (
            <li key={s.id} className="nav-item">
              <a href={`#${s.id}`} onClick={handleNavClick(s.id)}>{s.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
