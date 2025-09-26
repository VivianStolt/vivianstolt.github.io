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
            
            // Since we can't directly list directory contents in browser,
            // we'll try to load files with expected naming pattern
            for (let i = 0; i < 10; i++) {
                const today = new Date();
                const dateStr = today.toISOString().split('T')[0];
                
                try {
                    const response = await fetch(`./posts/${dateStr}-${i}.html`);
                    if (response.ok) {
                        const html = await response.text();
                        postFiles.push({
                            filename: `${dateStr}-${i}.html`,
                            content: html,
                            date: dateStr
                        });
                    }
                } catch (error) {
                    // File doesn't exist, continue
                }
            }
            
            // If no posts found with today's date, try recent dates
            if (postFiles.length === 0) {
                for (let days = 1; days <= 7; days++) {
                    const date = new Date();
                    date.setDate(date.getDate() - days);
                    const dateStr = date.toISOString().split('T')[0];
                    
                    for (let i = 0; i < 5; i++) {
                        try {
                            const response = await fetch(`./posts/${dateStr}-${i}.html`);
                            if (response.ok) {
                                const html = await response.text();
                                postFiles.push({
                                    filename: `${dateStr}-${i}.html`,
                                    content: html,
                                    date: dateStr
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
        
        return {
            image: imageUrl,
            text: text || 'LinkedIn-postaus',
            date: this.formatDate(postData.date),
            originalHtml: postData.content
        };
    }
    
    createDemoPosts() {
        // Create demo posts for testing
        const demoTexts = [
            'Inspiring day at the tech conference! Amazing insights about the future of web development...',
            'Just completed an exciting project using React and Node.js. The results exceeded expectations...',
            'Sharing some thoughts on modern design trends and user experience best practices...',
            'Great networking event today. Met so many talented professionals in the industry...',
            'Working on a new portfolio project. Excited to share the progress with everyone...',
            'Reflections on continuous learning and professional development in tech...'
        ];
        
        this.posts = demoTexts.map((text, index) => ({
            image: `https://via.placeholder.com/300x200/4a90e2/ffffff?text=Post+${index + 1}`,
            text: text,
            date: this.formatDate(new Date().toISOString().split('T')[0]),
            originalHtml: `<div>${text}</div>`
        }));
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
                            <div class="post-click-hint">Klikkaa avataksesi koko postauksen</div>
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
        const slideWidth = 100 / this.slidesPerView;
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
                    <button class="modal-nav-btn modal-prev">‹ Edellinen</button>
                    <button class="modal-nav-btn modal-next">Seuraava ›</button>
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
