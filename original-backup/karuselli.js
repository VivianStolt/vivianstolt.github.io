class LinkedInCarousel {
    constructor() {
        this.currentSlide = 0;
        this.posts = [];
        this.slidesPerView = 3;
        this.totalSlides = 6; // Maximum posts to show
        
        this.track = document.getElementById('carouselTrack');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.dotsContainer = document.getElementById('carouselDots');
        
        this.init();
    }
    
    async init() {
        await this.loadPosts();
        this.createSlides();
        this.setupEventListeners();
        this.updateCarousel();
    }
    
    async loadPosts() {
        try {
            // Try to load post files from the posts directory
            const postFiles = [];
            
            // Lista mahdollisista tiedostonimistä scraper:n uusien nimeämiskäytäntöjen mukaan
            const possibleTimeTexts = [
                '5-months-ago', '6-months-ago', '7-months-ago', '8-months-ago', '9-months-ago', '10-months-ago', '11-months-ago', '12-months-ago',
                '1-month-ago', '2-months-ago', '3-months-ago', '4-months-ago',
                '1-week-ago', '2-weeks-ago', '3-weeks-ago', '4-weeks-ago',
                '1-day-ago', '2-days-ago', '3-days-ago', '4-days-ago', '5-days-ago', '6-days-ago',
                'unknown-time'
            ];
            
            // Kokeile löytää tiedostoja uusilla nimillä
            for (const timeText of possibleTimeTexts) {
                for (let i = 0; i < 5; i++) {
                    try {
                        const filename = `${timeText}-post-${i}.html`;
                        const response = await fetch(`./posts/${filename}`);
                        if (response.ok) {
                            const html = await response.text();
                            postFiles.push({
                                filename: filename,
                                content: html,
                                timeText: timeText, // Tallennetaan alkuperäinen aikaleima
                                originalDate: this.parseTimeTextToReadable(timeText)
                            });
                        }
                    } catch (error) {
                        // File doesn't exist, continue
                    }
                }
            }
            
            // Jos ei löydy uusia, kokeile vanhoja päivämääränimisiä tiedostoja
            if (postFiles.length === 0) {
                for (let days = 0; days <= 7; days++) {
                    const date = new Date();
                    date.setDate(date.getDate() - days);
                    const dateStr = date.toISOString().split('T')[0];
                    
                    for (let i = 0; i < 10; i++) {
                        try {
                            const filename = `${dateStr}-${i}.html`;
                            const response = await fetch(`./posts/${filename}`);
                            if (response.ok) {
                                const html = await response.text();
                                postFiles.push({
                                    filename: filename,
                                    content: html,
                                    timeText: 'recently', // Placeholder
                                    originalDate: this.formatDate(dateStr)
                                });
                            }
                        } catch (error) {
                            // Continue
                        }
                    }
                }
            }
            
            // Process the loaded posts
            this.posts = postFiles.slice(0, this.totalSlides).map(post => {
                return this.parsePost(post);
            });
            
            // If no posts are found, create demo posts
            if (this.posts.length === 0) {
                this.createDemoPosts();
            }
            
        } catch (error) {
            console.error('Error loading posts:', error);
            this.createDemoPosts();
        }
    }
    
    parseTimeTextToReadable(timeText) {
        // Muunna scraper:n aikaleima luettavaksi muotoon
        const timeMap = {
            '1-month-ago': '1 kuukausi sitten',
            '2-months-ago': '2 kuukautta sitten',
            '3-months-ago': '3 kuukautta sitten',
            '4-months-ago': '4 kuukautta sitten',
            '5-months-ago': '5 kuukautta sitten',
            '6-months-ago': '6 kuukautta sitten',
            '7-months-ago': '7 kuukautta sitten',
            '8-months-ago': '8 kuukautta sitten',
            '9-months-ago': '9 kuukautta sitten',
            '10-months-ago': '10 kuukautta sitten',
            '11-months-ago': '11 kuukautta sitten',
            '12-months-ago': '12 kuukautta sitten',
            '1-week-ago': '1 viikko sitten',
            '2-weeks-ago': '2 viikkoa sitten',
            '3-weeks-ago': '3 viikkoa sitten',
            '4-weeks-ago': '4 viikkoa sitten',
            '1-day-ago': '1 päivä sitten',
            '2-days-ago': '2 päivää sitten',
            '3-days-ago': '3 päivää sitten',
            '4-days-ago': '4 päivää sitten',
            '5-days-ago': '5 päivää sitten',
            '6-days-ago': '6 days ago',
            'unknown-time': 'Time unknown'
        };
        
        return timeMap[timeText] || timeText.replace(/-/g, ' ');
    }
    
    parsePost(postData) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(postData.content, 'text/html');
        
        // Extract image - look for various LinkedIn image selectors
        let imageUrl = null;
        
        // First try to find video poster/thumbnail
        const posterBg = doc.querySelector('.vjs-poster-background');
        if (posterBg && posterBg.style.backgroundImage) {
            const bgImage = posterBg.style.backgroundImage;
            imageUrl = bgImage.match(/url\("?(.+?)"?\)/)?.[1];
        }
        
        // Try video poster attribute
        if (!imageUrl) {
            const video = doc.querySelector('video[poster]');
            if (video) {
                imageUrl = video.getAttribute('poster');
            }
        }
        
        // Try regular images
        if (!imageUrl) {
            const imgSelectors = [
                'img[src*="media.licdn.com"]',
                'img[src*="feedshare"]',
                '.vjs-poster',
                'img[alt*="screenshot"]',
                'img[alt*="photo"]',
                'img'
            ];
            
            for (const selector of imgSelectors) {
                const img = doc.querySelector(selector);
                if (img && img.src && !img.src.includes('profile-displayphoto')) {
                    imageUrl = img.src;
                    break;
                }
            }
        }
        
        // Extract text content - look for the main post text
        let text = '';
        
        // Try to find the main text container
        const mainTextContainer = doc.querySelector('.update-components-text, .feed-shared-inline-show-more-text');
        if (mainTextContainer) {
            // Get the first meaningful text span
            const textSpans = mainTextContainer.querySelectorAll('span[dir="ltr"]');
            for (const span of textSpans) {
                const textContent = span.textContent.trim();
                if (textContent && textContent.length > 20 && !textContent.includes('hashtag')) {
                    text = textContent;
                    break;
                }
            }
        }
        
        // Fallback to other text elements
        if (!text) {
            const textElements = doc.querySelectorAll('span[dir="ltr"], p, div[class*="text"]');
            textElements.forEach(el => {
                const textContent = el.textContent.trim();
                if (textContent && textContent.length > 20 && !textContent.includes('http') && !textContent.includes('…more') && !textContent.includes('hashtag')) {
                    if (!text || textContent.length > text.length) {
                        text = textContent;
                    }
                }
            });
        }
        
        // Limit text length
        text = text.trim();
        if (text.length > 150) {
            text = text.substring(0, 147) + '...';
        }
        
        // Extract timestamp from HTML
        let timeStamp = 'Time unknown';
        
        // Find timestamp in HTML (e.g. "5mo", "7mo", "11mo")
        const timeRegex = /(\d+)mo\s*•|(\d+)\s*months?\s+ago|(\d+)\s*weeks?\s+ago|(\d+)\s*days?\s+ago/i;
        const htmlText = postData.content;
        const timeMatch = htmlText.match(timeRegex);
        
        if (timeMatch) {
            if (timeMatch[1]) { // "5mo" format
                const months = parseInt(timeMatch[1]);
                timeStamp = `${months} months ago`;
            } else if (timeMatch[2]) { // "X months ago" format
                const months = parseInt(timeMatch[2]);
                timeStamp = `${months} months ago`;
            } else if (timeMatch[3]) { // weeks
                const weeks = parseInt(timeMatch[3]);
                timeStamp = `${weeks} weeks ago`;
            } else if (timeMatch[4]) { // days
                const days = parseInt(timeMatch[4]);
                timeStamp = `${days} days ago`;
            }
        } else {
            // Try to find other timestamp formats
            const otherTimeRegex = /(\d+)w\s+|(\d+)d\s+|(\d+)\s*week|(\d+)\s*day/i;
            const otherMatch = htmlText.match(otherTimeRegex);
            if (otherMatch) {
                if (otherMatch[1]) timeStamp = `${otherMatch[1]} weeks ago`;
                else if (otherMatch[2]) timeStamp = `${otherMatch[2]} days ago`;
            }
        }
        
        // If not found in HTML, use scraper's timestamp
        if (timeStamp === 'Time unknown' && postData.originalDate) {
            timeStamp = postData.originalDate;
        }

        return {
            image: imageUrl,
            text: text || 'LinkedIn post',
            date: timeStamp,
            originalHtml: postData.content
        };
    }
    
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('fi-FI', options);
    }
    
    createSlides() {
        this.track.innerHTML = '';
        
        this.posts.forEach((post, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            
            slide.innerHTML = `
                <div class="tilt-wrapper" data-tilt>
                    <div class="post-card" data-post-index="${index}">
                        <div class="post-image-container">
                            ${post.image ? 
                                `<img src="${post.image}" alt="LinkedIn post ${index + 1}" class="post-image">` :
                                `<div class="post-placeholder">
                                    <div class="linkedin-icon">in</div>
                                    <span>LinkedIn Post</span>
                                </div>`
                            }
                            <div class="post-overlay">
                                <div class="post-date">${post.date}</div>
                                <div class="post-text">${post.text}</div>
                                <div class="post-click-hint">Click to open full post</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add click event to open modal
            const postCard = slide.querySelector('.post-card');
            postCard.addEventListener('click', () => this.openModal(index));
            
            this.track.appendChild(slide);
        });
        
        this.createDots();
        this.createModal();
        
        // Initialize VanillaTilt for all tilt wrappers with subtle effect
        setTimeout(() => {
            VanillaTilt.init(document.querySelectorAll('.tilt-wrapper'), {
                max: 8,                // Reduced from 25 to 8 degrees
                speed: 800,           // Slower, more elegant movement
                glare: false,         // Disable glare effect to remove the white shine
                scale: 1.02,          // Very subtle scale on hover
                perspective: 1500,    // More perspective for smoother effect
                transition: true,
                easing: "cubic-bezier(.03,.98,.52,.99)"
            });
        }, 100); // Small delay to ensure DOM is ready
    }
    
    createDots() {
        this.dotsContainer.innerHTML = '';
        const totalDots = Math.ceil(this.posts.length / this.slidesPerView);
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
        
        this.updateDots();
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Touch/swipe support
        let startX = null;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', (e) => {
            if (!startX) return;
            
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            startX = null;
        });
    }
    
    prevSlide() {
        const maxSlide = Math.ceil(this.posts.length / this.slidesPerView) - 1;
        this.currentSlide = this.currentSlide > 0 ? this.currentSlide - 1 : maxSlide;
        this.updateCarousel();
    }
    
    nextSlide() {
        const maxSlide = Math.ceil(this.posts.length / this.slidesPerView) - 1;
        this.currentSlide = this.currentSlide < maxSlide ? this.currentSlide + 1 : 0;
        this.updateCarousel();
    }
    
    goToSlide(slideIndex) {
        this.currentSlide = slideIndex;
        this.updateCarousel();
    }
    
    updateCarousel() {
        const translateX = -this.currentSlide * 100;
        
        this.track.style.transform = `translateX(${translateX}%)`;
        this.updateDots();
        this.updateButtons();
    }
    
    updateDots() {
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
        
        // Move liquid dot to current position for gooey effect
        this.animateLiquidDot();
    }
    
    animateLiquidDot() {
        const dotWidth = 20; // Match CSS: width: 20px
        const dotGap = 16 * 0.7; // 0.7 * 1rem (matching CSS gap calculation)
        const totalWidth = dotWidth + dotGap;
        const translateX = this.currentSlide * totalWidth;
        
        // Set CSS custom property for the liquid dot position
        this.dotsContainer.style.setProperty('--liquid-x', `${translateX}px`);
    }
    
    updateButtons() {
        const maxSlide = Math.ceil(this.posts.length / this.slidesPerView) - 1;
        this.prevBtn.disabled = this.currentSlide === 0;
        this.nextBtn.disabled = this.currentSlide === maxSlide;
    }
    
    createModal() {
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'linkedin-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-body">
                    <div class="modal-post-content"></div>
                </div>
                <div class="modal-navigation">
                    <button class="modal-nav-btn modal-prev">‹ Previous</button>
                    <button class="modal-nav-btn modal-next">Next ›</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        
        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');
        const prevBtn = modal.querySelector('.modal-prev');
        const nextBtn = modal.querySelector('.modal-next');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        backdrop.addEventListener('click', () => this.closeModal());
        prevBtn.addEventListener('click', () => this.modalNavigate(-1));
        nextBtn.addEventListener('click', () => this.modalNavigate(1));
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    openModal(postIndex) {
        this.currentModalPost = postIndex;
        this.updateModalContent();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    modalNavigate(direction) {
        const newIndex = this.currentModalPost + direction;
        if (newIndex >= 0 && newIndex < this.posts.length) {
            this.currentModalPost = newIndex;
            this.updateModalContent();
        }
    }
    
    updateModalContent() {
        const post = this.posts[this.currentModalPost];
        const modalBody = this.modal.querySelector('.modal-post-content');
        
        // Clean and format the original HTML for better display
        const parser = new DOMParser();
        const doc = parser.parseFromString(post.originalHtml, 'text/html');
        
        // Remove unnecessary elements
        const elementsToRemove = [
            '.feed-shared-control-menu',
            '.social-details-social-counts',
            '.feed-shared-social-action-bar',
            '.content-analytics-entry-point',
            'button',
            '.artdeco-dropdown'
        ];
        
        elementsToRemove.forEach(selector => {
            doc.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        modalBody.innerHTML = `
            <div class="modal-post">
                <div class="modal-post-header">
                    <div class="post-author-info">
                        <div class="author-details">
                            <h3>Vivian Stolt</h3>
                            <p>Front-End Designer @ Niocell | MA in Collaborative and Industrial Design</p>
                            <span class="post-date-modal">${post.date}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-post-body">
                    ${post.image ? `<img src="${post.image}" alt="LinkedIn post" class="modal-post-image">` : ''}
                    <div class="modal-post-text">
                        ${this.extractFullText(doc)}
                    </div>
                </div>
            </div>
        `;
        
        // Update navigation buttons
        const prevBtn = this.modal.querySelector('.modal-prev');
        const nextBtn = this.modal.querySelector('.modal-next');
        
        prevBtn.disabled = this.currentModalPost === 0;
        nextBtn.disabled = this.currentModalPost === this.posts.length - 1;
    }
    
    extractFullText(doc) {
        // Extract the main text content from LinkedIn post
        const textContainer = doc.querySelector('.update-components-text');
        if (textContainer) {
            // Clean up the text and format it nicely
            const text = textContainer.textContent
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/•/g, '•') // Keep bullet points
                .trim();
            
            // Split into paragraphs and format
            const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
            return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
        }
        
        return `<p>${this.posts[this.currentModalPost].text}</p>`;
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LinkedInCarousel();
});
