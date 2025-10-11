# Vivian Stolt Portfolio - React & Node.js

Modernized portfolio website built with React frontend and Node.js backend.

## 🚀 Features

- **Reusable React Components**: Modular carousel, forms, and buttons
- **Organized SVG Assets**: Separate icon files for easy reuse
- **Component-based Architecture**: Easy to maintain and extend
- **Node.js API Backend**: Serves LinkedIn posts and handles form submissions
- **Responsive Design**: Works on all device sizes
- **Modern CSS**: Component-specific styles with CSS custom properties

## 📁 Project Structure

```
├── src/
│   ├── components/           # Reusable React components
│   │   ├── Button.jsx       # Configurable button component
│   │   ├── Carousel.jsx     # LinkedIn posts carousel
│   │   ├── ContactForm.jsx  # Contact form component
│   │   ├── Icon.jsx         # SVG icon component
│   │   └── *.css           # Component-specific styles
│   ├── assets/
│   │   └── icons/          # SVG icon files
│   ├── styles/
│   │   └── globals.css     # Global styles and CSS variables
│   ├── App.jsx             # Main application component
│   └── main.jsx            # React entry point
├── server/
│   └── index.js            # Express.js server
├── public/                 # Static assets
├── package.json
├── vite.config.js
└── .env
```

## 🛠 Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Development mode** (runs both frontend and backend):
   ```bash
   npm run dev:full
   ```

3. **Run frontend only**:
   ```bash
   npm run dev
   ```

4. **Run backend only**:
   ```bash
   npm run dev:server
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 🎨 Component Usage Examples

### Button Component
```jsx
import { Button } from './components';

// Basic button
<Button variant="primary">Click me</Button>

// Button with icon
<Button variant="carousel-nav" icon="arrow-left" />

// Loading button
<Button loading={true}>Saving...</Button>
```

### Icon Component
```jsx
import { Icon } from './components';

// Basic icon
<Icon name="arrow-left" size={24} />

// Custom styled icon
<Icon name="arrow-right" className="custom-icon" />
```

### Carousel Component
```jsx
import { Carousel } from './components';

const posts = [
  { id: 1, date: '2025-01-15', text: 'Post content...', image: null }
];

<Carousel posts={posts} title="My Posts" />
```

## 🔧 Adding New Icons

1. Add your SVG file to `src/assets/icons/`
2. Use the Icon component: `<Icon name="your-icon-name" />`

## 🌐 API Endpoints

- `GET /api/posts` - Fetch all LinkedIn posts
- `GET /api/posts/:id` - Fetch specific post
- `POST /api/contact` - Submit contact form

## 📱 Responsive Breakpoints

- Mobile: 480px and below
- Tablet: 768px and below
- Desktop: Above 768px

## 🎯 Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start Express server
- `npm run dev:server` - Start Express server with nodemon
- `npm run dev:full` - Run both frontend and backend concurrently

## 🔄 Migration from Original

The original HTML/CSS/JS website has been converted to:

1. **React Components**: All UI elements are now reusable components
2. **Modular CSS**: Styles are organized by component
3. **Separate SVG Assets**: Icons are no longer embedded in CSS
4. **API Integration**: Backend serves data instead of static content
5. **Modern Build System**: Vite for fast development and optimized builds

## 🚀 Deployment

For production deployment:

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your web server
3. Run the server: `npm run server`
4. Configure reverse proxy (nginx/Apache) to serve frontend and proxy API calls

## 📝 Environment Variables

Copy `.env` file and adjust as needed:
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `VITE_API_BASE_URL`: API base URL for frontend