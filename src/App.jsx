import React, { useState, useEffect } from 'react';
import Carousel from './components/Carousel';
import ContactForm from './components/ContactForm';
import VideoBackground from './components/VideoBackground';
import FallingCards from './components/FallingCards';
import { postService } from './services/api';
import './styles/globals.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <VideoBackground />

      <main className="sections-root">
        <section
          className="vs-section vs-intro"
          data-vs-section="intro"
          data-vs-mode="loop"
          data-vs-ranges='[49,198]'
        >
          <div className="vs-inner">
            <div className="liquidGlass-effect" aria-hidden="true"></div>
            <div className="liquidGlass-content">
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
              <p className="slide-in-right">Designing intuitive experiences that build trust between people and technology</p>
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
        />

        <section
          className="vs-section vs-about"
          data-vs-section="about"
          data-vs-mode="loop"
          data-vs-ranges='[250,399]'
        >
          <div className="vs-inner">
            <div className="liquidGlass-effect" aria-hidden="true"></div>
            <div className="liquidGlass-content">
                <h2>Oma esittely</h2>
                <p>Placeholder: oma esittely.</p>
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
          <div className="vs-inner">
            <div className="liquidGlass-effect" aria-hidden="true"></div>
            <div className="liquidGlass-content">
                <h2>Projektini</h2>
                <p>Placeholder: projektit.</p>
            </div>
          </div>
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