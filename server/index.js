import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/posts', express.static(path.join(__dirname, '../posts')));

// Function to parse LinkedIn posts from HTML files
function parsePostFromHtml(html, filename) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  let postText = '';
  
  // Try to find post text
  const textElement = doc.querySelector('.update-components-text .break-words span[dir="ltr"]') ||
                      doc.querySelector('.update-components-text span[dir="ltr"]') ||
                      doc.querySelector('.update-components-text .break-words') ||
                      doc.querySelector('.feed-shared-text span');
  
  if (textElement) {
    postText = textElement.textContent?.trim()
      .replace(/\s+/g, ' ')
      .replace(/hashtag/g, '')
      .replace(/visually-hidden/g, '')
      .trim();
  }
  
  // Try to find image (prefer real post media over avatars/reaction icons)
  let postImage = null;

  // 1) Video poster image
  const videoEl = doc.querySelector('video[poster]');
  if (videoEl?.getAttribute('poster')) {
    postImage = videoEl.getAttribute('poster');
  }

  // 2) Background poster used by LinkedIn's video.js player
  if (!postImage) {
    const bgPosterEl = doc.querySelector('.vjs-poster, .vjs-poster-background');
    if (bgPosterEl) {
      const styleAttr = bgPosterEl.getAttribute('style') || '';
      const match = styleAttr.match(/background-image:\s*url\(\"?([^\)"]+)\"?\)/i);
      if (match && match[1]) {
        postImage = match[1];
      }
    }
  }

  // 3) Regular feed images (exclude profile pics)
  if (!postImage) {
    const imgEl = doc.querySelector('img[src*="feedshare"], img[src*="media.licdn.com"]:not([src*="profile-displayphoto"])');
    if (imgEl?.getAttribute('src')) {
      postImage = imgEl.getAttribute('src');
    }
  }

  // 4) Celebration/post image as last resort
  if (!postImage) {
    const celebEl = doc.querySelector('.feed-shared-celebration-image img');
    if (celebEl?.getAttribute('src')) {
      postImage = celebEl.getAttribute('src');
    }
  }
  
  // Extract real LinkedIn timestamp from HTML
  let postDate = 'Recently';
  
  // Look for LinkedIn timestamp patterns (5mo, 7mo, 11mo etc.)
  const timeElements = doc.querySelectorAll('.update-components-actor__sub-description');
  for (const timeElement of timeElements) {
    const timeText = timeElement.textContent;
    const timeMatch = timeText.match(/(\d+)mo\s*•/);
    if (timeMatch) {
      const months = parseInt(timeMatch[1]);
      postDate = `${months} months ago`;
      break;
    }
  }

  if (!postText || postText.length < 20) {
    return null;
  }

  return {
    id: filename.replace('.html', ''),
    date: postDate,
    text: postText.length > 300 ? postText.substring(0, 297) + '...' : postText,
    image: postImage,
    title: `LinkedIn Post`,
    fullText: postText
  };
}

function formatDate(dateString) {
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

// Function to load posts from files
function loadLinkedInPosts() {
  const postsDir = path.join(__dirname, '../posts');
  const posts = [];
  
  try {
    const files = fs.readdirSync(postsDir);
    const htmlFiles = files.filter(file => file.endsWith('.html') && !file.includes('no-posts'));
    
    for (const file of htmlFiles) {
      try {
        const filePath = path.join(postsDir, file);
        const html = fs.readFileSync(filePath, 'utf8');
        const post = parsePostFromHtml(html, file);
        
        if (post) {
          posts.push(post);
        }
      } catch (error) {
        console.warn(`Failed to parse post ${file}:`, error.message);
      }
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
  } catch (error) {
    console.error('Error loading posts:', error);
  }
  
  return posts;
}

// API Routes
app.get('/api/posts', (req, res) => {
  try {
    const posts = loadLinkedInPosts();
    
    res.json({
      success: true,
      posts: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
});

app.get('/api/posts/:id', (req, res) => {
  try {
    const postId = req.params.id;
    const posts = loadLinkedInPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
});

app.post('/api/contact', (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    console.log('Contact form submission:', { name, email, message });
    
    res.json({
      success: true,
      message: 'Message received successfully'
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});