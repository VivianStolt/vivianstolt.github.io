// Services for handling API calls and data processing
export const postService = {
  async fetchPosts() {
    try {
      // First try to get posts from API
      const response = await fetch('/api/posts');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.posts.length > 0) {
          return data.posts;
        }
      }
    } catch (error) {
      console.warn('API posts not available, falling back to local files:', error);
    }

    // Fallback to loading local post files
    return await this.loadLocalPosts();
  },

  async loadLocalPosts() {
    const posts = [];
    const postFiles = [
      '2025-09-26-0.html',
      '2025-09-26-1.html',
      '2025-09-26-2.html',
      '2025-09-26-3.html'
    ];

    for (const filename of postFiles) {
      try {
        const response = await fetch(`./posts/${filename}`);
        if (response.ok) {
          const html = await response.text();
          const post = this.parsePostFromHtml(html, filename);
          if (post) {
            posts.push(post);
          }
        }
      } catch (error) {
        console.warn(`Failed to load post file ${filename}:`, error);
      }
    }

    return posts;
  },

  parsePostFromHtml(html, filename) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract post content from LinkedIn HTML structure
    const postTextElement = doc.querySelector('.update-components-text .break-words, .feed-shared-update-v2__description .break-words, .update-components-update-v2__commentary .break-words');
    let postText = '';
    
    if (postTextElement) {
      // Get text content and clean up LinkedIn HTML artifacts
      postText = postTextElement.textContent?.trim()
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/hashtag/g, '') // Remove "hashtag" text
        .replace(/#(\w+)/g, '#$1') // Clean up hashtags
        .trim();
    }
    
    // Try to find images (prefer real post media over avatars/reaction icons)
    // 1) Video poster image
    const videoEl = doc.querySelector('video[poster]');
    const videoPoster = videoEl?.getAttribute('poster') || null;

    // 2) Background poster used by LinkedIn's video.js player
    const bgPosterEl = doc.querySelector('.vjs-poster, .vjs-poster-background');
    let bgPoster = null;
    if (bgPosterEl) {
      const styleAttr = bgPosterEl.getAttribute('style') || '';
      const match = styleAttr.match(/background-image:\s*url\(\"?([^\)"]+)\"?\)/i);
      if (match && match[1]) bgPoster = match[1];
    }

    // 3) Regular feed images (exclude profile pics)
    const imgEl = doc.querySelector('img[src*="feedshare"], img[src*="media.licdn.com"]:not([src*="profile-displayphoto"])');
    const imgSrc = imgEl?.getAttribute('src') || null;

    const postImage = videoPoster || bgPoster || imgSrc || null;
    
    // Extract date from filename
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // Skip if no meaningful content found
    if (!postText || postText.length < 10) {
      console.warn(`No meaningful content found in ${filename}`);
      return null;
    }

    return {
      id: filename.replace('.html', ''),
      date: this.formatDate(date),
      text: postText.length > 280 ? postText.substring(0, 280) + '...' : postText,
      image: postImage,
      title: `LinkedIn Post - ${this.formatDate(date)}`,
      fullText: postText // Keep full text for modal view
    };
  },

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }
};

export const contactService = {
  async submitForm(formData) {
    try {
      // Try API endpoint first
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message };
      }
    } catch (error) {
      console.warn('API contact endpoint not available, falling back to Formspree:', error);
    }

    // Fallback to Formspree
    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => {
      formDataObj.append(key, formData[key]);
    });

    const response = await fetch('https://formspree.io/f/mdkznpbz', {
      method: 'POST',
      body: formDataObj,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      return { success: true, message: 'Thank you! Message sent successfully.' };
    } else {
      throw new Error('Failed to send message');
    }
  }
};