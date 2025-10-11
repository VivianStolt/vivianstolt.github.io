import { useEffect, useRef } from 'react';

// VanillaTilt functionality converted to React hook
export const useVanillaTilt = (options = {}) => {
  const elementRef = useRef(null);

  const defaultOptions = {
    max: 15,
    speed: 400,
    glare: false,
    'max-glare': 0.2,
    scale: 1.05,
    perspective: 1000,
    transition: true,
    ...options
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let settings = { ...defaultOptions };
    let reverse = settings.reverse || false;
    let glare = settings.glare || false;
    let glarePrerender = settings['glare-prerender'] || false;

    const onMouseEnter = () => {
      element.style.willChange = "transform";
      if (glare) element.querySelector(".js-tilt-glare").style.willChange = "transform, opacity";
    };

    const onMouseMove = (event) => {
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;
      const width = element.clientWidth || element.offsetWidth;
      const height = element.clientHeight || element.offsetHeight;

      const left = clientX / width;
      const top = clientY / height;

      const percentageX = (left - 0.5) * 2;
      const percentageY = (top - 0.5) * 2;

      const maxTilt = settings.max;
      const tiltX = reverse ? maxTilt * percentageX : maxTilt * percentageY * -1;
      const tiltY = reverse ? maxTilt * percentageY * -1 : maxTilt * percentageX;

      const angle = Math.atan2(percentageX, percentageY) * (180 / Math.PI) - 180;
      const scale = settings.scale ? settings.scale : 1;

      element.style.transform = `perspective(${settings.perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;

      if (glare) {
        const glareElement = element.querySelector('.js-tilt-glare-inner');
        if (glareElement) {
          glareElement.style.transform = `rotate(${angle}deg) translate(-50%, -50%)`;
          glareElement.style.opacity = `${Math.min(Math.max(Math.abs(percentageX), Math.abs(percentageY)), settings['max-glare'])}`;
        }
      }
    };

    const onMouseLeave = () => {
      if (settings.transition) {
        element.style.transition = `all ${settings.speed}ms cubic-bezier(.03,.98,.52,.99)`;
        setTimeout(() => {
          element.style.transition = '';
        }, settings.speed);
      }

      element.style.transform = `perspective(${settings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      element.style.willChange = "auto";

      if (glare) {
        const glareElement = element.querySelector('.js-tilt-glare-inner');
        if (glareElement) {
          glareElement.style.transform = 'rotate(0deg) translate(-50%, -50%)';
          glareElement.style.opacity = '0';
        }
        element.querySelector(".js-tilt-glare").style.willChange = "auto";
      }
    };

    // Add glare effect if enabled
    if (glare && !element.querySelector('.js-tilt-glare')) {
      const glareElement = document.createElement('div');
      glareElement.classList.add('js-tilt-glare');
      
      const glareElementInner = document.createElement('div');
      glareElementInner.classList.add('js-tilt-glare-inner');
      
      glareElement.appendChild(glareElementInner);
      element.appendChild(glareElement);

      // Glare styles
      Object.assign(glareElement.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        borderRadius: 'inherit'
      });

      Object.assign(glareElementInner.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
        transform: 'rotate(0deg) translate(-50%, -50%)',
        transformOrigin: '0% 0%',
        opacity: '0'
      });
    }

    // Add event listeners
    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseleave', onMouseLeave);

    // Cleanup function
    return () => {
      if (element) {
        element.removeEventListener('mouseenter', onMouseEnter);
        element.removeEventListener('mousemove', onMouseMove);
        element.removeEventListener('mouseleave', onMouseLeave);
        
        // Remove glare elements
        const glareElement = element.querySelector('.js-tilt-glare');
        if (glareElement) {
          glareElement.remove();
        }
      }
    };
  }, []);

  return elementRef;
};