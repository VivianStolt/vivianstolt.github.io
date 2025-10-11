import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import { useVanillaTilt } from '../hooks/useVanillaTilt';
import './Carousel.css';

const Carousel = ({ posts = [], title = "Latest LinkedIn Posts" }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  // Responsive slides calculation
  useEffect(() => {
    const updateSlidesToShow = () => {
      const width = window.innerWidth;
      if (width <= 480) setSlidesToShow(1);
      else if (width <= 768) setSlidesToShow(2);
      else setSlidesToShow(3);
    };

    updateSlidesToShow();
    window.addEventListener('resize', updateSlidesToShow);
    return () => window.removeEventListener('resize', updateSlidesToShow);
  }, []);

  const pages = Math.ceil(posts.length / slidesToShow);
  const maxSlide = Math.max(0, pages - 1);
  const canGoPrev = currentSlide > 0;
  const canGoNext = currentSlide < maxSlide;

  const goToPrevSlide = () => {
    if (canGoPrev) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const goToNextSlide = () => {
    if (canGoNext) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(Math.min(index, maxSlide));
  };

  // Calculate dot positions
  const totalDots = pages;

  return (
    <div className="carousel-container">
      <h2 className="carousel-title">{title}</h2>
      
      <div className="carousel-wrapper">
        <div className="carousel-track-container">
          <div 
            className="carousel-track"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`
            }}
          >
            {posts.map((post, index) => (
              <CarouselSlide key={index} post={post} />
            ))}
          </div>
        </div>
      </div>

      <div className="carousel-controls">
        <Button
          variant="carousel-nav"
          icon="arrow-left"
          disabled={!canGoPrev}
          onClick={goToPrevSlide}
          className="carousel-btn-prev"
          aria-label="Previous slide"
        />
        
        <div 
          className="carousel-dots" 
          style={{ '--liquid-index': currentSlide }}
        >
          {Array.from({ length: totalDots }, (_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="carousel-nav"
          icon="arrow-right"
          disabled={!canGoNext}
          onClick={goToNextSlide}
          className="carousel-btn-next"
          aria-label="Next slide"
        />
      </div>
    </div>
  );
};

const CarouselSlide = ({ post }) => {
  const tiltRef = useVanillaTilt({
    max: 15,
    speed: 400,
    scale: 1.05,
    glare: false
  });

  const handlePostClick = () => {
    // Handle post modal opening
    console.log('Opening post:', post);
  };

  return (
    <div className="carousel-slide">
      <div className="tilt-wrapper" ref={tiltRef}>
        <div className="post-card" onClick={handlePostClick}>
          <div className="post-image-container">
            {post.image ? (
              <img 
                src={post.image} 
                alt={post.title || "LinkedIn post"} 
                className="post-image"
              />
            ) : (
              <div className="post-placeholder">
                <div className="linkedin-icon">in</div>
                <div>LinkedIn Post</div>
              </div>
            )}
            
            <div className="post-overlay">
              <div className="post-date">{post.date}</div>
              <div className="post-text">{post.text}</div>
              <div className="post-click-hint">Click to read more</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CarouselSlide.propTypes = {
  post: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string,
    date: PropTypes.string,
    text: PropTypes.string
  }).isRequired
};

Carousel.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string
};

export default Carousel;