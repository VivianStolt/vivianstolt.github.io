import React, { useState, useEffect, useRef } from 'react';
import Carousel from './components/Carousel';
import ContactForm from './components/ContactForm';
import VideoBackground from './components/VideoBackground';
import FallingCards from './components/FallingCards';
import Button from './components/Button';
import Navbar from './components/Navbar';
import ProjectsSection from './components/ProjectsSection';
import { postService } from './services/api';
import './styles/globals.css';
// Import local image so the bundler (Vite) can include it correctly
import MeImg from './assets/pics/Me.png';
// ImVivian SVG replaced by text using new Vivin font

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  // Refs used to sync the mobile image container height to the h3 height on small screens
  const h3Ref = useRef(null);
  const mobileMeRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await postService.fetchPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = (formData) => {
    console.log('Contact form submitted:', formData);
  };

  const handleContactClick = () => {
    const el = document.querySelector('[data-vs-section="contact"]');
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // fallback: try by class
      const fallback = document.querySelector('.vs-section.vs-contact');
      if (fallback && fallback.scrollIntoView) fallback.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Sync .mobile-me height to the h3 height on small screens. Use ResizeObserver so
  // when the text wraps or font-size changes, the image container follows.
  useEffect(() => {
    const syncHeight = () => {
      const h3El = h3Ref.current;
      const mobileEl = mobileMeRef.current;
      if (!h3El || !mobileEl) return;

      // Only apply when in the mobile layout (<= 800px)
      if (window.innerWidth <= 800) {
        const h = h3El.offsetHeight;
        mobileEl.style.height = h + 'px';
      } else {
        // Reset when not mobile
        mobileEl.style.height = '';
      }
    };

    // Observe changes to the h3's size (e.g., wrapping) and window resizes
    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(syncHeight);
      if (h3Ref.current) ro.observe(h3Ref.current);
    }
    window.addEventListener('resize', syncHeight);

    // Initial sync
    syncHeight();

    return () => {
      if (ro && h3Ref.current) ro.unobserve(h3Ref.current);
      window.removeEventListener('resize', syncHeight);
    };
  }, []);

  return (
    <div className="App">
      {/* SVG Filters */}
      <svg className="gooey-filter">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix 
              in="blur" 
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 19 -9"
            />
          </filter>
        </defs>
      </svg>

      {/* Global SVG filter for glass distortion (used by .liquidGlass-effect) */}
      <svg className="glass-filter" width="0" height="0" aria-hidden="true">
        <filter id="glass-distortion">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.001 0.008"
            numOctaves="1"
            seed="5"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" />
        </filter>
      </svg>
   

  {/* Video background sits under all sections */}
  <Navbar />
  <VideoBackground />

      <main className="sections-root">
        <section
          className="vs-section vs-intro"
          data-vs-section="intro"
          data-vs-mode="loop"
          data-vs-ranges='[49,198]'
        >
          <div className="vs-inner">
            <div className="radius-keski half-banner container-dark padding-pieni">
              <div className="liquidGlass-effect radius-keski" aria-hidden="true"></div>
              <h1 className="animated-headline css-only">
                <span>UX/UI</span>
                <span>DESIGN</span>
                <span>–</span>
                <span>USER</span>
                <span>RESEARCH</span>
                <span>–</span>
                <span>FRONT-END</span>
                <span>DEVELOPMENT</span>
              </h1>
              <h3 className="slide-in-right">Designing intuitive experiences that build trust between people and technology</h3>
            </div>
            {/* Decorative falling cards placed behind the intro content */}
            {/*<FallingCards
              cardsConfig={[
                { src: 'BrandingJylhäsauma.png', x: -10, y: 5, z: 0, rot: -3, rotX: -32, rotY: 24, scale: 1.1, size: 220, speed: 0.2 },
                { src: 'KauppojenKajaaniBanneri.png', x: 10,  y: 0, z: -90, rot: 4, rotX: 0, rotY: 0, scale: 1,  size: 220, speed: 0.1 },
                { src: 'FinnhouseBanner.png', x: 12,  y: 15, z: 80, rot: -18, rotX: -13, rotY: -16, scale: 1.1, size: 220, speed: 0.09 },
                { src: 'doctor.png', x: -6,  y: 22,  z: 20, rot: -11, rotX: 2, rotY: 25, scale: 1.2,  size: 220, speed: 0.06 },
                { src: 'remote-ship.png', x: 12,   y: 28,  z: 150,rot: 0, rotX: 22, rotY: -12, scale: 1.15, size: 220, speed: 0.18 }
              ]}
              depthInfluence={1.0}
            /> */}
          </div>
        </section>

        <section
          className="vs-section vs-scrub"
          data-vs-section="intro-scrub"
          data-vs-mode="scrub"
          data-vs-ranges='[199,249]'
        >
        </section>

        <section
          className="vs-section vs-about row"
          data-vs-section="about"
          data-vs-mode="loop"
          data-vs-ranges='[250,399]'
        >
          <div className={`mobile-text row scale-gap height-fit justify-center ${aboutExpanded ? 'align-top' : 'align-bottom'}`}>
            <div className="mobile-half column large-gap align-left half-width topbot-padding-keski">
              <div className="im-vivian-icon leftright-padding-keski" role="heading" aria-level="1" aria-hidden={false}>I'M VIVIAN</div>
                <div className="radius-keski align-left column semi-gap padding-keski container-dark fill-width">
                  <div className="liquidGlass-effect radius-keski" aria-hidden="true"></div>
                  <div className="row semi-gap align-left justify-left">
                    <p ref={h3Ref}>I'm Vivian Stolt, a UX/UI designer who loves creating transparent, intuitive, and engaging user experiences and interfaces.</p>
                    <div ref={mobileMeRef} className="mobile-me">
                      <img src={MeImg} alt="Vivian Stolt" />
                    </div>
                  </div>
                  <div className="column semi-gap align-left justify-left">
                    <div className="semi-gap column" id="about-extra" aria-hidden={!aboutExpanded} style={{ display: aboutExpanded ? 'flex' : 'none' }}>
                      <p>I enjoy applying my unique creativity to find out-of-the-box solutions, renewing and developing with AI and technological communication tools, while creating seamless and trustworthy user experiences.</p>
                      <p>I focus on user research and experience, empathetic perspective-taking, and front-end development. I enjoy collaborative teamwork and believe the strongest ideas emerge through collective creativity. My goal is to contribute with a positive attitude and foster an open, supportive environment where diverse perspectives are valued.</p>
                    </div>
                    <h2>Bringing ideas to life through stunning designs </h2>
                  </div>
                </div>
              <div className="button-row row large-gap justify-center">
                <Button
                  variant={aboutExpanded ? 'secondary' : 'primary'}
                  onClick={() => setAboutExpanded(prev => !prev)}
                  aria-expanded={aboutExpanded}
                  aria-controls="about-extra"
                >
                  {aboutExpanded ? 'SHOW LESS' : 'SHOW MORE'}
                </Button>
                <Button variant="default" onClick={handleContactClick}>CONTACT ME</Button>
              </div>
              </div>
            <div className="me">
              <img src={MeImg} alt="Vivian Stolt" />
            </div>
          </div>
        </section>

        <section
          className="vs-section vs-scrub"
          data-vs-section="about-scrub"
          data-vs-mode="scrub"
          data-vs-ranges='[400,450]'
        />

        <section
          className="vs-section vs-projects"
          data-vs-section="projects"
          data-vs-mode="loop"
          data-vs-ranges='[451,600]'
        >
          <ProjectsSection />
        </section>

        <section
          className="vs-section vs-scrub"
          data-vs-section="projects-scrub"
          data-vs-mode="scrub"
          data-vs-ranges='[601,649]'
        />

        <section
          className="vs-section vs-posts"
          data-vs-section="posts"
          data-vs-mode="loop"
          data-vs-ranges='[650,799]'
        >
          <div className="vs-inner">
            <div className="liquidGlass-effect" aria-hidden="true"></div>
            <div className="liquidGlass-content">
                <h2>Viimeiset julkaisut</h2>
            </div>
          </div>
        </section>

        <section
          className="vs-section vs-scrub"
          data-vs-section="posts-scrub"
          data-vs-mode="scrub"
          data-vs-ranges='[800,848]'
        />

        <section
          className="vs-section vs-events"
          data-vs-section="events"
          data-vs-mode="loop"
          data-vs-ranges='[849,998]'
        >
          <div className="vs-inner">
            <div className="liquidGlass-effect" aria-hidden="true"></div>
            <div className="liquidGlass-content">
                <h2>LinkedIn Tapahtumat</h2>
                {/* Place Carousel here when posts loaded */}
                {loading ? (
                  <div className="vs-loading">Loading posts...</div>
                ) : error ? (
                  <div className="vs-error">{error}</div>
                ) : (
                  <Carousel posts={posts} title="LinkedIn Posts" />
                )}
            </div>
          </div>
        </section>

        <section
          className="vs-section vs-scrub"
          data-vs-section="events-scrub"
          data-vs-mode="scrub"
          data-vs-ranges='[999,1049]'
        />

        <section
          className="vs-section vs-contact"
          data-vs-section="contact"
          data-vs-mode="loop"
          data-vs-ranges='[1050,1199]'
        >
          <div className="vs-inner">
            <div className="liquidGlass-effect" aria-hidden="true"></div>
            <div className="liquidGlass-content">
                <h2>Ota yhteyttä</h2>
                <ContactForm onSubmit={handleContactSubmit} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;